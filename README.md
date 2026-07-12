# Enterprise Developer Portfolio (SAPUI5 + Notion 빌드 타임 동기화)

레거시 웹시스템과 SAP S/4HANA 프로젝트를 함께 보여주는 포트폴리오.
콘텐츠는 Notion(CMS)에서 작성하고, Netlify 빌드 시 정적 JSON/이미지로 동기화된다.
**브라우저는 런타임에 Notion API를 호출하지 않는다.**

## 데이터 흐름

```
Notion Modules DB + Posts DB (Status=Published)
→ Netlify 빌드: notion:modules + notion:sync
→ webapp/model/modules.json · webapp/model/posts/{Module}/{PostId}.json
→ webapp/media/notion/{Module}/{PostId}/** (이미지 로컬화)
→ content:validate → ui5 build → dist 배포
→ 브라우저는 정적 JSON + 로컬 이미지 경로만 조회
```

## 명령

```bash
npm start               # 로컬 dev 서버 (index.html)
npm run content:sync    # Notion 동기화 (모듈 + 게시글, .env 필요)
npm run content:validate# 콘텐츠 검증
npm run portfolio:build # 동기화 + 검증 + ui5 build → dist (Netlify build command)
npm run preview:dist    # dist 미리보기
npm run notion:deploy   # Netlify Build Hook 호출 (콘텐츠만 변경 시)
```

배치: `01_check_notion_content.bat`(동기화+검증) / `02_deploy_portfolio.bat`(Build Hook)
/ `03_push_portal_update.bat`(코드 배포: 로컬 빌드 검증 후 git push)

## 라우팅

`#dashboard` · `#module/{Code}` · `#post/{Module}/{PostId}` · `#skills` · `#career`

## 분류 (Modules DB 선택 속성)

- `Domain`[select]: `SAP`(기본) / `LEGACY` → 사이드바 그룹 분리
- `DisplayName`[rich_text]: 사이드바 표기명 (없으면 code+subtitle)
- 고정 문구(Hero/Bridge/Skills/Career)는 `webapp/config/site.json` (빌드 재생성 대상 아님)

## 주의

- `webapp/model/**`, `webapp/media/notion/**`는 빌드 시 재생성됨 — 수동 데이터 작성 금지
- Notion API Key는 `.env` / Netlify 환경변수에만 존재 (`.env.example` 참고)
- `server/`는 과거 런타임 프록시 잔재로 더 이상 사용하지 않음 (삭제 가능)
