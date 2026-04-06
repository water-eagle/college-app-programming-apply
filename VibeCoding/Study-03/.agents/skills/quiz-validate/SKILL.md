---
name: quiz-validate
description: 특정 카테고리의 퀴즈 문제 중 최상급 표현 및 근거를 검증하는 스킬
---

# Quiz Superlative Validator

이 스킬은 지정된 카테고리의 퀴즈 문제 중 최상급 표현(예: 가장, 최초 등)을 사용하는 문제를 찾아 근거(측정 기준, 시점 등)가 명확한지 검증합니다.

## Workflow

1.  **Filter & Search**: `quiz_data.json`에서 입력된 카테고리에 해당하는 문제를 필터링하고 최상급 키워드를 검색합니다.
    - 대상 카테고리: `$ARGUMENTS`
    - 키워드: `가장`, `최초`, `최대`, `최장`, `최고`
2.  **Extract**: 해당되는 문제의 `id`, `category`, `question`을 추출합니다.
3.  **Review**: 추출된 문제들이 측정 기준(예: 면적 기준, 2024년 기준)을 포함하고 있는지 사용자에게 확인합니다.

### Execution

다음 명령어를 실행하여 해당 카테고리의 문제를 필터링합니다:
`jq '.[] | select(.category == "$ARGUMENTS" and (.question | test("가장|최초|최대|최장|최고")))' quiz_data.json`
