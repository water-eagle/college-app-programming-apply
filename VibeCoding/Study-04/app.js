// DOM 요소 - 기존
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const imagePreview = document.getElementById("image-preview");
const analyzeBtn = document.getElementById("analyze-btn");
const findRecipesBtn = document.getElementById("find-recipes-btn");
const loadingSpinner = document.getElementById("loading-spinner");
const ingredientList = document.getElementById("ingredient-list");
const ingredientTitle = document.getElementById("ingredient-title");
const recipeContainer = document.getElementById("recipe-container");

// DOM 요소 - 인증 & 네비게이션
const authNav = document.getElementById("auth-nav");
const userNav = document.getElementById("user-nav");
const welcomeMsg = document.getElementById("welcome-msg");
const loginNavBtn = document.getElementById("login-nav-btn");
const signupNavBtn = document.getElementById("signup-nav-btn");
const logoutBtn = document.getElementById("logout-btn");
const myRecipesNavBtn = document.getElementById("my-recipes-nav-btn");
const profileNavBtn = document.getElementById("profile-nav-btn");

// DOM 요소 - 섹션
const mainSection = document.getElementById("main-section");
const myRecipesSection = document.getElementById("my-recipes-section");
const profileSection = document.getElementById("profile-section");
const backToMainBtn = document.getElementById("back-to-main-btn");
const backToMainFromProfileBtn = document.getElementById("back-to-main-from-profile-btn");
const savedRecipesContainer = document.getElementById("saved-recipes-container");

// DOM 요소 - 모달 & 폼
const authModal = document.getElementById("auth-modal");
const closeAuthModal = document.getElementById("close-auth-modal");
const loginFormContainer = document.getElementById("login-form-container");
const signupFormContainer = document.getElementById("signup-form-container");
const goToSignup = document.getElementById("goToSignup");
const goToLogin = document.getElementById("goToLogin");

const recipeModal = document.getElementById("recipe-modal");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalSteps = document.getElementById("modal-steps");
const closeRecipeModal = document.getElementById("close-recipe-modal");
const saveCurrentRecipeBtn = document.getElementById("save-current-recipe-btn");

// DOM 요소 - 추가
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const toastIcon = document.getElementById("toast-icon");

// 상태 변수
let selectedFile = null;
let detectedIngredients = "";
let currentRecipe = null;
let token = localStorage.getItem("token");

// --- 토스트 메시지 함수 ---
function showToast(message, type = "success") {
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    toastIcon.textContent = type === "success" ? "✅" : "❌";
    
    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

// 초기화
function init() {
    updateAuthUI();
    if (token) fetchUserProfile();
    
    // 로고 클릭 시 홈으로 이동
    const logo = document.querySelector(".logo");
    if (logo) {
        logo.style.cursor = "pointer";
        logo.onclick = () => showSection("main");
    }
}

// --- 인증 UI 업데이트 ---
function updateAuthUI() {
    if (token) {
        authNav.style.display = "none";
        userNav.style.display = "flex";
        welcomeMsg.textContent = `${localStorage.getItem("username")}님 반가워요! 👋`;
        saveCurrentRecipeBtn.style.display = "block";
    } else {
        authNav.style.display = "flex";
        userNav.style.display = "none";
        saveCurrentRecipeBtn.style.display = "none";
    }
}

// --- 네비게이션 이벤트 ---
loginNavBtn.onclick = () => {
    authModal.style.display = "block";
    loginFormContainer.style.display = "block";
    signupFormContainer.style.display = "none";
};

signupNavBtn.onclick = () => {
    authModal.style.display = "block";
    loginFormContainer.style.display = "none";
    signupFormContainer.style.display = "block";
};

closeAuthModal.onclick = () => (authModal.style.display = "none");

document.getElementById("go-to-signup").onclick = (e) => {
    e.preventDefault();
    loginFormContainer.style.display = "none";
    signupFormContainer.style.display = "block";
};

document.getElementById("go-to-login").onclick = (e) => {
    e.preventDefault();
    loginFormContainer.style.display = "block";
    signupFormContainer.style.display = "none";
};

logoutBtn.onclick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    token = null;
    updateAuthUI();
    showSection("main");
    location.reload();
};

myRecipesNavBtn.onclick = () => {
    showSection("my-recipes");
    fetchSavedRecipes();
};

profileNavBtn.onclick = () => {
    showSection("profile");
    fetchUserProfile();
};

backToMainBtn.onclick = () => showSection("main");
backToMainFromProfileBtn.onclick = () => showSection("main");

function showSection(sectionId) {
    mainSection.style.display = sectionId === "main" ? "block" : "none";
    myRecipesSection.style.display = sectionId === "my-recipes" ? "block" : "none";
    profileSection.style.display = sectionId === "profile" ? "block" : "none";
}

// --- 인증 처리 ---
const loginSubmitBtn = document.getElementById("login-submit-btn");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");

const signupSubmitBtn = document.getElementById("signup-submit-btn");
const signupUsernameInput = document.getElementById("signup-username");
const signupEmailInput = document.getElementById("signup-email");
const signupPasswordInput = document.getElementById("signup-password");

async function handleLogin() {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            token = data.token;
            authModal.style.display = "none";
            updateAuthUI();
            showToast("로그인되었습니다! 환영합니다.");
        } else {
            showToast(data.error || "이메일이나 비밀번호를 확인해주세요.", "error");
        }
    } catch (e) { showToast("로그인 중 오류가 발생했습니다.", "error"); }
}

async function handleSignup() {
    const username = signupUsernameInput.value;
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;

    try {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            showToast("회원가입 성공! 이제 로그인 해주세요.");
            loginFormContainer.style.display = "block";
            signupFormContainer.style.display = "none";
        } else {
            showToast(data.error || "회원가입에 실패했습니다.", "error");
        }
    } catch (e) { showToast("회원가입 중 오류가 발생했습니다.", "error"); }
}

loginSubmitBtn.onclick = handleLogin;

[loginEmailInput, loginPasswordInput].forEach(input => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleLogin();
    });
});

signupSubmitBtn.onclick = handleSignup;

[signupUsernameInput, signupEmailInput, signupPasswordInput].forEach(input => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSignup();
    });
});

// --- 프로필 & 저장 기능 ---
async function fetchUserProfile() {
    try {
        const res = await fetch("/api/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        document.getElementById("dietary-preference").value = data.dietary_preference;
    } catch (e) { console.error(e); }
}

document.getElementById("save-preferences-btn").onclick = async () => {
    const preference = document.getElementById("dietary-preference").value;
    try {
        const res = await fetch("/api/profile/preferences", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ preference })
        });
        if (res.ok) showToast("식단 설정이 저장되었습니다.");
    } catch (e) { showToast("저장 중 오류가 발생했습니다.", "error"); }
};

saveCurrentRecipeBtn.onclick = async () => {
    if (!currentRecipe || !token) return;
    try {
        const res = await fetch("/api/profile/save", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(currentRecipe)
        });
        if (res.ok) {
            showToast("레시피가 저장되었습니다! ❤️");
            saveCurrentRecipeBtn.textContent = "저장됨 ✅";
            saveCurrentRecipeBtn.classList.add("saved");
        }
    } catch (e) { showToast("저장에 실패했습니다.", "error"); }
};

async function fetchSavedRecipes() {
    try {
        const res = await fetch("/api/profile/saved-recipes", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const recipes = await res.json();
        renderSavedRecipes(recipes);
    } catch (e) { console.error(e); }
}

function renderSavedRecipes(recipes) {
    savedRecipesContainer.innerHTML = "";
    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `
            <div class="recipe-info">
                <div class="recipe-title">${recipe.title}</div>
                <div class="recipe-meta">⏱ ${recipe.prep_time} | 📊 ${recipe.difficulty}</div>
                <div class="recipe-summary">${recipe.summary}</div>
                <button class="delete-recipe-btn" onclick="deleteRecipe(event, ${recipe.id})">삭제</button>
            </div>
        `;
        card.onclick = () => {
            const recipeData = {...recipe, prepTime: recipe.prep_time};
            openRecipeModal(recipeData);
        };
        savedRecipesContainer.appendChild(card);
    });
}

window.deleteRecipe = async (event, id) => {
    event.stopPropagation();
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
        const res = await fetch(`/api/profile/save/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            showToast("레시피가 삭제되었습니다.");
            fetchSavedRecipes();
        }
    } catch (e) { showToast("삭제 중 오류가 발생했습니다.", "error"); }
};

// --- 기존 기능 (분석 & 추천) ---

dropZone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.style.borderColor = "#4a90e2"; });
dropZone.addEventListener("dragleave", () => { dropZone.style.borderColor = "#ccc"; });
dropZone.addEventListener("drop", (e) => { e.preventDefault(); dropZone.style.borderColor = "#ccc"; handleFiles(e.dataTransfer.files); });

function handleFiles(files) {
    if (files.length > 0) {
        selectedFile = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
            const instructionText = dropZone.querySelector("p");
            if (instructionText) instructionText.style.display = "none";
            const uploadIcon = dropZone.querySelector(".upload-icon");
            if (uploadIcon) uploadIcon.style.display = "none";
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(selectedFile);
    }
}

analyzeBtn.onclick = async () => {
    if (!selectedFile) return;
    
    // UI 업데이트: 로딩 및 스캔 시작
    loadingSpinner.style.display = "flex";
    loadingSpinner.querySelector("p").textContent = "AI가 식재료를 분석하고 있어요...";
    dropZone.classList.add("scanning");
    analyzeBtn.disabled = true;
    
    try {
        const resizedBase64 = await resizeImage(selectedFile, 1024, 1024);
        const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                base64Image: resizedBase64.split(",")[1], 
                mimeType: "image/jpeg"
            })
        });
        const data = await res.json();
        
        if (data.result) {
            detectedIngredients = data.result;
            displayIngredients(data.result);
            findRecipesBtn.style.display = "flex";
            ingredientTitle.style.display = "block";
            showToast("식재료 분석 완료!");
        } else {
            showToast("식재료를 찾지 못했습니다. 다시 시도해 주세요.", "error");
        }
    } catch (e) { 
        console.error("Analysis Error:", e);
        showToast("분석 중 오류가 발생했습니다.", "error"); 
    }
    finally { 
        loadingSpinner.style.display = "none"; 
        dropZone.classList.remove("scanning");
        analyzeBtn.disabled = false; 
    }
};

async function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% 품질로 JPEG 변환
            };
        };
    });
}

findRecipesBtn.onclick = async () => {
    if (!detectedIngredients) return;
    
    loadingSpinner.style.display = "flex";
    loadingSpinner.querySelector("p").textContent = "맛있는 레시피를 생각하고 있어요... 👩‍🍳";
    findRecipesBtn.disabled = true;
    
    try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/recipes", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ ingredients: detectedIngredients })
        });
        const data = await res.json();
        
        if (data.recipes && data.recipes.length > 0) {
            renderRecipes(data.recipes);
            showToast("맞춤 레시피가 준비되었습니다!");
            // 스크롤 이동
            setTimeout(() => {
                recipeContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            showToast("추천할 레시피를 찾지 못했습니다.", "error");
        }
    } catch (e) { 
        showToast("레시피 추천 중 오류가 발생했습니다.", "error"); 
    }
    finally { 
        loadingSpinner.style.display = "none"; 
        findRecipesBtn.disabled = false; 
    }
};

function displayIngredients(text) {
    ingredientList.innerHTML = "";
    const ingredients = text.split(",").map(i => i.trim());
    ingredients.forEach((item, index) => {
        if (item) {
            setTimeout(() => {
                const tag = document.createElement("span");
                tag.className = "ingredient-tag";
                tag.textContent = item;
                ingredientList.appendChild(tag);
            }, index * 100);
        }
    });
}

function renderRecipes(recipes) {
    recipeContainer.innerHTML = "";
    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `
            <div class="recipe-info">
                <div class="recipe-title">${recipe.title}</div>
                <div class="recipe-meta">⏱ ${recipe.prepTime} | 📊 ${recipe.difficulty}</div>
                <div class="recipe-summary">${recipe.summary}</div>
            </div>
        `;
        card.onclick = () => openRecipeModal(recipe);
        recipeContainer.appendChild(card);
    });
}

function openRecipeModal(recipe) {
    currentRecipe = recipe;
    modalTitle.textContent = recipe.title;
    modalMeta.textContent = `⏱ ${recipe.prepTime} | 📊 난이도: ${recipe.difficulty}`;
    modalSteps.innerHTML = "";
    
    // 저장 버튼 상태 초기화
    saveCurrentRecipeBtn.textContent = "이 레시피 저장하기 ⭐";
    saveCurrentRecipeBtn.classList.remove("saved");
    
    // steps 데이터가 문자열인 경우 파싱 (DB에서 가져온 경우 대비)
    let steps = recipe.steps;
    if (typeof steps === "string") {
        try {
            steps = JSON.parse(steps);
        } catch (e) {
            console.error("Steps parsing error:", e);
            steps = [];
        }
    }
    
    if (Array.isArray(steps)) {
        steps.forEach((step, i) => {
            const div = document.createElement("div");
            div.className = "step-item";
            div.innerHTML = `<span class="step-number">${i + 1}.</span> ${step}`;
            modalSteps.appendChild(div);
        });
    }
    recipeModal.style.display = "block";
}

closeRecipeModal.onclick = () => (recipeModal.style.display = "none");
window.onclick = (e) => {
    if (e.target == recipeModal) recipeModal.style.display = "none";
    if (e.target == authModal) authModal.style.display = "none";
};

init();
