---
key: activity
axis: sap
kind: ABAP
'no': 1
step: 사전 준비
title: 활동유형 관리
id: ZRC1CO0003
role: 직접
depth: 보통
highlight: null
principles:
- 계획과 실제의 대칭
one: 활동유형 마스터와 코스트센터별 계획단가를 한 화면에서 관리합니다.
# v0.7: ZRC1CO0007, ZRC1CO0009, SAPMZC1CO0003 과 같은 사례형 상세. 섹션 이름과 순서는 case.sections
layout: case
case:
  summary: 활동유형 마스터와 코스트센터별 활동유형 할당, 연도와 버전별 계획단가를 하나의 화면에서 등록, 수정, 삭제하는 CO 기준정보 관리 프로그램입니다. 좌우 Editable ALV를 Master-Detail로 연결하고, 키와 총단가 같은 파생값을 프로그램이 계산하도록 구현했습니다. SAP 표준 KL01/KL02, KP26을 수정하거나 확장한 것이 아니라, 비슷한 업무 기능을 프로젝트의 CBO 테이블로 구현했습니다.
  points:
  - title: Master-Detail Editable ALV
    text: Splitter로 나눈 좌우 ALV에서 활동유형을 더블클릭하면 해당 코스트센터별 단가를 오른쪽에 조회
  - title: UCOMM 공통 이벤트 처리
    text: 기능코드 앞 4자리는 동작, 다섯째 자리는 좌우 ALV 구분으로 하나의 핸들러에서 분기
  - title: 자동 필드 계산
    text: 활동유형과 유효종료일로 OBJNR 생성, 고정단가와 변동단가로 총단가 계산, 계산 필드는 입력 잠금
  - title: 데이터 저장 정합성
    text: 저장 직전 check_changed_data, 삭제 백업 테이블의 DB DELETE 후 MODIFY, 성공 시 COMMIT
  sections:
  - 문제 정의 및 개발 배경
  - 업무 프로세스 및 데이터 흐름
  - 핵심 ABAP 구현
  - 설계 판단 및 트러블슈팅
  - 검증 및 결과
  - 기여 및 산출물
  facts:
  - key: 상위 프로젝트
    value: SAP S/4HANA 통합 ERP 구축
  - key: 프로젝트 구분
    value: SAP CODE 아카데미 교육 팀 프로젝트 / 가상 제조기업(태산자전거)
  - key: 프로젝트 기간
    value: 2026.03~07
  - key: 역할
    value: PM / CO 개발
  - key: 프로그램
    value: ZRC1CO0003 (Report + Custom Screen 0100, 등록 팝업 0101)
  - key: 기술
    value: ABAP / Editable ALV / Splitter / Event Handler / Open SQL / Custom Screen
  listTo: sap/catalog
  listLabel: 담당 프로그램 목록
  # 시연 영상, 소스, 설계서: 실제 주소를 확인한 자료만 넣는다 (label, url)
  links: []
shots:
- file: sap/activity_list.jpg
  caption: 조회 화면 / 왼쪽 활동 유형 목록(OBJNR, 유효기간, 범주, 단위), 오른쪽 활동 유형별 코스트센터와 연도, 버전별 고정단가, 변동단가, 총단가
- file: sap/activity_edit.jpg
  caption: 편집 모드와 등록 팝업 / 좌우 ALV에 행 추가, 삭제, 저장 버튼이 나타나고, 데이터 추가 버튼으로 활동 유형 등록 팝업을 엶
---

## 문제 정의 및 개발 배경
제조원가를 산정하려면 생산활동을 구분하는 활동유형(노무시간, 기계시간 등)과 코스트센터별 단가 기준정보가 필요합니다. 활동유형 마스터와 코스트센터 할당, 계획단가는 서로 연결된 데이터여서, 등록하고 수정하는 과정에서 키와 금액이 어긋나지 않아야 합니다.

그래서 활동유형 마스터와 코스트센터별 계획단가를 하나의 화면에서 관리하는 프로그램을 구현했습니다.

### 표준 기능과의 구분
SAP 표준에서는 활동유형 마스터를 KL01/KL02, 활동단가 계획을 KP26에서 다룹니다. 이 프로젝트는 CBO 테이블로 구성한 ERP이므로 표준 트랜잭션을 고치거나 확장하지 않고, 비슷한 업무 기능을 CBO 데이터 구조에 맞춰 새로 구현했습니다.

## 업무 프로세스 및 데이터 흐름
활동유형 조회 → 마스터 등록과 수정 → 코스트센터 할당과 계획단가 입력 → 검증 → 저장 순서로 진행됩니다.

### 데이터 구조
| 데이터 | 테이블 | 키 | 화면 |
| --- | --- | --- | --- |
| 활동유형 마스터 | ZTC1CO0015 | 관리회계영역, 활동유형, 유효종료일 | 왼쪽 ALV |
| 코스트센터별 활동유형 할당 | ZTC1CO0024 | 관리회계영역, 코스트센터, 연도, OBJNR | 오른쪽 ALV |
| 활동단가 (고정, 변동, 총단가) | ZTC1CO0032 | 연도, 기간(POPER), 버전, 코스트센터, OBJNR | 오른쪽 ALV |

활동단가 테이블 ZTC1CO0032는 가공비(임률) 산정(SAPMZC1CO0002)과 계획 임률 산정(ZRC1CO0009)도 함께 쓰는 테이블이며, 연도와 기간, 버전으로 데이터를 구분합니다.

### 처리 순서
| 순서 | 수행 내용 | 처리 기준 |
| --- | --- | --- |
| 1 | 조회 | 관리회계영역과 유효 시작일, 종료일 조건으로 왼쪽에 활동유형 마스터, 오른쪽에 할당과 단가 조인 결과 표시 |
| 2 | 상세 조회 | 왼쪽 활동유형을 더블클릭하면 그 OBJNR의 코스트센터별 단가만 오른쪽에 다시 조회 |
| 3 | 편집 모드 전환 | 좌우 ALV 각각 조회와 편집 모드를 토글 |
| 4 | 등록과 수정 | 행 추가 시 기본값 세팅(왼쪽 유효기간 올해 1월 1일~9999년 12월 31일, 오른쪽 연도 다음 해, 가격단위 1, 통화 KRW). 등록 팝업에서 필수값과 기간 검증 |
| 5 | 파생값 계산 | OBJNR 생성, 마스터 정보 보완, 총단가 계산 |
| 6 | 저장 | 확인 팝업 → 삭제 대상 DB DELETE → MODIFY → 성공 시 COMMIT, 실패 시 ROLLBACK. 왼쪽과 오른쪽은 각각 저장 |

## 핵심 ABAP 구현
### A. Master-Detail Editable ALV
하나의 Custom Screen(0100)에 Splitter로 좌우 ALV를 배치했습니다. 왼쪽 마스터 행을 더블클릭하면 ZTC1CO0024와 ZTC1CO0032를 조인해 해당 OBJNR의 코스트센터별 단가만 오른쪽에 다시 표시합니다.

- 좌우 ALV는 각자의 편집 상태 변수로 조회와 편집 모드를 따로 관리하고, set_ready_for_input으로 입력 가능 여부를 바꿈
- 편집 모드일 때만 툴바에 행 추가, 행 삭제, 저장 버튼을 표시
- 활동유형 신규 등록은 별도 팝업 화면(0101)에서 필수값과 기간을 검증한 뒤 왼쪽 ALV에 추가

### B. UCOMM 기반 공통 이벤트 처리
좌우 ALV에 같은 종류의 툴바 기능이 필요해, 기능코드를 동작 4자리와 대상 1자리로 만들었습니다(TOGLL / TOGLR, IROWL / IROWR, DROWL / DROWR, SAVEL / SAVER). 하나의 user_command 핸들러에서 앞 4자리로 동작을, 다섯째 자리로 왼쪽(L)과 오른쪽(R)을 구분합니다.

```abap
FORM handle_user_command  USING    pv_ucomm.

  CASE pv_ucomm(4).
    WHEN 'TOGL'.
      PERFORM editable_change USING pv_ucomm+4(1).
    WHEN 'IROW'.
      PERFORM insert_row USING pv_ucomm+4(1).
    WHEN 'DROW'.
      PERFORM delete_row USING pv_ucomm+4(1).
    WHEN 'SAVE'.
      PERFORM save_data USING pv_ucomm+4(1).
    WHEN 'RFSH'.
      PERFORM refresh_alv USING pv_ucomm+4(1).
  ENDCASE.

ENDFORM.
```

### C. 값 변경 이벤트와 OBJNR 자동 생성
두 ALV에 수정 이벤트(mc_evt_modified)를 등록하고, data_changed_finished 이벤트에서 바뀐 셀 목록을 필드별로 처리합니다.

- 왼쪽에서 활동유형이나 유효종료일이 바뀌면 OBJNR = 'KL' + 관리회계영역 + 활동유형 + 유효종료일 뒤 6자리(YYMMDD)로 다시 생성 (예: KL1000WELDSM991231)
- 오른쪽에서 활동유형을 입력하면 마스터에서 OBJNR, 범주, 단위를 찾아 채움
- OBJNR, 활동유형 범주, 총단가 셀은 입력 불가 스타일과 색으로 시스템 계산 필드임을 표시

```abap
WHEN 'LSTAR' OR 'DATBI'.
  READ TABLE gt_csla INTO gs_csla INDEX ls_modi-row_id.
  IF sy-subrc = 0.
    gs_csla-objnr = |KL{ pa_kokrs }{ gs_csla-lstar }{ gs_csla-datbi+2(6) }|.
  ENDIF.
  MODIFY gt_csla FROM gs_csla INDEX ls_modi-row_id TRANSPORTING objnr.
```

### D. 고정단가와 변동단가로 총단가 계산
오른쪽 ALV에서 고정단가나 변동단가가 바뀌면 총단가를 고정단가 + 변동단가로 다시 계산합니다. 총단가는 입력할 수 없게 잠가 두어 사용자가 입력한 값과 합계가 어긋나지 않도록 했습니다.

```abap
WHEN 'FPRICE' OR 'VPRICE'.
  READ TABLE gt_cntr_price INTO gs_cntr_price INDEX ls_modi-row_id.
  IF sy-subrc = 0.
    gs_cntr_price-price = gs_cntr_price-fprice + gs_cntr_price-vprice.
  ENDIF.
  MODIFY gt_cntr_price FROM gs_cntr_price INDEX ls_modi-row_id TRANSPORTING price.
```

### E. 삭제 백업 테이블과 DB DELETE, MODIFY
행을 삭제하면 화면과 Internal Table에서 지우기 전에 삭제 백업 테이블에 옮겨 둡니다. 오른쪽 한 행은 할당(ZTC1CO0024)과 단가(ZTC1CO0032) 두 테이블에 걸쳐 있어 백업도 두 테이블 분으로 각각 적재합니다. 저장 때는 백업 테이블 기준으로 DB DELETE를 먼저 하고, 남은 화면 데이터를 MODIFY합니다.

```abap
IF gt_cssl_delete IS NOT INITIAL.
  DELETE ztc1co0024 FROM TABLE gt_cssl_delete.
  CLEAR gt_cssl_delete.
ENDIF.

IF gt_acco_delete IS NOT INITIAL.
  DELETE ztc1co0032 FROM TABLE gt_acco_delete.
  CLEAR gt_acco_delete.
ENDIF.

MOVE-CORRESPONDING gt_cntr_price TO lt_save_cssl.
MOVE-CORRESPONDING gt_cntr_price TO lt_save_acco.

MODIFY ztc1co0024 FROM TABLE lt_save_cssl.
MODIFY ztc1co0032 FROM TABLE lt_save_acco.
```

## 설계 판단 및 트러블슈팅
대표 사례 두 가지와 보조 사례 두 가지입니다.

### 사례 1. ALV 수정값이 Internal Table에 반영되지 않는 문제
- 문제: Editable ALV는 셀 변경분을 자체 버퍼에 두었다가 이벤트 시점에 Internal Table로 넘기기 때문에, 마지막으로 수정한 셀을 확정하지 않고 저장 버튼을 누르면 그 값이 빠진 채 저장될 수 있음
- 처리: 저장 로직 첫 단계에서 해당 ALV의 check_changed_data를 호출해 버퍼 변경분을 확정한 뒤 확인 팝업과 저장을 진행
- 처리: 값 변경 이벤트에서 OBJNR, 총단가 같은 파생값을 Internal Table에 반영한 다음 ALV를 다시 그려 화면과 Internal Table을 맞춤

### 사례 2. ALV에서 삭제한 행이 DB에 남는 문제
- 문제: 저장을 MODIFY dbtab FROM TABLE itab으로만 하면, Internal Table에서 지운 행은 DB에 그대로 남아 재조회 때 다시 나타남
- 처리: 삭제 시점에 행을 삭제 백업 테이블에 적재하고, 저장 때 백업 테이블로 DB DELETE를 먼저 실행한 뒤 MODIFY
- 처리: 오른쪽 ALV는 할당과 단가 두 테이블의 삭제 대상을 각각 적재해 두 테이블에서 함께 삭제

### 보조 사례 1. OBJNR 정합성
- 활동유형이나 유효종료일이 바뀌면 OBJNR을 즉시 다시 만들고, OBJNR 셀은 편집할 수 없게 잠금
- 오른쪽에서 활동유형을 입력하면 왼쪽 마스터의 OBJNR, 범주, 단위를 그대로 가져와 키를 사람이 직접 맞출 필요가 없게 함
- 화면 값의 OBJNR 재계산과 DB에 이미 저장된 행의 정리는 별개입니다. 마스터 키(활동유형, 유효종료일)를 바꾸면 MODIFY는 새 키의 행으로 저장하므로, 기존 행은 삭제 처리로 따로 정리해야 합니다

### 보조 사례 2. 다중 행 삭제 시 인덱스 밀림
- 문제: 여러 행을 선택해 위에서부터 지우면 남은 행의 인덱스가 당겨져 다른 행이 삭제될 수 있음
- 처리: 선택 행 목록을 row_id 내림차순으로 정렬한 뒤 아래 행부터 삭제

## 검증 및 결과
실제 실행 화면에서 확인한 내용과, 소스에서 확인한 처리를 구분해 정리했습니다.

### 실제 화면에서 확인한 내용
- 조회 조건 관리회계영역 1000, 효력 시작일 2026.01.01, 효력 종료일 9999.12.31로 활동 유형 12건이 왼쪽에 표시됩니다
- OBJNR은 KL1000WELDSM991231처럼 'KL' + 관리회계영역 + 활동유형 + 종료일 6자리 형태입니다
- 오른쪽 단가는 총단가 = 고정단가 + 변동단가입니다. 예: 27,763 = 16,589 + 11,174, 46,195 = 34,560 + 11,635
- 편집 모드에서 좌우 툴바에 행 추가, 삭제, 저장 버튼이 나타나고, 데이터 추가 버튼으로 활동 유형 등록 팝업이 열립니다

### 검증 대상별 근거
| 검증 대상 | 소스에서 확인한 처리 | 화면 자료 |
| --- | --- | --- |
| 활동유형 선택에 따른 상세 조회 | 더블클릭 시 OBJNR 조건으로 오른쪽 재조회 | 조회 화면 |
| 조회와 편집 모드 전환 | 좌우 편집 상태 변수와 set_ready_for_input | 편집 모드 화면 |
| OBJNR 자동 생성 | 활동유형, 유효종료일 변경 시 재생성 | 조회 화면의 OBJNR 형식 |
| 총단가 갱신 | 고정단가, 변동단가 변경 시 합계 재계산 | 조회 화면의 단가 합계 |
| 수정 중인 셀의 저장 | 저장 첫 단계 check_changed_data | 실행 결과 화면 없음 |
| 행 삭제 후 DB 반영 | 삭제 백업 테이블로 DB DELETE 후 MODIFY | 실행 결과 화면 없음 |
| 다중 행 삭제 | row_id 내림차순 삭제 | 실행 결과 화면 없음 |

## 기여 및 산출물
CO 담당으로 활동유형 관리 프로그램을 설계하고 ABAP으로 개발했습니다. 소스 변경 이력 기준으로 2026년 4월 6일 최초 개발부터 4월 13일 고정단가, 변동단가 항목 추가까지 작성했습니다.

### 주요 개발 영역
- Master-Detail Editable ALV와 등록 팝업
- 커스텀 툴바와 UCOMM 공통 이벤트 핸들러
- 편집 상태 제어와 계산 필드 입력 잠금
- OBJNR 생성과 총단가 계산
- 필수값 검증, 저장, 삭제 처리

### 산출물
| 산출물 | 내용 |
| --- | --- |
| 프로그램 | ZRC1CO0003 (Report) |
| Include | TOP, S01, C01, O01, I01, F01 |
| 화면 | 0100 메인(좌우 Editable ALV), 0101 활동유형 등록 팝업 |
| 관련 테이블 | ZTC1CO0015 활동유형 마스터, ZTC1CO0024 코스트센터별 활동유형 할당, ZTC1CO0032 활동단가 |
| 실행 자료 | 조회 화면, 편집 모드와 등록 팝업 화면 |

### 배운 점
> Editable ALV에서는 화면에 보이는 값과 저장되는 값이 저절로 같아지지 않았습니다. ALV 버퍼, Internal Table, DB 세 단계를 check_changed_data, 화면 갱신, 삭제 백업으로 직접 맞춰야 했고, 키와 파생값은 프로그램이 계산하도록 해 입력 실수를 줄이는 것이 중요하다는 것을 배웠습니다.
