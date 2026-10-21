---
key: alloc
axis: sap
kind: ABAP
'no': 4
step: 월말 결산 STEP 1
title: 제조간접비 배부
id: SAPMZC1CO0003
role: 직접
depth: 깊게
highlight: 1
principles:
- 사람이 최종 확인하는 자동화
- 같은 실수가 다시 안 생기는 구조
one: 지원부서에 쌓인 비용을 통계지표 비율로 생산부서에 나누고, 시뮬레이션과 전표 미리보기를 거쳐 전표까지 만듭니다.
# v0.7: ZRC1CO0007, ZRC1CO0009 와 같은 사례형 상세. 섹션 이름과 순서는 case.sections
layout: case
case:
  summary: 지원부서(Sender) 코스트센터에 집계된 제조간접비를 통계지표 기준으로 생산부서(Receiver) 코스트센터에 배부하는 프로그램입니다. 배부 기준 조회와 시뮬레이션, 전표 미리보기를 거쳐 FI/CO 전표를 만들고, 배부 이력과 결산 단계 상태까지 함께 처리합니다. SAP 표준 배부 트랜잭션(KSU5/KSV5)을 실행하는 프로그램이 아니라, 유사한 배부 업무 흐름을 CBO 테이블로 구현했습니다.
  points:
  - title: 배부율 계산과 100% 보정
    text: Receiver 통계지표 수량으로 배부율을 계산하고, Segment 합계가 100%가 아니면 마지막 Receiver에 차이를 반영
  - title: 배부 시뮬레이션과 전표 미리보기
    text: CL_GUI_ALV_TREE 두 개로 배부 기준과 예상 배부 금액을 확인하고, 전기 전에 전표를 미리 봄
  - title: ALLOC_YN 중복 배부 방지
    text: 배부 완료 원본 전표와 배부 결과 전표를 조회에서 제외하고, 전기 때 원본 전표에 완료 표시
  - title: 전표와 이력의 단일 LUW
    text: FI 전표, CO 전표, 원본 전표 마킹, 배부 이력을 단계별로 확인하고 하나라도 실패하면 ROLLBACK
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
    value: SAPMZC1CO0003 (Module Pool) / T-Code ZC1CO0003
  - key: 기술
    value: ABAP / Module Pool / Tabstrip / Splitter / CL_GUI_ALV_TREE / ALV Grid / Open SQL / LUW
  listTo: sap/catalog
  listLabel: 담당 프로그램 목록
  # 시연 영상, 소스, 설계서: 실제 주소를 확인한 자료만 넣는다 (label, url)
  links: []
shots:
- file: sap/step1_tree.jpg
  caption: 배부 기준 및 목록 조회 탭 / 왼쪽 배부 기준 Tree(Segment와 Sender 아래 Receiver, 통계지표, 배부 비율), 오른쪽 위 배부 부서 지출 내역, 아래 배부 대상부서와 배부 기준
- file: sap/step1_result.jpg
  caption: 배부 결과 탭 / Sender, Segment, Receiver 순서의 결과 Tree에서 배부 비율과 배부 금액 확인
- file: sap/step1_history.jpg
  caption: 배부 내역 탭 / 배부 이력과 이력 상세(Receiver 차변 금액, Sender 대변 금액)
---

## 문제 정의 및 개발 배경
제조 과정에서는 생산부서뿐 아니라 재무, 인사, 지원 같은 지원부서에서도 비용이 발생합니다. 지원부서에 집계된 비용을 생산부서에 배부해야 제조활동별 원가를 산정할 수 있습니다.

태산자전거 프로젝트에서는 통계지표(면적, 인원수, 전력사용량 등)를 배부 기준으로 쓰고, 배부 결과를 전표와 이력으로 남겨 월말 결산의 다음 단계와 연결하는 기능을 개발했습니다.

### 표준 기능과의 구분
SAP 표준에는 비용 배부 트랜잭션(KSU5/KSV5)이 있지만, 이 프로젝트는 CBO 테이블로 구성한 ERP여서 표준 트랜잭션을 실행하지 않습니다. 배부 Cycle, Segment, Sender, Receiver라는 같은 개념을 CBO 테이블에 두고, 배부 계산과 전표 생성 흐름을 ABAP으로 구현했습니다.

## 업무 프로세스 및 데이터 흐름
배부 기준 조회 → Sender 비용 집계 → Receiver 배부율 산정 → 시뮬레이션 → 전표 미리보기 → 전기 → 이력과 결산 상태 갱신 순서로 진행됩니다.

### 배부 기준 구조
| 구분 | 의미 | 테이블 |
| --- | --- | --- |
| Cycle | 배부 작업의 관리 단위 (배부 규칙) | ZTC1CO0020 |
| Segment | Cycle 안의 세부 배부 규칙과 통계지표 | ZTC1CO0021 |
| Sender | 제조간접비가 집계된 코스트센터와 비용 계정 | ZTC1CO0023 (구분 S) |
| Receiver | 제조간접비를 배부받는 코스트센터 | ZTC1CO0023 (구분 R) |
| 통계지표 | 지표 마스터와 결산월별 Receiver 수량 | ZTC1CO0030 / ZTC1CO0031 |

### 계산 방식
Receiver 배부율(%) = Receiver 통계지표 수량 ÷ Segment 전체 통계지표 수량 × 100

Receiver 배부 금액 = Sender 비용 총액 × Receiver 배부율 ÷ 100

### 처리 순서
| 순서 | 수행 내용 | 처리 기준 |
| --- | --- | --- |
| 1 | 조회 조건 입력 | 회계연도와 결산월, 배부 규칙(Cycle), Sender와 Receiver 코스트센터 범위 |
| 2 | 오픈기간 확인 | 결산 오픈기간(ZTC1CO0039) 상태가 O인 결산월만 조회 |
| 3 | Sender 비용 조회 | 배부 기준의 Sender 코스트센터와 계정으로 비용전표(ZTC1CO0001) 조회. 배부 완료(ALLOC_YN = X)와 배부 결과 전표(BLART = CO) 제외 |
| 4 | Receiver 배부율 산정 | 통계지표 수량으로 배부율 계산, Segment별 100% 보정 |
| 5 | 시뮬레이션 | 결과 Tree에서 Sender, Segment, Receiver별 배부 금액 확인 |
| 6 | 전표 구성과 미리보기 | 확인 팝업, 전기일 입력(기본값 결산월 말일) 후 전표번호 채번, Receiver 차변과 Sender 대변 라인 생성, 미리보기 팝업에서 확인 |
| 7 | 전기 | 배부 문서번호 채번 → FI 전표 → CO 전표 → 원본 전표 마킹 → 배부 이력 → 결산 상태 갱신 → COMMIT |
| 8 | 이력 조회 | 배부 내역 탭에서 문서번호별 이력과 상세 확인 |

## 핵심 ABAP 구현
### A. 배부율 계산과 100% 보정
Segment별 통계지표 합계를 COLLECT로 먼저 구한 뒤, Receiver마다 수량 ÷ 합계 × 100으로 배부율을 계산합니다. 배부율은 소수점 둘째 자리까지 저장하므로 Segment 합계가 100에서 벗어날 수 있어, Segment가 바뀌는 시점과 마지막 Segment에서 합계를 확인하고 차이를 그 Segment의 마지막 Receiver에 더합니다.

```abap
" 새 세그먼트 비율 개산 전 이전 세그먼트 단수 조정
IF lv_prev_seq <> <fs_allo>-seqnr AND sy-tabix <> 1.
  IF lv_sum_prcnt <> 100 AND lv_sum_prcnt > 0.
    READ TABLE gt_allo ASSIGNING FIELD-SYMBOL(<fs_last>) INDEX lv_tabix.
    IF sy-subrc = 0.
      <fs_last>-prcnt = <fs_last>-prcnt + ( 100 - lv_sum_prcnt ). " 100 초과 분 마지막 행에 추가
    ENDIF.
  ENDIF.
  lv_sum_prcnt = 0. " 초기화
ENDIF.

" 개별 비율 계산
READ TABLE lt_total INTO ls_total WITH KEY seqnr = <fs_allo>-seqnr
                                           stagr = <fs_allo>-stagr.
IF sy-subrc = 0 AND ls_total-smeg <> 0.
  <fs_allo>-prcnt = ( <fs_allo>-smeg / ls_total-smeg ) * 100.
ELSE.
  <fs_allo>-prcnt = 0.
ENDIF.
```

### B. CL_GUI_ALV_TREE 기반 조회와 시뮬레이션
CL_GUI_ALV_TREE로 두 가지 계층 화면을 만들었습니다.

- 배부 기준 Tree: Segment와 Sender를 부모 노드로, 그 아래 Receiver와 통계지표 수량, 배부 비율 표시
- 배부 결과 Tree: Sender → Segment → Receiver 순서로 비용 총액, 배부 비율, 배부 금액 표시
- 배부 기준 Tree의 노드를 더블클릭하면 해당 Sender와 Segment 기준으로 오른쪽 지출 내역과 배부 대상 ALV를 다시 조회
- 화면은 Tabstrip(배부 내역 / 배부 기준 및 목록 조회 내역 / 배부 결과)과 Splitter로 구성

### C. Receiver 차변과 Sender 대변 전표 구성
Sender 코스트센터와 계정 단위로 묶은 뒤, 묶음마다 공통 채번 함수 ZFC1FI0001로 전표번호(전표유형 CO)를 받습니다. 각 Receiver마다 배부 금액만큼 Receiver 차변(S) 라인을 만들고, 같은 금액에 -1을 곱한 Sender 대변(H) 라인을 바로 이어 붙여 차변과 대변이 쌍을 이루게 했습니다.

```abap
CALL FUNCTION 'ZFC1FI0001'
  EXPORTING
    iv_bukrs       = ls_t001-bukrs
    iv_blart       = 'CO'
    iv_gjahr       = pa_gjahr
  IMPORTING
    ev_belnr       = lv_belnr
  EXCEPTIONS
    not_found      = 1
    nr_range_error = 2
    OTHERS         = 3.
```

### D. ALLOC_YN 기반 중복 배부 방지
- 조회: Sender 비용 SELECT에서 ALLOC_YN = X(배부 완료)와 BLART = CO(배부 결과 전표)를 제외
- 전기: 조회한 원본 전표를 키(RLDNR, RBUKRS, GJAHR, BELNR, DOCLN) 단위로 UPDATE해 ALLOC_YN = X와 변경 정보 기록
- 마킹이 한 건이라도 실패하면 이미 저장한 FI/CO 전표까지 ROLLBACK

### E. 단일 LUW와 결산 상태 갱신
전기는 배부 문서번호(DOC_NO) 채번 → FI 전표(ZTC1FI0006/0007) → CO 전표(ZTC1CO0001) → 원본 전표 마킹 → 배부 이력(ZTC1CO0038, 상태 P) 순서로 처리합니다. 단계마다 성공 여부를 확인하고, 모두 성공하면 결산 마감 단계 테이블(ZTC1CO0036)의 STEP 2(공통비 배부 실행)를 완료(S)로 갱신한 뒤 한 번만 COMMIT합니다.

## 설계 판단 및 트러블슈팅
대표 사례 두 가지와 보조 사례 두 가지입니다.

### 사례 1. 배부율 반올림으로 인한 금액 불일치
- 문제: 통계지표를 비율로 바꾸면서 소수점 반올림이 생기면 Segment 배부율 합계가 99.99%나 100.01%가 될 수 있고, 그대로 금액을 계산하면 Receiver 배부 금액 합계가 Sender 비용과 어긋남
- 처리: Segment별 배부율 합계를 누적하고, 100이 아니면 마지막 Receiver에 (100 - 합계)를 더해 보정. Segment 부모 노드의 비율은 하위 합산 대신 100으로 고정해 표시
- 처리: 배부 금액은 보정된 배부율로 Receiver마다 Sender 비용 총액 × 배부율 ÷ 100으로 계산
- 확인: 배부율 합계와 배부 금액 합계를 아래 검증 및 결과에서 각각 구분해 확인

### 사례 2. 전표와 이력의 부분 저장 문제
- 문제: FI 전표, CO 전표, 원본 전표 마킹, 배부 이력은 서로 다른 테이블에 저장되므로, 중간 단계가 실패했을 때 앞 단계만 남으면 전표는 있는데 이력이 없거나 마킹이 안 된 상태가 생김
- 처리: 단계마다 성공 플래그(lv_fi_ok, lv_alloc_ok, lv_history_ok)와 sy-subrc를 확인하고, 실패하면 즉시 ROLLBACK WORK 후 오류 메시지를 보여 주고 종료
- 처리: 모든 단계가 성공했을 때만 결산 상태를 갱신하고 COMMIT WORK AND WAIT

```abap
" FI BKPF/BSEG CBO 저장
PERFORM save_fi_document USING lv_doc_no lv_fi_ok.
IF lv_fi_ok <> abap_true.
  ROLLBACK WORK.
  MESSAGE 'FI 전표 헤더/라인 저장 중 오류가 발생했습니다.' TYPE 'S' DISPLAY LIKE 'E'.
  EXIT.
ENDIF.

" 이후 ACDOCA CBO 저장
CLEAR gt_save.
MOVE-CORRESPONDING gt_post TO gt_save.
MODIFY ztc1co0001 FROM TABLE gt_save.
IF sy-subrc <> 0.
  ROLLBACK WORK.
  MESSAGE TEXT-e02 TYPE 'S' DISPLAY LIKE 'E'.
  EXIT.
ENDIF.

" 원본 전표 alloc_YN = 'X'
PERFORM mark_acdoca USING lv_alloc_ok.
IF lv_alloc_ok <> abap_true.
  ROLLBACK WORK.
  MESSAGE '원본 전표 배부완료 처리 중 오류가 발생했습니다.' TYPE 'S' DISPLAY LIKE 'E'.
  EXIT.
ENDIF.

" 같은 DOC_NO로 배부 이력 저장
PERFORM save_history USING lv_doc_no lv_history_ok.
IF lv_history_ok <> abap_true.
  ROLLBACK WORK.
  MESSAGE '배부 이력 저장 중 오류가 발생했습니다.' TYPE 'S' DISPLAY LIKE 'E'.
  EXIT.
ENDIF.

PERFORM update_closing_status.
COMMIT WORK AND WAIT.
```

### 보조 사례 1. 계정코드 자릿수 정규화
- 문제: 비용전표의 계정(RACCT)과 배부 기준, 계정 마스터의 계정코드에 선행 0 유무가 섞여 있으면 단순 조인에서 Sender 비용이나 계정명이 빠짐
- 처리: 조인 조건과 조회 항목에 lpad( racct, 10, '0' )를 써서 SQL 단계에서 10자리로 맞춤

### 보조 사례 2. 재실행 시 중복 배부 방지
- 문제: 배부 후 같은 조건으로 다시 실행하면 같은 Sender 비용이 다시 배부 대상으로 잡힐 수 있음
- 처리: 조회 조건에서 배부 완료와 배부 결과 전표를 제외하고, 전기 트랜잭션 안에서 원본 전표에 완료 표시. 표시가 실패하면 전표까지 함께 취소

## 검증 및 결과
배부율 합계 보정과 실제 전표 금액의 일치는 서로 다른 검증 대상으로 나눠 정리했습니다.

| 검증 대상 | 프로그램 처리 | 실제 화면에서 확인한 내용 |
| --- | --- | --- |
| 배부율 합계 100% | Segment별 합계가 100이 아니면 마지막 Receiver에 차이 반영 | 결과 Tree의 각 Segment 비율 100.00. 예: 전기세 45.23 + 34.85 + 19.92 = 100.00 |
| Receiver 배부 금액 합계와 Sender 비용 | Receiver마다 Sender 비용 총액 × 배부율 ÷ 100 | 예: 전기세 60,000,000 = 27,138,000 + 20,910,000 + 11,952,000 |
| 전표 차변과 대변 | Receiver 차변과 같은 금액의 Sender 대변을 쌍으로 생성 | 배부 이력 상세의 배부 대상 금액 합계 2,725,200,000과 배부 금액 합계 2,725,200,000- |
| 중복 배부 차단 | 조회에서 ALLOC_YN = X, BLART = CO 제외, 전기 때 원본 전표 마킹 | 화면 자료 없음 |
| 오류 시 전체 ROLLBACK | FI, CO, 마킹, 이력 단계별 성공 확인 후 실패 시 ROLLBACK | 화면 자료 없음 |
| 오픈기간과 STEP 2 갱신 | 조회 시 오픈기간 확인, 전기 성공 흐름에서 STEP 2 완료 처리 | 화면 자료 없음 |

### 실제 화면
- 배부 기준 및 목록 조회 탭: 2026년 6월, 혼합형 지표 배부 규칙으로 Segment별 Receiver 통계지표와 배부 비율, Sender 지출 내역(합계 360,000,000)을 표시
- 배부 결과 탭: 테스트 실행 상태에서 Sender, Segment, Receiver별 비용 총액, 배부 비율, 배부 금액을 표시
- 배부 내역 탭: 문서번호별 배부 이력(상태 전기 완료)과 상세 라인을 표시

## 기여 및 산출물
CO 담당으로 제조간접비 배부 프로그램을 설계하고 ABAP으로 개발했습니다. 소스 변경 이력 기준으로 2026년 4월 20일 최초 개발부터 5월 초 배부 이력 로직 추가까지 작성했습니다.

### 주요 개발 영역
- 배부 기준 조회와 배부율 산정, 100% 보정
- CL_GUI_ALV_TREE 기반 배부 기준 Tree와 배부 결과 Tree
- 전표 구성, 미리보기, 전기
- 원본 전표 마킹, 배부 이력, 결산 상태 갱신

### 연계
배부 결과 전표(BLART = CO)와 배부 이력(ZTC1CO0038)은 가공비(임률) 산정 프로그램 SAPMZC1CO0002가 배부받은 비용을 확인할 때 읽습니다.

### 산출물
| 산출물 | 내용 |
| --- | --- |
| 프로그램 | SAPMZC1CO0003 (Module Pool), T-Code ZC1CO0003 |
| Include | TOP, C01, O01, I01, F01 |
| 화면 | 0100 메인(Tabstrip), 0101 배부 기준 및 목록 조회, 0102 배부 결과, 0103 전표 미리보기 팝업, 0104 배부 내역, 0105 정보 팝업 |
| 주요 테이블 | ZTC1CO0001 CO 전표, ZTC1CO0020/0021/0023 배부 기준, ZTC1CO0030/0031 통계지표, ZTC1FI0006/0007 FI 전표, ZTC1CO0038 배부 이력, ZTC1CO0036 결산 단계, ZTC1CO0039 오픈기간 |

### 배운 점
> 배부 프로그램에서는 금액을 나누는 계산만큼 차변과 대변의 균형, 재실행 안전성이 중요했습니다. 반올림 보정, 원본 전표 마킹, 단계별 트랜잭션 처리를 함께 설계해야 결산 금액이 어긋나지 않는다는 것을 배웠습니다.
