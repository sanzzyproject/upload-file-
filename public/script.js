const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileElem');
const statusContainer = document.getElementById('status-container');
const statusText = document.getElementById('status-text');
const resultContainer = document.getElementById('result-container');
const uploadBox = document.querySelector('.upload-box');

// Drag & Drop Events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'), false);
});

dropArea.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

async function uploadFile(file) {
    // Validasi Ukuran (Vercel Serverless Function Limit approx 4.5MB)
    // Jika lebih besar, biasanya perlu upload client-side langsung, tapi di sini kita pakai proxy sesuai request
    if (file.size > 4.5 * 1024 * 1024) {
        alert("Peringatan: Vercel Free Tier membatasi upload body max 4.5MB. File mungkin gagal.");
    }

    uploadBox.classList.add('hidden');
    statusContainer.classList.remove('hidden');
    statusText.innerText = `Mengupload ${file.name}...`;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            showResult(result);
        } else {
            throw new Error(result.error || 'Upload gagal');
        }
    } catch (error) {
        statusText.innerText = "Error: " + error.message;
        statusText.style.color = "var(--error)";
        // Kembalikan tombol reset setelah error
        setTimeout(() => {
            resetApp();
        }, 3000);
    }
}

function showResult(data) {
    statusContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    
    document.getElementById('file-link').value = data.downloadPage;
    document.getElementById('file-name').innerText = data.name || 'File';
    document.getElementById('file-size').innerText = (data.size / 1024 / 1024).toFixed(2) + ' MB';
}

function copyLink() {
    const copyText = document.getElementById("file-link");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    
    const btn = document.getElementById('copy-btn');
    const originalText = btn.innerText;
    btn.innerText = "Copied!";
    setTimeout(() => btn.innerText = originalText, 2000);
}

function resetApp() {
    fileInput.value = '';
    resultContainer.classList.add('hidden');
    statusContainer.classList.add('hidden');
    uploadBox.classList.remove('hidden');
    statusText.style.color = "var(--text-muted)";
}
