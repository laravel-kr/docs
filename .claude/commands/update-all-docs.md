공식 Laravel 문서(upstream)와 로컬 영문 원본을 동기화하고, 한국어 번역을 갱신하는 전체 워크플로우를 실행하라.

대상 버전: 12.x, 11.x, 10.x

---

## 1단계: 변경사항 감지

`bash scripts/check-docs-updates.sh` 를 실행하여 버전별 변경 목록을 확인한다.

- 출력에서 `NEW:`, `CHANGED:`, `DELETED:` 항목을 파싱한다.
- 모든 버전에 `(no changes)` 만 있으면 "모든 문서가 최신입니다." 메시지를 출력하고 종료한다.
- 변경사항이 있으면 사용자에게 요약을 보여주고, 진행 여부를 확인받는다.

---

## 2단계: CHANGED 파일 처리

각 `CHANGED: {file}` 항목에 대해 (해당 버전을 VERSION이라 한다):

1. **기존 영문 원본 백업**: 현재 `{VERSION}/{file}` 내용을 메모리에 보관 (old 버전)
2. **새 영문 원본 가져오기**: `git show upstream/{VERSION}:{file}` 의 내용을 `{VERSION}/{file}` 에 저장
3. **diff 파악**: old 버전과 new 버전의 차이를 확인하여 변경된 섹션을 식별
4. **기존 한국어 번역 읽기**: `{VERSION}/kr/{file}` 내용을 읽는다
5. **한국어 번역 갱신**: 영문에서 변경된 부분에 대응하는 한국어 번역만 업데이트한다
   - 변경되지 않은 섹션은 기존 번역을 그대로 유지한다
   - 아래 "번역 가이드라인"을 반드시 준수한다

---

## 3단계: NEW 파일 처리

각 `NEW: {file}` 항목에 대해:

1. **영문 원본 복사**: `git show upstream/{VERSION}:{file}` 의 내용을 `{VERSION}/{file}` 에 저장
2. **파일 길이 확인**:
   - **300줄 이하**: 전체를 한번에 번역
   - **300줄 초과**: h2(`## `) 헤딩 기준으로 섹션을 나누어 순차적으로 번역
3. **번역 결과 저장**: `{VERSION}/kr/{file}` 에 저장
4. 아래 "번역 가이드라인"을 반드시 준수한다

---

## 4단계: DELETED 파일 처리

각 `DELETED: {file}` 항목에 대해:

1. 사용자에게 `{VERSION}/{file}` 와 `{VERSION}/kr/{file}` 삭제를 제안한다.
2. 사용자 확인을 받은 후에만 삭제한다.

---

## 5단계: 마무리

1. **검색 인덱스 재생성**: `node scripts/build-search-index.js` 실행
2. **커밋 & 푸시**:
   - 변경된 파일들을 `git add` 한다
   - 커밋 메시지 형식: `docs: sync upstream and update Korean translations`
     - 본문에 변경사항 요약 포함 (버전별 NEW/CHANGED/DELETED 목록)
   - `web` 브랜치에 push 한다

---

## 번역 가이드라인

다음 규칙을 반드시 준수하라:

1. **앵커 태그 유지**: `<a name="..."></a>` 형태의 앵커 태그는 원본 그대로 유지
2. **코드 블록 미번역**: ` ``` ` 으로 감싸진 코드 블록의 내용은 번역하지 않음
3. **코드 내 주석만 번역**: 코드 블록 안의 영문 주석(`// comment`, `# comment`, `/* comment */`)만 한국어로 번역
4. **링크 형식 유지**: `/docs/{{version}}/` 형식의 내부 링크는 그대로 유지
5. **기술 용어 영문 유지**: Laravel, Eloquent, Composer, Artisan, Blade, Middleware, Controller, Model, Migration, Facade, Service Container, Service Provider 등 고유 기술 용어는 영문 그대로 사용
6. **자연스러운 한국어**: 직역하지 않고, 한국어 문맥에 맞게 자연스럽게 의역
7. **문체 일관성**: 해당 버전의 기존 `kr/` 번역 파일들의 문체·어투와 일관성을 유지 (경어체 사용)
8. **마크다운 구조 보존**: 헤딩 레벨, 리스트, 테이블 등 마크다운 구조는 원본과 동일하게 유지
