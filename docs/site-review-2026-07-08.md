# TAESAN ERP Portfolio 사이트 리뷰 (2026-07-08)

> 분석 근거: 프로젝트 폴더 전체 (scripts 5개, controller 4개, view 4개, netlify.toml, package.json, README, git 이력, .env 마스킹 확인)

---

## [1] 한 줄 총평

Notion→빌드 타임 JSON→정적 배포라는 **보안적으로 올바른 골격**은 이미 완성됐지만, 랜딩에서 669장(~123MB) 프레임 이미지를 전부 프리로드하는 구조와 "Notion 글 작성 후 수동 재배포" 흐름, 테스트 수준의 실제 콘텐츠가 현재 가장 큰 약점이다.

---

## [2] 현재 구축 현황 요약

| 항목 | 현재 상태 | 근거 | 판단 | 코멘트 |
|---|---|---|---|---|
| 프레임워크 | SAPUI5 1.120 (sap_horizon), Fiori Basic 템플릿, XML View MVC | `manifest.json`, `ui5.yaml`, `index.html` | 확인됨 | UI5를 포트폴리오 랜딩에 쓴 것 자체가 차별점 |
| 애니메이션 | GSAP 3.12.5 + ScrollTrigger (cdnjs 런타임 로드) | `Main.controller.js` `_loadLibraries` | 확인됨 | 동적 script 주입 방식 |
| 라우팅 | hash 기반 3개 라우트: `Main`, `module/{moduleId}`, `module/{moduleId}/post/{postId}` | `manifest.json` routing | 확인됨 | hash 라우팅이라 새로고침 404 없음 |
| 페이지 구성 | 랜딩(스토리 스크롤+헬릭스 메뉴) → 모듈 상세 → 기능 게시글, 패널/섹션 기반 | `Main/ModuleDetail/ModulePost.view.xml` | 확인됨 | "패널이 이어지는 구조" 맞음 |
| Notion 연동 방식 | **빌드 타임** 수집. `sync-notion-modules.js`→`modules.json`, `sync-notion-posts.js`→`posts/{모듈}/{postId}.json` | `scripts/`, `package.json` `portfolio:build` | 확인됨 | 런타임 호출·Netlify Functions·클라이언트 직접 호출 없음 |
| 토큰 노출 | 클라이언트 번들에 Notion 키 없음. `.env`는 gitignore, git 이력에도 없음 | `.gitignore`, `git ls-files` | 확인됨 | `03_push` bat에 .env 커밋 방지 체크까지 있음 |
| Notion 스키마(Posts) | Title, Subtitle, PostId, Module(select), Owner, Status(select), Order(number), VideoUrl, ThumbnailUrl, Summary, Tags, Process, Tables, Implementation, ScreenUrls + 본문 블록 | `sync-notion-posts.js` | 확인됨 | 공개 여부=Status(Published) 필터, 정렬=Order로 커버 |
| Notion 스키마(Modules) | Code, Title/Name, Subtitle, Eyebrow, Owner, Process, Description, VideoLabel, VideoUrl, Features, TechPoints, Tables | `sync-notion-modules.js` | 확인됨 | 별도 DB(NOTION_MODULES_DATABASE_ID) |
| 데이터/UI 분리 | 모듈·게시글은 JSON 바인딩으로 분리. 랜딩 스토리 텍스트와 모듈 메뉴는 XML 하드코딩 | `Main.view.xml` 102~205행 등 | 확인됨 | 부분 분리 |
| 반영 흐름 | Notion 작성 → **수동으로** Build Hook 호출(`02_deploy.bat`) 또는 git push → Netlify 빌드 시 Notion 재수집 | `trigger-netlify-build.js`, bat 파일들 | 확인됨 | 완전 자동 아님. 스케줄/웹훅 없음 |
| Netlify 설정 | build=`npm run portfolio:build`, publish=`dist`, NODE 22. Functions/redirects/headers 없음 | `netlify.toml` | 확인됨 | 최소 구성 |
| Netlify 환경변수 | NOTION_API_KEY 등이 Netlify에 설정돼 있어야 빌드 성공. 대시보드 설정 여부는 폴더로 확인 불가 | `.env` 항목 대비 | 확인 필요 | 배포가 살아있다면 설정된 것으로 추정 |
| 콘텐츠 검증 | `validate-portfolio-content.js`가 필수값 오류 시 빌드 실패 처리(배포 게이트) | `package.json` `content:validate` | 확인됨 | 좋은 장치 |
| 에러/빈 상태 UI | 모듈 없음 placeholder, 게시글 로드 실패 fallback 데이터 있음 | `ModuleDetail/ModulePost.controller.js` | 확인됨 | 기본기 있음 |
| 문서화 | README에 목적·모듈표·스택·보안 공지. 팀원용 Notion 작성 가이드, 배포 문서 없음 | `README.md` | 확인됨 | docs/ 부재 (이 문서로 시작) |
| 커스텀 도메인 | `taesan-erp.netlify.app` 기본 도메인 사용 | README | 확인됨 | 커스텀 도메인 미사용 추정 |

- 유지보수 쉬운 부분: 게시글 추가(코드 수정 0, Notion만 작성), 검증 스크립트, bat 운영 스크립트.
- 어려운 부분: 1,122행 Main 컨트롤러(랜딩 연출 로직 집중), 랜딩 하드코딩 텍스트, Notion 속성명 하드코딩, 2,573행 단일 CSS.

---

## [3] 전체 아키텍처 흐름

**현재 구현된 흐름 (확인됨):**

```
Notion Posts DB + Modules DB (Status=Published 필터, Order 정렬)
  → [빌드 타임] sync-notion-modules.js / sync-notion-posts.js
  → webapp/model/modules.json + model/posts/{MODULE}/{postId}.json (정적 JSON)
  → validate-portfolio-content.js (필수값 검증, 실패 시 빌드 중단)
  → ui5 build → dist/
  → Netlify (git push 자동 배포 또는 Build Hook 수동 트리거)
  → 브라우저: hash 라우팅으로 JSON을 fetch해 XML 뷰에 바인딩
```

**아직 없는 흐름 (앞으로 필요):**

1. Notion 글 저장 → 자동 재배포 연결 고리. 현재는 글을 올려도 누군가 `02_deploy_portfolio.bat`을 돌려야 반영됨. Netlify 스케줄 빌드(1일 1회) 또는 웹훅 자동화 필요.
2. Notion 첨부 이미지의 로컬 다운로드. ScreenUrls는 URL 문자열만 저장 — Notion 업로드 파일 URL은 약 1시간 후 만료되므로 빌드 시 이미지를 받아 dist에 넣는 단계 필요.
3. 트러블슈팅 데이터 구조화. 현재는 본문 heading에 "트러블" 포함 섹션을 통째로 problem에 넣고 solution은 항상 빈 문자열.

---

## [4] 문제 가능성 목록

| 우선순위 | 문제 | 분류 | 왜 문제인가 | 발생 가능성 | 영향도 | 근거 | 확인 방법 | 개선 방향 |
|---|---|---|---|---|---|---|---|---|
| 1 | 랜딩 진입 시 669장 JPG(~123MB) 전체 프리로드 | 프론트엔드/기업 접속 | 회사망·모바일에서 로딩 수십 초~실패. 12초 타임아웃 후 프레임 누락 재생 | 높음 | 높음 | `Main.controller.js` 395~444행, `webapp/images` 123MB | 개발자도구 Network 총 전송량 측정 | 프레임 수 축소(100~150장), WebP 변환·해상도 축소, 점진 로드 또는 mp4 스크럽 전환 |
| 2 | Notion 작성 → 사이트 반영이 자동이 아님 | Notion/운영 | "팀원이 올리면 자동 표출" 목표와 불일치. 반영 누락 발생 | 높음 | 중간 | Build Hook 수동 스크립트만 존재 | — | Netlify 스케줄 빌드 또는 Notion 자동화→Build Hook 연결 |
| 3 | Notion 첨부파일 URL 만료 | Notion | Notion 업로드 이미지 URL을 ScreenUrls에 넣으면 배포 1시간 뒤 전부 깨짐 | 높음 | 높음 | `splitToUrlArray`가 URL 문자열만 저장 | Notion 업로드 URL 넣고 2시간 후 확인 | 빌드 시 이미지 다운로드→로컬 저장, 또는 외부 호스팅 URL만 쓰도록 가이드 |
| 4 | 실제 콘텐츠가 테스트 수준 | 포트폴리오 | 게시글 2건, MM은 "테스트 파일입니다" 문구·더미 owner("김MM"), 문제/해결/배운 점이 placeholder | 확인됨 | 높음 | `pr-management.json` sections | 사이트 열람 | 콘텐츠 작성 최우선. 문제→해결→결과 구조로 |
| 5 | 보안 헤더/CSP 전무 | Netlify/보안 | 기업 보안 스캐너·Lighthouse 감점, 클릭재킹 등 기본 방어 없음 | 확인됨 | 중간 | `_headers`, netlify.toml headers 부재 | securityheaders.com | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, 신중한 CSP 추가 |
| 6 | 외부 CDN 의존 (sapui5.hana.ondemand.com, cdnjs) | 기업 접속 | 하나만 차단돼도 빈 화면 또는 애니메이션 전멸 | 중간 | 높음 | `index.html`, `_loadLibraries` | 회사망 접속 테스트 | UI5 self-contained 빌드 또는 GSAP 로컬 번들, CDN 실패 안내 UI |
| 7 | Notion 속성명 하드코딩 + 조용한 빈값 | Notion | 속성명 변경 시 오류 없이 빈 문자열 수집. title/summary는 validate가 잡지만 나머지는 warning뿐 | 중간 | 중간 | sync 스크립트의 `getRichText(page,"...")` 다수 | 속성명 하나 바꿔 sync 실행 | 스키마 상수 파일 분리 + 속성 존재 검증 후 명시적 에러 |
| 8 | 트러블슈팅 구조 약함 | 포트폴리오 | problem만 채워지고 solution 항상 "" → 화면에 반쪽 표출 | 확인됨 | 중간 | `extractTroubleShooting` | 생성된 JSON 확인 | Notion에 Problem/Solution 속성 분리 |
| 9 | git에 프레임 이미지 1,340개(루트+webapp 중복 123MB×2) | 프론트엔드 | clone·push 느림, pack 61.6MB. 루트 `images/`는 배포에 안 쓰임 | 확인됨 | 중간 | `git ls-files`, `du` | — | 루트 `images/` 제거, 프레임 최적화 후 재커밋 |
| 10 | HR/RP 메뉴 숨김이나 URL 직접 접근 가능 | 프론트엔드 | `#/module/HR` 진입 시 Not Found placeholder 노출 | 확인됨 | 낮음 | `Main.view.xml` visible=false, 라우트는 열림 | URL 직접 입력 | modules.json에 `visible` 플래그 + 리다이렉트 |
| 11 | i18n 미사용, `lang="en"`, title "Portal" | 포트폴리오 | 탭 제목·검색 결과가 "Portal", 접근성 검사 지적 | 확인됨 | 낮음 | `index.html`, `i18n.properties` | — | title/lang/meta 정비 |
| 12 | 랜딩 텍스트·메뉴 XML 하드코딩 | 프론트엔드 | 문구 수정마다 코드 배포 필요 | 확인됨 | 낮음 | `Main.view.xml` 102~205행 | — | 랜딩 카피도 JSON(또는 Notion)으로 이동 |

---

## [5] 기업 접속 오류/예외사항 상세 분석

| 오류/예외 | 발생 가능성 | 영향도 | 사용자가 보는 증상 | 원인 | 확인할 파일 | 확인 방법 | 개선 방향 |
|---|---|---|---|---|---|---|---|
| `*.netlify.app` 도메인 차단 | 중간 | 높음 | 접속 불가/보안 경고 페이지 | Zscaler 등에서 무료 호스팅 와일드카드 도메인을 "신규/미분류"로 차단하는 정책 흔함 | README(도메인) | 회사망 접속, 차단 페이지 캡처 | 커스텀 도메인 연결 — 신뢰도·차단 회피 동시 해결 |
| SAPUI5 CDN 차단 | 중간 | 높음 | **완전 빈 화면** (앱 부트 실패) | `sapui5.hana.ondemand.com` 단일 의존, 실패 시 대체 없음 | `webapp/index.html` 15행 | 회사망 F12 Network | ui5 self-contained 빌드로 자체 호스팅 |
| cdnjs(GSAP) 차단 | 중간 | 중간 | 인트로 후 스크롤·헬릭스 멈춤, 에러 MessageBox | `_loadLibraries` cdnjs 의존 | `Main.controller.js` 252~266행 | 〃 | GSAP 로컬 포함 |
| 123MB 프레임 다운로드 | 높음 | 높음 | 로딩 장기화, 12초 타임아웃 후 끊기는 애니메이션 | 669장 전체 프리로드 | `Main.controller.js` 395~444행 | Network 총량 측정 | [4]-1과 동일 |
| YouTube/Vimeo/Drive embed 차단 | 높음 | 중간 | 시연 영상 자리가 빈 iframe/차단 안내 | 기업망에서 YouTube·Drive 차단 흔함 | `ModulePost.controller.js` | 회사망에서 게시글 열람 | 차단 시 대체 문구+링크, 핵심 화면 스크린샷 병행 |
| CSP 부재로 보안 평가 감점 | 확인됨 | 낮음 | 증상 없음(평가 문서상 지적) | headers 설정 없음 | `netlify.toml` | securityheaders.com | 기본 보안 헤더 4종 + CSP(sapui5, cdnjs, youtube, vimeo, drive 허용) |
| SPA 새로고침 404 | 낮음 | 낮음 | 없음 | hash 라우팅이라 서버는 항상 `/` 요청 | `manifest.json` | 상세 페이지 F5 | 조치 불필요. 404.html만 추가 권장 |
| 배포 후 캐시로 구버전 표시 | 중간 | 낮음 | 재배포했는데 옛 글 보임 | JSON fetch 브라우저 캐시 가능 | `ModulePost.controller.js` loadData | 배포 직후 강력 새로고침 비교 | JSON 요청에 빌드 버전 쿼리스트링 |
| Notion rate limit/권한 오류 | 낮음 | 중간 | 사이트 정상, **빌드만 실패**(구버전 유지) | 빌드 타임 수집 구조 | `scripts/sync-*.js` | Netlify Deploys 로그 | 빌드 실패 알림 설정, 재시도 로직 |
| Netlify 환경변수 누락 | 낮음(현재)/높음(재설정 시) | 높음 | 로컬 성공·Netlify 실패 | `.env.example`에 `NOTION_MODULES_DATABASE_ID` 누락(확인됨) | `.env.example` | Netlify 환경변수 대조 | `.env.example` 갱신 + README에 필수 env 명시 |
| 구형 브라우저 | 낮음 | 중간 | 빈 화면 | UI5 1.120은 IE 미지원 | — | 회사 표준 브라우저 확인 | "Chrome/Edge 권장" 안내 |
| 모바일/소화면 | 중간 | 중간 | 헬릭스 조작 어려움, 텍스트 겹침 가능 | wheel 이벤트 중심, 고정 px 다수 | `style.css` | 반응형 모드 점검 | 터치 대응·소화면 대체 메뉴 |
| 접근성 지적 | 중간 | 낮음 | 심사 문서상 지적 | canvas 대체 텍스트 없음, lang="en"+한국어 콘텐츠 | `index.html`, 뷰 XML | Lighthouse a11y | lang 수정, aria-label, 대비 점검 |

---

## [6] Notion 데이터 구조 개선안

현재 Posts DB 속성은 유지(코드 호환), **볼드**가 신규 제안.

| 속성 | 필수 | 타입 | 이유 | 화면 사용 위치 |
|---|---|---|---|---|
| Title | 필수 | title | 게시글 식별, validate error 대상 | 게시글 헤더, 모듈 목록 |
| PostId | 필수 | rich_text | 파일명·URL slug. 영문 소문자-하이픈 | 라우트 `module/{m}/post/{id}` |
| Module | 필수 | select (OV/FI/CO/MM/SD/PP/RP) | 오타 방지 | 모듈별 분류·폴더 |
| Status | 필수 | select (Draft/Review/**Published**) | Published만 수집 → 초안 유출 방지 | 수집 필터 |
| Order | 필수 | number | 모듈 내 정렬. 10 단위 권장 | 목록 정렬 |
| Summary | 필수 | rich_text | 목록 카드 요약, validate error 대상 | 게시글 카드 |
| Owner | 권장 | rich_text (→person 병행) | 개인 기여 구분의 핵심 | 게시글 헤더 |
| Subtitle | 권장 | rich_text | 헤더 보조 문구 | 게시글 헤더 |
| Tags | 권장 | multi_select | 기술 스택 표시, 향후 필터 기반 | 카드·상세 태그 |
| VideoUrl | 권장 | url | YouTube/Vimeo/Drive 변환 로직 있음 | 영상 패널 |
| ThumbnailUrl | 선택 | url | 목록 카드 이미지 | 게시글 카드 |
| Process | 권장 | rich_text (→/줄바꿈 구분) | 업무 흐름 시각화 | 프로세스 스텝 |
| Implementation | 선택 | rich_text | 구현 포인트(본문 "구현" 섹션 fallback) | 구현 포인트 패널 |
| Tables | 선택 | rich_text | 테이블명 — 교육 프로젝트라 무방, 실무 전환 시 추상화 | 기술 정보 패널 |
| ScreenUrls | 선택 | rich_text | **외부 호스팅 URL만** (Notion 업로드 URL 만료) | 스크린샷 갤러리 |
| **Problem** | 권장 | rich_text | 트러블슈팅 구조화 (현재 solution 항상 빈값) | 트러블슈팅 problem |
| **Solution** | 권장 | rich_text | "문제→해결"이 설득력의 핵심 | 트러블슈팅 solution |
| **Learned** | 선택 | rich_text | 배운 점 구조화 | 게시글 하단 |
| **MyContribution** | 권장 | rich_text | 개인/팀 기여 구분 — 채용 담당자가 가장 먼저 찾음 | 게시글 헤더 배지 |
| **Importance** | 선택 | select (핵심/일반) | 대표 기능 하이라이트 근거 | 메인/모듈 하이라이트 |
| **LastEdited** | 자동 | last_edited_time | 갱신 추적 | 게시글 메타 |

운영 규칙: 속성명 변경 금지(코드에 하드코딩), 새 속성 추가는 자유(무시될 뿐 안 깨짐 — 확인됨), 새 글은 Draft 기본값.

---

## [7] 포트폴리오 콘텐츠 개선 의견

- **채용 담당자:** 랜딩 연출은 인상적이나 게시글에 "테스트 파일입니다"가 공개 중(확인됨). 첫 30초 안에 "무슨 프로젝트를, 몇 명이, 내가 뭘 맡아 뭘 해결했는지"가 안 보임. 팀 소개·역할 분담 섹션 없음.
- **실무 개발자:** 테이블명·프로세스 나열은 있으나 "왜 이렇게 설계했나" 부재. 트러블슈팅이 빈 배열이라 기술 깊이 판단 근거 부족.
- **SAP/ERP 비전문가:** 스토리 도입부(자전거 회사 서사)는 매우 좋음. 모듈 상세부터 PR/PO/GR/IV 약어가 설명 없이 등장 — 첫 등장 시 풀네임+한 줄 설명 필요.
- **팀원:** Notion 작성 규칙 문서 부재.
- **기업 보안 담당자:** 가상 기업(태산자전거) 설정, 실 고객사·서버 정보 노출 없음(확인됨). ZTC1* 테이블명은 교육용 네임스페이스라 위험 낮음. 팀원 실명 Owner 사용 시 본인 동의 확인.

제안:
- 줄일 것: 기능 나열식 features, MessageBox로만 처리된 미구현 버튼("ERP 업무 시작" 등).
- 강조할 것: SAP 서버 종료 후 결과물 보존이라는 사이트 존재 이유, 모듈 간 연계(SD→PP→MM→FI), 트러블슈팅.
- 내부자용 표현: "반제", "소요량 전개" 등 → 툴팁 또는 용어 사전.
- 반복 피로 방지: 모든 게시글 동일 골격 대신 대표 기능은 서사형, 나머지는 카드 요약형으로 밀도 차등.
- 추가 섹션: ① 전체 업무 흐름도(모듈 연계 다이어그램) ② 팀 소개/역할 매트릭스 ③ "이 사이트는 어떻게 만들었나"(Notion CMS 파이프라인 자체가 포트폴리오 소재).

---

## [8] 바로 수정하면 좋은 것 TOP 10

1. **프레임 이미지 다이어트** — 669장→~150장, WebP·1280px. 이유: 최대 접속 장애 요인. 효과: 123MB→10MB. 파일: `webapp/images/frames/`, `Main.controller.js`(`_iStoryFrameCount`). 난이도: 중간
2. **`.env.example`에 `NOTION_MODULES_DATABASE_ID`, `NETLIFY_BUILD_HOOK_URL` 추가** — 실제 .env와 불일치(확인됨). 파일: `.env.example`, README. 난이도: 낮음
3. **테스트 콘텐츠 교체/비공개** — "테스트 파일입니다" 공개 중. Notion에서 Status→Draft. 난이도: 낮음
4. **Netlify 스케줄 빌드/자동 트리거** — 수동 반영 의존 제거. 파일: Netlify 설정(또는 GitHub Actions cron→Build Hook). 난이도: 낮음
5. **보안 헤더 추가** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy. 파일: `netlify.toml`. 난이도: 낮음
6. **ScreenUrls 만료 대책** — 빌드 시 이미지 다운로드→로컬 저장. 파일: `sync-notion-posts.js`. 난이도: 중간
7. **루트 `images/` 중복 제거 + git 정리** — 배포 미사용, 저장소 비대. 난이도: 낮음
8. **title/lang/meta 정비** — "TAESAN ERP Portfolio", lang="ko", description·og 태그. 파일: `webapp/index.html`, `i18n.properties`. 난이도: 낮음
9. **Problem/Solution 속성 분리 반영** — Notion DB 속성 추가 + `extractTroubleShooting` 수정. 파일: `sync-notion-posts.js`, `ModulePost.view.xml`. 난이도: 중간
10. **미구현 버튼 정리** — "ERP 업무 시작" 등을 실제 목적지로 연결하거나 제거. 파일: `Main.controller.js` 737~775행, `Main.view.xml`. 난이도: 낮음

---

## [9] Claude로 관리하기 좋은 구조 제안

```
scripts/
  notion-schema.js          ← 신규: 속성명·필수값 상수화 (현재 두 sync 파일에 중복 하드코딩)
  lib/notion-helpers.js     ← 신규: getTitle/getRichText 등 공통 헬퍼 추출 (현재 완전 중복)
  download-notion-images.js ← 신규: 첨부 이미지 로컬화
webapp/
  controller/main/StoryScroll.js  ← Main.controller 분할 (프레임 캔버스)
  controller/main/ErpHelix.js     ← Main.controller 분할 (헬릭스)
  css/ landing.css / module.css / post.css  ← 2,573행 style.css 분할
  model/landing.json        ← 신규: 스토리 패널 문구 하드코딩 탈출
docs/
  notion-writing-guide.md   ← 신규: 팀원용 (속성 규칙, PostId 형식, 이미지 URL 주의)
  deployment-netlify.md     ← 신규: env 목록, 빌드 순서, 실패 시 확인 순서
  content-guide.md          ← 신규: 문제→해결→결과 작성 템플릿
```

스키마 상수화가 특히 중요 — "Notion 속성명 변경 방어"가 파일 하나 수정으로 끝나게 됨.

---

## [10] Netlify 배포 안정화 제안

- **netlify.toml**: build/publish 올바름(확인됨). headers 블록·404 처리 추가 권장.
- **환경변수**: Netlify에 `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NOTION_MODULES_DATABASE_ID` 필수(`NOTION_DATA_SOURCE_ID` 선택). `NETLIFY_BUILD_HOOK_URL`은 로컬 전용 — Netlify에 넣지 말 것.
- **API Key 보호**: 현재 체계 양호(확인됨). Notion 통합 권한을 DB 2개 read-only로 제한 확인.
- **배포 실패 시 확인 순서**: ① Deploys 로그에서 실패 단계 확인(modules sync → posts sync → validate → ui5 build) ② validate 실패면 `[Content Validate][ERROR]` 항목 = Notion 글 수정 ③ sync 실패면 env/권한/rate limit ④ build 실패면 코드.
- **Deploy Preview**: PR 작업 시 자동 활성화. Preview도 Published 필터 적용되어 Draft 노출 없음.
- **커스텀 도메인**: 기업 열람 전제면 사실상 필수.
- **기업 접속 테스트 체크리스트**: 회사망에서 ① 첫 페이지(UI5 CDN) ② 스크롤 애니메이션(cdnjs) ③ 로딩 시간(프레임) ④ 게시글 영상(YouTube) ⑤ 새로고침 ⑥ 모바일 회선 비교.

---

## [11] 유지보수 프롬프트 예시 10개

1. "scripts의 두 sync 파일에 중복된 Notion 헬퍼 함수를 `scripts/lib/notion-helpers.js`로 추출하고, 속성명을 `scripts/notion-schema.js` 상수로 분리해줘. 속성이 없으면 조용히 빈값이 아니라 경고를 내게 해줘."
2. "랜딩 프레임 애니메이션을 150장 이하 WebP로 최적화하는 스크립트를 만들고 `_iStoryFrameCount`와 경로를 맞춰줘. 저해상도 우선 로드 방식으로 바꿔줘."
3. "`sync-notion-posts.js`에 ScreenUrls 이미지를 빌드 시 다운로드해서 `webapp/media/`에 저장하고 JSON에는 로컬 경로를 쓰도록 수정해줘."
4. "netlify.toml에 보안 헤더와 404 처리를 추가해줘. UI5 CDN, cdnjs, YouTube/Vimeo/Drive embed가 깨지지 않는 CSP를 Report-Only 모드부터 적용해줘."
5. "팀원용 `docs/notion-writing-guide.md`를 만들어줘. Posts DB 속성 규칙, PostId 명명법, Status 의미, 이미지 URL 주의사항, 문제→해결→결과 작성 템플릿 포함."
6. "`webapp/model/posts/`의 모든 게시글 JSON을 읽고, 내부자만 이해할 표현·placeholder 문구·민감해 보일 수 있는 표현을 목록으로 뽑아줘."
7. "GSAP/ScrollTrigger CDN 로드 실패 시에도 사이트가 정적 레이아웃으로 동작하도록 fallback을 추가해줘."
8. "`Main.controller.js`를 StoryScroll/ErpHelix/Menu 모듈로 분리 리팩토링해줘. 동작은 그대로 유지하고."
9. "modules.json에 visible 플래그를 추가해서 HR/RP처럼 준비 안 된 모듈은 URL 직접 접근 시 메인으로 리다이렉트되게 해줘."
10. "모듈 게시글이 10개 이상일 때를 대비해 ModuleDetail에 태그 필터와 게시글 검색을 추가해줘. 데이터는 기존 modules.json posts 배열만 사용해서."
