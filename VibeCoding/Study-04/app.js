const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const ingredientList = document.getElementById('ingredient-list');

let selectedFile = null;

// 파일 선택 처리
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#4a90e2';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#ccc';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        selectedFile = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(selectedFile);
    }
}

// 분석 버튼 클릭 처리
analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    loadingSpinner.style.display = 'block';
    analyzeBtn.disabled = true;
    ingredientList.innerHTML = '';

    try {
        const base64Data = await fileToBase64(selectedFile);
        
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                base64Image: base64Data,
                mimeType: selectedFile.type
            })
        });

        // JSON 파싱 전 응답 상태 확인 (Unexpected end of JSON input 방지)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: '알 수 없는 서버 오류가 발생했습니다.' }));
            throw new Error(errorData.error || `서버 오류 (${response.status})`);
        }

        const data = await response.json();
        displayResults(data.result);
    } catch (error) {
        console.error('Error:', error);
        alert('분석 중 오류가 발생했습니다: ' + error.message);
    } finally {
        loadingSpinner.style.display = 'none';
        analyzeBtn.disabled = false;
    }
});

async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

function displayResults(text) {
    const ingredients = text.split(',').map(item => item.trim());
    ingredients.forEach(item => {
        if (item) {
            const tag = document.createElement('span');
            tag.className = 'ingredient-tag';
            tag.textContent = item;
            ingredientList.appendChild(tag);
        }
    });
}
