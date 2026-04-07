const API_KEY = "API_KEY"; // 사용자가 직접 입력해야 함
const MODEL_NAME = "gemini-1.5-flash";

const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const imagePreview = document.getElementById("image-preview");
const analyzeBtn = document.getElementById("analyze-btn");
const loadingSpinner = document.getElementById("loading-spinner");
const ingredientList = document.getElementById("ingredient-list");

let selectedFile = null;

// 파일 선택 처리
dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  handleFiles(e.target.files);
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#4a90e2";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "#ccc";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#ccc";
  handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
  if (files.length > 0) {
    selectedFile = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
      analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(selectedFile);
  }
}

// 분석 버튼 클릭 처리
analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  if (API_KEY === "YOUR_API_KEY_HERE") {
    alert(
      "API Key를 설정해 주세요! app.js 파일 상단의 API_KEY 변수에 본인의 키를 입력하세요.",
    );
    return;
  }

  loadingSpinner.style.display = "block";
  analyzeBtn.disabled = true;
  ingredientList.innerHTML = "";

  try {
    const base64Data = await fileToBase64(selectedFile);
    const result = await analyzeImage(base64Data);
    displayResults(result);
  } catch (error) {
    console.error("Error:", error);
    alert("분석 중 오류가 발생했습니다: " + error.message);
  } finally {
    loadingSpinner.style.display = "none";
    analyzeBtn.disabled = false;
  }
});

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
}

async function analyzeImage(base64Image) {
  const prompt =
    "이 냉장고 사진에서 보이는 식재료들을 모두 나열해줘. 결과는 쉼표로 구분된 목록으로만 응답해줘. 예: 사과, 우유, 달걀";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: selectedFile.type,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    },
  );

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("결과를 찾을 수 없습니다.");
  }

  return data.candidates[0].content.parts[0].text;
}

function displayResults(text) {
  const ingredients = text.split(",").map((item) => item.trim());
  ingredients.forEach((item) => {
    if (item) {
      const tag = document.createElement("span");
      tag.className = "ingredient-tag";
      tag.textContent = item;
      ingredientList.appendChild(tag);
    }
  });
}
