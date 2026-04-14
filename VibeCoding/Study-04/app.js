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

// 상태 변수
let selectedFile = null;
let detectedIngredients = "";
let currentRecipe = null;
let token = localStorage.getItem("token");

// 초기화
function init() {
    updateAuthUI();
    if (token) fetchUserProfile();
}

// --- 인증 UI 업데이트 ---
function updateAuthUI() {
    if (token) {
        authNav.style.display = "none";
        userNav.style.display = "flex";
        welcomeMsg.textContent = `${localStorage.getItem("username")}님 환영합니다!`;
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
document.getElementById("login-submit-btn").onclick = async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

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
            alert("로그인 성공!");
        } else {
            alert(data.error);
        }
    } catch (e) { alert("로그인 오류"); }
};

document.getElementById("signup-submit-btn").onclick = async () => {
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            alert("회원가입 성공! 로그인 해주세요.");
            loginFormContainer.style.display = "block";
            signupFormContainer.style.display = "none";
        } else {
            alert(data.error);
        }
    } catch (e) { alert("회원가입 오류"); }
};

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
        if (res.ok) alert("설정이 저장되었습니다.");
    } catch (e) { alert("저장 실패"); }
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
        if (res.ok) alert("레시피가 저장되었습니다!");
    } catch (e) { alert("저장 실패"); }
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
        if (res.ok) fetchSavedRecipes();
    } catch (e) { alert("삭제 실패"); }
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
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(selectedFile);
    }
}

analyzeBtn.onclick = async () => {
    if (!selectedFile) return;
    loadingSpinner.style.display = "block";
    loadingSpinner.querySelector("p").textContent = "식재료 분석 중...";
    analyzeBtn.disabled = true;
    try {
        const base64Data = await fileToBase64(selectedFile);
        const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64Image: base64Data, mimeType: selectedFile.type })
        });
        const data = await res.json();
        detectedIngredients = data.result;
        displayIngredients(data.result);
        findRecipesBtn.style.display = "block";
        ingredientTitle.style.display = "block";
    } catch (e) { alert("분석 오류"); }
    finally { loadingSpinner.style.display = "none"; analyzeBtn.disabled = false; }
};

findRecipesBtn.onclick = async () => {
    if (!detectedIngredients) return;
    loadingSpinner.style.display = "block";
    loadingSpinner.querySelector("p").textContent = "레시피 생성 중...";
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
        renderRecipes(data.recipes);
    } catch (e) { alert("추천 오류"); }
    finally { loadingSpinner.style.display = "none"; findRecipesBtn.disabled = false; }
};

async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (e) => reject(e);
    });
}

function displayIngredients(text) {
    ingredientList.innerHTML = "";
    const ingredients = text.split(",").map(i => i.trim());
    ingredients.forEach(item => {
        if (item) {
            const tag = document.createElement("span");
            tag.className = "ingredient-tag";
            tag.textContent = item;
            ingredientList.appendChild(tag);
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
    recipe.steps.forEach((step, i) => {
        const div = document.createElement("div");
        div.className = "step-item";
        div.innerHTML = `<span class="step-number">${i + 1}.</span> ${step}`;
        modalSteps.appendChild(div);
    });
    recipeModal.style.display = "block";
}

closeRecipeModal.onclick = () => (recipeModal.style.display = "none");
window.onclick = (e) => {
    if (e.target == recipeModal) recipeModal.style.display = "none";
    if (e.target == authModal) authModal.style.display = "none";
};

init();
