# content 폴더 작성법

포트폴리오 화면에 나오는 글은 전부 이 폴더의 md 파일에서 옵니다. 파일을 고치고 `03_push_portal_update.bat`을 실행하면 배포됩니다.

## 어느 파일을 고치나

| 화면 | 파일 |
|---|---|
| 사이드바 영문 직무, 메뉴(홈 아래 주요 구현 사례, 경험 및 자격, SAP 아래 01~05), 아래쪽 간략 프로필, 연락처 버튼(이메일, Credly) | `site.md` |
| 홈 (헤드라인 순환, 신분증 카드와 사진, 한눈에 보기, 주요 구현 사례 4, 두 축 입구와 경험에서 배운 것들, 이력, 기술과 자격) | `home.md` |
| SAP 프로젝트 메인 페이지 (v0.8: Hero, 01 개요, 02 업무 프로세스, 03 담당 프로그램 요약 패널, 04 공통 기능, 05 성과) | `sap/project.md` |
| SAP 프로그램 카드 9개 | `sap/programs/*.md` (앞 숫자가 순서) |
| SAP 공통 모듈 카드 3개 | `sap/modules/*.md` |
| 공공 프로젝트 메인 페이지 (v0.8: Hero, 01 개요, 02 업무와 시스템 구조, 03 사례와 영역별 기록, 04 운영, 05 성과와 표창) | `public/project.md` |
| 공공 시스템 기능 설계 카드 30개 | `public/cards/*.md` (A~D 영역, 번호 순) |
| 이미지 | `img/sap/`, `img/public/`, 프로필 사진은 `img/profile.jpg` |

`_old` 폴더는 이전 구조의 파일이라 빌드에서 쓰지 않아요. 지우지 않고 보관합니다.

자세한 작성 방법은 `docs/02_사용자가이드.md`, 구조 설명은 `docs/01_개발설계서.md`에 있습니다.

## 카드 파일 모양 (두 축 공통)

```
---
(머리말: 제목, 역할, 설계 원칙, 이미지 같은 짧은 값)
---

## 문제
## 설계 내용
## 핵심 로직        (없으면 생략)
## 결과
## 내가 한 일과 팀이 한 일
## 연결             (SAP 카드만: 받는 것, 넘기는 것)
## 코드             (있을 때만)
```

- 긴 글은 머리말이 아니라 아래 `##` 섹션에 씁니다. 섹션 제목 이름은 바꾸지 않기
- 머리말의 `role`: 공공 카드는 `설계`(제가 설계, 개발자 구현) 또는 `직접 개발`(PL/SQL이나 SQL을 직접), SAP 카드는 `직접`, `공동`, `팀`
- `highlight`: 홈 주요 구현 사례 번호(1~4). 없으면 `null`

## SAP 프로젝트 메인 페이지 (v0.8, `sap/project.md`)

- 순서는 고정: Hero(`hero`) → 01(`overview`, `team`, `roles`) → 02(`process.e2e`, `process.co`, `flow`) → 03(`panels`) → 04(`shared`) → 05(`outcomes`, `decisions`, `outputs`, `retro`)
- 03 요약 패널은 `panels.groups[].items[]` 의 `key` 로 programs 폴더 카드와 연결됩니다. 제목과 프로그램 ID 는 카드에서 가져오고, 패널 문구(`one`, `tags`, `points`)만 여기서 씁니다. `programs` 라는 이름은 카드 목록이 쓰므로 머리말 이름으로 쓰지 않습니다
- 주소: `#sap/overview`, `#sap/process`, `#sap/e2e`, `#sap/co`, `#sap/programs`, `#sap/shared`, `#sap/outcomes`. 옛 주소 `#sap/flow` 는 CO 업무 흐름, `#sap/catalog` 는 담당 프로그램으로 갑니다
- 연결 대상(`to`, `go`, `programs`)은 빌드 검사에서 카드가 있는지 확인합니다
- 발표 영상은 실제 주소를 받기 전까지 넣지 않습니다 (빈 플레이어를 만들지 않음)

## 공공 프로젝트 메인 페이지 (v0.8, `public/project.md`)

- 순서는 고정: Hero(`hero`, 목차 `hero.toc`) → 01(`overview`) → 02(`process`) → 03(`cases`, `revive`, `catalog`) → 04(`operations`) → 05(`outcomes`, `growth`, `outputs`)
- 사이드바 하위 메뉴는 만들지 않고, Hero 아래 목차로 섹션을 이동합니다
- 사례와 운영 카드의 `records` 는 cards 폴더 카드의 `key` 입니다. 카드가 있어야 링크가 생기고, 빌드 검사에서 확인합니다
- 주소: `#public/overview`, `#public/process`, `#public/cases`, `#public/plsql`(대표 사례), `#public/catalog`, `#public/operations`, `#public/outcomes`, `#public/award`(표창). 옛 `#public/result` 는 05로 갑니다
- 확인되지 않은 건수, 비율, 만족도 같은 숫자는 쓰지 않습니다. 표창은 개인 표창으로만 씁니다

## 사례형 상세 (v0.7, 지금은 ZRC1CO0007 `30_pred.md`, ZRC1CO0009 `20_planrate.md`)

머리말에 `layout: case` 를 쓰면 상세 화면이 사례형으로 바뀝니다. 섹션은 아래 이름과 순서를 지켜야 빌드가 통과합니다.

```
## 개요
## 업무 흐름
## 핵심 구현
## 문제 해결
## 검증 및 기여
```

- 섹션 안에서 `### 소제목`, 문단, `- 목록`, `> 인용`, `| 표 |`, ``` 코드 를 쓸 수 있습니다. 표는 모바일에서 행마다 카드로 바뀝니다
- `case.summary`: 제목 아래 요약, `case.facts`: 오른쪽 정보표(상위 프로젝트, 구분, 기간, 역할, 기술)
- `case.sections`: 섹션 이름과 순서를 카드마다 정할 때 씁니다 (없으면 위 5개). 화면 번호 01, 02 ... 는 이 순서대로 붙습니다
- `case.points`: 요약 아래 핵심 구현 카드 (`title`, `text`). PC 4열, 태블릿 2열, 모바일 1열
- `case.listTo`, `case.listLabel`: 상세 아래 목록 복귀 링크 (예: `sap/catalog`, `담당 프로그램 목록`)
- `case.links`: 시연 영상, 소스, 설계서 버튼. 실제 주소(http/https)를 확인한 것만 `label`, `url` 로 넣습니다. 비워 두면 버튼이 나오지 않습니다
- 공개 화면에 근거 문서 이름이나 작업 메모를 쓰지 않습니다
- `depth`(SAP만): 깊게, 보통, 짧게. 화면에서 펼쳐 보이는 양이 달라집니다

## 꼭 지킬 것

1. **머리말에서 쉼표가 들어간 글은 따옴표로 감싸기.** 특히 `{ key: ..., value: ... }`처럼 중괄호 한 줄로 쓴 곳. 따옴표가 없으면 쉼표 뒤가 사라집니다
2. **가운뎃점(U+00B7) 쓰지 않기.** 빌드가 멈춥니다
3. **들여쓰기는 스페이스 2칸.** 탭 문자 금지
4. 확인이 안 된 내용은 `[확인 필요: 무엇]`으로 적기. 빌드 때 목록으로 알려 줍니다
5. 이미지는 `img/` 아래에 넣고, md에는 `sap/파일이름.jpg`처럼 `img/` 다음 경로만 적기
6. 공공 시스템 카드 이미지는 화면정의서나 분석설계안에서 와이어프레임 부분만 잘라 쓰고, 실제 데이터, 개인정보, 서버 주소는 가리기

## 지금 남은 확인 필요 항목 (요약, 2026-10-13 기준)

`node scripts/validate-content.js`를 실행하면 최신 목록이 나옵니다. Error 0, 확인 필요 44건입니다.

- `public/cards`: 카드 이미지 30장, 직접 설계 여부 확인 6건 (A04, A06, A07, C02, C04, C07), C07 반영 결과
- `public/project.md`: 표창장 이미지 (개인정보 가린 것)
- `sap/programs`: 활동유형 캡처, 콕핏 결산 단계 그림, BvA 캡처, 대시보드 상세 캡처 3장
- `sap/modules`: (v0.8에서 공통 HTML 헤더 모듈을 사이트에서 뺌. 원문은 `content/_old/sap/modules/20_header.md`)
- `sap/project.md`: 산출물 표지 캡처
- `site.md`: 사이드바 메뉴의 보조 문구에 남은 "30건" 표현 점검
