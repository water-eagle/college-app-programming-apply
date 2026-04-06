---
name: quiz-add
description: 새로운 퀴즈 문제를 추가하는 스킬 ($1: 카테고리, $2: 난이도)
---

# Quiz Add Skill

이 스킬은 지정된 카테고리와 난이도에 맞는 새로운 퀴즈 문제를 생성하여 `quiz_data.json`에 추가합니다. 문제 생성 시 반드시 **퀴즈 문제 교차 검증 가이드라인**을 준수해야 합니다.

## Workflow

1.  **Preparation**: 입력된 카테고리($1)와 난이도($2)를 확인합니다.
2.  **Validation Check**: 다음 가이드라인을 엄격히 준수하여 문제를 설계합니다.
    - **정답의 유일성**: 해석의 여지 없이 정답이 하나뿐인가?
    - **최상급 표현의 객관성**: '가장', '최초' 등의 표현 사용 시 측정 기준(예: 면적, 연도)을 명시했는가?
    - **시간/범위 명확성**: 변할 수 있는 정보는 기준 시점(예: 2024년 기준)을 명시했는가?
    - **교차 검증**: 정보의 출처가 확실하며 주류 학설에 부합하는가?
3.  **Drafting**: 문제(question), 보기 4개(options), 정답 인덱스(answer, 0-3), 해설(explanation)을 작성합니다.
4.  **Append**: `quiz_data.json`의 마지막 ID를 확인하여 다음 번호를 부여하고 데이터를 추가합니다.

### Execution

다음 명령어를 통해 새로운 문제를 추가할 수 있습니다 (내용은 적절히 수정):
```bash
# 마지막 ID 확인
last_id=$(jq '.[-1].id' quiz_data.json)
next_id=$((last_id + 1))

# 신규 데이터 추가 (예시 구조)
jq ". += [{
  id: $next_id,
  category: \"$1\",
  difficulty: \"$2\",
  question: \"[질문 내용]\",
  options: [\"보기1\", \"보기2\", \"보기3\", \"보기4\"],
  answer: 0,
  explanation: \"[상세 해설 및 검증 근거]\"
}]" quiz_data.json > temp.json && mv temp.json quiz_data.json
```
