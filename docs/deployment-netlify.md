# Netlify 배포 가이드

## 빌드 순서

Netlify build command는 `npm run portfolio:build` 이며 다음 순서로 실행됩니다.

1. `notion:modules` — Modules DB → `webapp/model/modules.json`
2. `notion:sync` — Posts DB → `webapp/model/posts/{MODULE}/{postId}.json`
   - **이 단계에서 Notion 이미지를 다운로드해 `webapp/media/notion/{module}/{postId}/`에 저장**
   - JSON에는 `media/notion/...` 로컬 경로가 기록됨
   - `webapp/media/notion/manifest.json` 생성(다운로드 이력)
3. `content:validate` — 필수값 + 이미지 경로 검증. **오류 시 빌드 실패** (이전 배포 유지됨)
4. `build` (ui5 build) — `webapp/` 전체를 `dist/`로 빌드. media 포함
5. Netlify가 `dist/` 배포

이미지 다운로드는 항상 UI5 build **이전**에 실행되므로 `dist/media/notion/`에 포함됩니다.

## 필요한 환경변수 (Netlify → Site settings → Environment variables)

| 변수 | 필수 | 설명 |
|---|---|---|
| `NOTION_API_KEY` | 필수 | Notion 통합 시크릿 |
| `NOTION_DATABASE_ID` | 필수 | Posts DB ID |
| `NOTION_MODULES_DATABASE_ID` | 필수 | Modules DB ID |
| `NOTION_DATA_SOURCE_ID` | 선택 | 자동 조회 실패 시에만 |
| `ALLOW_IMAGE_DOWNLOAD_FAILURE` | 선택 | 기본 false. true면 이미지 실패를 warning으로 완화 |
| `FORCE_LOCALIZE_EXTERNAL_IMAGES` | 선택 | 기본 false. true면 외부 URL 이미지도 로컬화 |

`NETLIFY_BUILD_HOOK_URL`은 **로컬 전용**입니다. Netlify에 넣지 마세요.

## 이미지 다운로드 실패 시 확인 방법

Deploys 로그에서 다음 키워드를 찾으세요.

- `[Image Download]` — 개별 다운로드 성공/재시도 로그
- `[Notion Sync][IMAGE ERROR]` — 실패한 게시글/필드/원인 (예: `MM/pr-management screenUrls[0]: HTTP 403 ...`)
- `HTTP 403/404` → Notion 임시 URL 만료 또는 삭제된 파일. **재배포(재sync)하면 새 서명 URL로 다시 받아짐.** 그래도 실패하면 Notion에서 해당 이미지가 삭제됐는지 확인
- `Content-Type=...` 오류 → URL이 이미지가 아님. ScreenUrls에 잘못된 링크가 들어감
- `SVG는 보안상 다운로드하지 않습니다` → SVG는 skip됨. PNG/JPG로 교체

### `ALLOW_IMAGE_DOWNLOAD_FAILURE` 주의점

true로 두면 이미지가 몇 장 깨진 채로도 배포됩니다. **급하게 배포해야 할 때만 일시적으로** 켜고, 배포 후 반드시 원인을 고치고 다시 끄세요. 기본은 false(빌드 실패)이며, 이것이 공개 포트폴리오 품질을 지키는 기본 정책입니다.

## 사이트에서 이미지가 깨질 때 확인 순서

1. 깨진 이미지의 src 확인 — `media/notion/...`이면 3번으로, Notion 도메인(`prod-files-secure`, `file.notion.so` 등)이면 2번으로
2. Notion 임시 URL이 남아 있음 → sync가 예전 버전으로 돌았거나 validate를 우회함. 재배포
3. `dist/media/notion/`에 해당 파일이 있는지 Deploys 로그(`[Image Download] 저장 완료`)로 확인
4. 로그에 없으면 `[IMAGE ERROR]` 검색 → Notion 원본 이미지 상태 확인 후 재배포

## Deploy 로그에서 봐야 할 항목 (정상 빌드)

```
[Notion Modules Sync] 완료
[Notion Sync] Published 게시글 수: N
[Image Download] 저장 완료: screen-001.jpg (…KB, host=prod-files-secure…)
[Notion Sync] media manifest 갱신: … (이미지 N건)
[Content Validate] 완료: 배포 가능한 상태입니다.
```

## generated media 정책

- `webapp/media/notion/`은 빌드 산출물이며 **git에 커밋하지 않습니다** (.gitignore 처리됨).
- sync는 게시글별 폴더(`{module}/{postId}/`)만 비우고 다시 받습니다. 전체 폴더를 삭제하지 않습니다.
- Published에서 내려간 게시글의 이미지 폴더는 남을 수 있으나 배포 품질에 영향 없음(참조되지 않음).
- manifest에는 원본 URL 전체(서명 쿼리 포함)를 저장하지 않고 host와 경로 hash만 기록합니다.
