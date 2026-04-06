---
name: quiz-range
description: 지정된 범위($1 ~ $2)의 퀴즈 문제를 검토하는 스킬
---

# Quiz Range Reviewer

이 스킬은 문제 번호(ID)를 기준으로 지정된 범위의 퀴즈 문제를 추출하여 검토합니다.

## Workflow

1.  **Filter**: `quiz_data.json`에서 ID가 `$1` 이상이고 `$2` 이하인 문제를 필터링합니다.
    - 시작 번호: `$1`
    - 끝 번호: `$2`
2.  **Extract**: 해당 범위에 속하는 모든 문제의 상세 정보를 출력합니다.
3.  **Review**: 사용자에게 해당 범위의 문제들이 가이드라인을 준수하는지 확인 요청합니다.

### Execution

다음 명령어를 실행하여 해당 범위의 문제를 필터링합니다:
`jq '.[] | select(.id >= ($1|tonumber) and .id <= ($2|tonumber))' quiz_data.json`
