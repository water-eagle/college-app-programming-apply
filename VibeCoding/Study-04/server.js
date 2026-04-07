const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// .env 파일 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '50mb' })); 

// Gemini 3 설정 (공식 문서 기반)
const API_KEY = process.env.API_KEY;
const MODEL_NAME = 'gemini-3-flash-preview'; 

// 기본 경로
app.use(express.static('.'));

// 이미지 분석 엔드포인트
app.post('/api/analyze', async (req, res) => {
    try {
        const { base64Image, mimeType } = req.body;

        if (!API_KEY) {
            console.error('API_KEY is missing in .env');
            return res.status(500).json({ error: 'API_KEY가 .env 파일에 설정되지 않았습니다.' });
        }

        const prompt = "이 냉장고 사진에서 보이는 식재료들을 모두 나열해줘. 결과는 쉼표로 구분된 목록으로만 응답해줘. 예: 사과, 우유, 달걀";
        
        // Gemini 3 API 호출 (v1beta 또는 v1alpha 가능, 여기서는 v1beta 사용)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inlineData: { // Gemini 3에서는 camelCase 'inlineData' 권장
                                mimeType: mimeType,
                                data: base64Image
                            },
                            // 미디어 해상도 설정 추가 (선택 사항이나 정확도 향상을 위해)
                            mediaResolution: {
                                level: "media_resolution_high"
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 1.0 // Gemini 3 권장값
                }
            })
        });

        // 응답 상태 확인
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google API Error Response:', errorText);
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch (e) {
                return res.status(response.status).json({ error: `Google API Error (${response.status}): ${errorText}` });
            }
            return res.status(response.status).json({ error: errorJson.error?.message || 'Google API 호출 중 오류가 발생했습니다.' });
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(404).json({ error: '결과를 찾을 수 없습니다.' });
        }

        const resultText = data.candidates[0].content.parts[0].text;
        res.json({ result: resultText });

    } catch (error) {
        console.error('Server Internal Error:', error);
        res.status(500).json({ error: '서버 내부 오류가 발생했습니다: ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`브라우저에서 http://localhost:${PORT} 에 접속하세요.`);
});
