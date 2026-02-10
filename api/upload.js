// api/upload.js
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const formidable = require('formidable');

// Non-aktifkan body parser bawaan Vercel agar formidable bisa bekerja
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 1. Parsing file yang dikirim dari Frontend
        const formParse = formidable({});
        const [fields, files] = await formParse.parse(req);
        
        const uploadedFile = files.file?.[0];
        if (!uploadedFile) throw new Error("File tidak ditemukan.");

        console.log(">> 1. Neangan server nu kosong...");
        // Mendapatkan server terbaik
        const serverRes = await axios.get('https://api.gofile.io/servers');
        
        if (serverRes.data.status !== "ok") throw new Error("Gagal meunangkeun server!");
        const server = serverRes.data.data.servers[0].name;
        console.log(`>> Paké server: ${server}`);

        // 2. Upload ke Gofile (Logika Asli Anda)
        console.log(">> 2. Keur ngupload file...");
        const formData = new FormData();
        // Membaca file dari temp directory Vercel
        formData.append('file', fs.createReadStream(uploadedFile.filepath)); 

        const uploadUrl = `https://${server}.gofile.io/contents/uploadfile`;
        const response = await axios.post(uploadUrl, formData, {
            headers: {
                ...formData.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        if (response.data.status === "ok") {
            console.log(">> JOS! File geus jadi link.");
            return res.status(200).json(response.data.data);
        } else {
            throw new Error("Gagal upload euy: " + response.data.status);
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
