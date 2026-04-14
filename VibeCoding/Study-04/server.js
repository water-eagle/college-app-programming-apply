const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Gemini 3 설정
const API_KEY = process.env.API_KEY;
const MODEL_NAME = 'gemini-3-flash-preview';

// --- 인증 미들웨어 ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: '인증 토큰이 필요합니다.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        req.user = user;
        next();
    });
};

// --- 인증 API ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        const userId = result.insertId;
        await pool.execute('INSERT INTO user_profiles (user_id) VALUES (?)', [userId]);

        res.status(201).json({ message: '회원가입 성공' });
    } catch (error) {
        console.error('Signup Error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: '이미 존재하는 사용자명 또는 이메일입니다.' });
        }
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) return res.status(400).json({ error: '사용자를 찾을 수 없습니다.' });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: '비밀번호가 틀렸습니다.' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- 프로필 및 선호도 API ---
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const [profiles] = await pool.execute(
            'SELECT u.username, u.email, p.dietary_preference FROM users u JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?',
            [req.user.id]
        );
        res.json(profiles[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/profile/preferences', authenticateToken, async (req, res) => {
    try {
        const { preference } = req.body;
        await pool.execute(
            'UPDATE user_profiles SET dietary_preference = ? WHERE user_id = ?',
            [preference, req.user.id]
        );
        res.json({ message: '선호도 업데이트 성공' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 레시피 저장 API ---
app.post('/api/profile/save', authenticateToken, async (req, res) => {
    try {
        const { title, summary, prepTime, difficulty, steps } = req.body;
        await pool.execute(
            'INSERT INTO saved_recipes (user_id, title, summary, prep_time, difficulty, steps) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, title, summary, prepTime, difficulty, JSON.stringify(steps)]
        );
        res.json({ message: '레시피 저장 성공' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/profile/saved-recipes', authenticateToken, async (req, res) => {
    try {
        const [recipes] = await pool.execute(
            'SELECT * FROM saved_recipes WHERE user_id = ? ORDER BY saved_at DESC',
            [req.user.id]
        );
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/profile/save/:id', authenticateToken, async (req, res) => {
    try {
        await pool.execute('DELETE FROM saved_recipes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: '레시피 삭제 성공' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 기존 API (Gemini 통합) ---

app.post('/api/analyze', async (req, res) => {
    console.log('--- 식재료 분석 시작 ---');
    try {
        const { base64Image, mimeType } = req.body;
        if (!API_KEY) {
            console.error('API_KEY missing');
            return res.status(500).json({ error: 'API_KEY가 설정되지 않았습니다.' });
        }

        const prompt = "이 냉장고 사진에서 보이는 식재료들을 모두 나열해줘. 결과는 쉼표로 구분된 목록으로만 응답해줘. 예: 사과, 우유, 달걀";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        
        console.log('Gemini API에 요청 전송 중...');
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Image
                            },
                            mediaResolution: { level: "media_resolution_high" }
                        }
                    ]
                }],
                generationConfig: { temperature: 1.0 }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google API Error Response:', errorText);
            return res.status(response.status).json({ error: `Google API 오류: ${errorText}` });
        }

        const data = await response.json();
        console.log('Gemini API 응답 수신 성공');

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const resultText = data.candidates[0].content.parts[0].text;
            console.log('분석 결과:', resultText);
            res.json({ result: resultText });
        } else {
            console.error('Unexpected Response Structure:', JSON.stringify(data));
            res.status(500).json({ error: 'API 응답 구조가 예상과 다릅니다.' });
        }

    } catch (error) {
        console.error('Analyze API Catch Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/recipes', async (req, res) => {
    console.log('--- 레시피 생성 시작 ---');
    try {
        const { ingredients } = req.body;
        let dietaryPreference = 'None';

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const [profiles] = await pool.execute('SELECT dietary_preference FROM user_profiles WHERE user_id = ?', [decoded.id]);
                if (profiles.length > 0) dietaryPreference = profiles[0].dietary_preference;
            } catch (e) { console.error('Token verification failed for recipes:', e.message); }
        }

        const prefPrompt = dietaryPreference !== 'None' ? `사용자의 식단 선호도는 "${dietaryPreference}"입니다. 이를 반드시 고려해줘.` : "";
        const prompt = `다음 식재료들을 활용한 레시피 3가지를 추천해줘: ${ingredients}. 
        ${prefPrompt}
        사용자가 가진 재료를 최대한 활용하고, 부족한 재료는 최소화해줘.
        응답은 반드시 아래와 같은 JSON 형식으로만 해줘:
        {
          "recipes": [
            {
              "title": "레시피 제목",
              "summary": "간단한 설명",
              "prepTime": "조리 시간",
              "difficulty": "난이도 (상/중/하)",
              "steps": ["1단계 설명", "2단계 설명", ...]
            }
          ]
        }`;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        
        console.log('Gemini API에 레시피 요청 중...');
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 1.0,
                    response_mime_type: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Recipe API Error Response:', errorText);
            return res.status(response.status).json({ error: `Google API 오류: ${errorText}` });
        }

        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        res.json(jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(resultText));
        console.log('레시피 생성 완료');

    } catch (error) {
        console.error('Recipe API Catch Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
