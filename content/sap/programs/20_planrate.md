---
key: planrate
axis: sap
kind: ABAP
'no': 2
step: 사전 준비
title: 계획 임률 산정
id: ZRC1CO0009
role: 직접
depth: 보통
highlight: null
principles:
- 계획과 실제의 대칭
one: 올해 월별 실제 임률 평균에 고정비와 변동비 인상률을 따로 적용해 다음 해 계획 임률을 만들고, 월별 실적과 비교해 보여 준 뒤 저장합니다.
# v0.7: ZRC1CO0007 과 같은 사례형 상세. 섹션 이름과 순서는 case.sections
layout: case
case:
  summary: 월말 결산에서 매월 산정한 실제 임률을 바탕으로, 코스트센터와 활동유형별 차기연도 계획 임률을 산정하는 프로그램입니다. 실제 임률의 연평균에 고정비와 변동비 인상률을 각각 적용하고, 월별 실적과 비교해 확인한 뒤 연간 계획 임률을 목표 버전에 저장하도록 구현했습니다.
  points:
  - title: 실제 임률 연평균 집계
    text: HASHED TABLE에 코스트센터, 활동유형 조합별 단가 합계와 실적 월 수를 모아 연평균 산출
  - title: 고정비, 변동비 인상률 분리 적용
    text: 고정단가와 변동단가에 각각 다른 인상률을 적용하고 두 값의 합을 계획 임률로 계산
  - title: 산정 화면 구성
    text: HTML 조건 영역, Tree, 결과 ALV, 불릿 차트를 Splitter로 나눈 Custom Screen
  - title: 저장 전 검증
    text: 확인 팝업과 사전 중복 검증을 거쳐 연간 계획 임률(POPER 000)만 INSERT
  sections:
  - 개요
  - 업무 흐름
  - 핵심 구현
  - 문제 해결
  - 화면과 검증
  - 수행 범위와 산출물
  facts:
  - key: 상위 프로젝트
    value: SAP S/4HANA 통합 ERP 구축
  - key: 프로젝트 구분
    value: SAP CODE 아카데미 교육 팀 프로젝트 / 가상 제조기업(태산자전거)
  - key: 프로젝트 기간
    value: 2026.03~07
  - key: 역할
    value: PM / CO 개발
  - key: 기술
    value: ABAP / Report + Custom Screen 0100, 0200 / HASHED TABLE / ALV Grid / Simple Tree / HTML Viewer + SAPEVENT
  # 상세 아래 "담당 프로그램 목록" 복귀 링크
  listTo: sap/catalog
  listLabel: 담당 프로그램 목록
  # 시연 영상, 소스, 설계서: 실제 주소를 확인한 자료만 넣는다 (label, url)
  links: []
shots:
- file: sap/planrate_calc.jpg
  caption: 산정 화면(0200) / 위쪽 HTML 조건 영역, 왼쪽 코스트센터 Tree, 가운데 활동유형별 산정 결과, 오른쪽 기준 실제 평균과 목표 계획 임률 불릿 차트
- file: sap/planrate.jpg
  caption: 활동유형을 선택한 산정 화면 / 1~12월 기준 실제 단가와 연평균, 목표 계획 단가 비교 (월별 데이터는 화면 확인용)
---

## 개요
차기연도 계획을 세우려면 코스트센터와 활동유형별 임률 기준이 필요합니다. 이 프로그램은 당해연도에 실제로 산정된 임률을 바탕으로 계획 임률을 만듭니다. 실적에서 출발한 계획 임률은 같은 코스트센터와 활동유형 단위로 실적과 비교할 수 있습니다.

원천인 실제 임률은 월말 결산의 가공비(임률) 산정 프로그램 SAPMZC1CO0002가 매월 계산해 ZTC1CO0032에 버전 000, 기간(POPER) 001~012로 기록한 값입니다. ZRC1CO0009는 이 값을 읽어 연평균을 구하고 인상률을 적용해 목표연도 계획 임률을 산정합니다.

### 두 프로그램의 역할
| 구분 | SAPMZC1CO0002 | ZRC1CO0009 |
| --- | --- | --- |
| 산정 대상 | 실제 임률 | 계획 임률 |
| 실행 시점 | 월말 결산 | 차기연도 계획 수립 |
| ZTC1CO0032 위치 | 버전 000, POPER 001~012 (월별) | 목표 버전, POPER 000 (연간) |

## 업무 흐름
실제 임률 조회부터 연간 계획 임률 저장까지 아래 순서로 이어집니다.

| 순서 | 수행 내용 | 처리 기준 |
| --- | --- | --- |
| 1 | 조건 입력과 검증 | 기준연도, 목표연도, 목표 버전, 고정비와 변동비 인상률(기본 3%, 5%). 목표 버전 000은 입력 불가, 기준연도는 목표연도보다 앞서야 함 |
| 2 | 실제 임률 조회 | ZTC1CO0032에서 기준연도, 버전 000, POPER 001~012. 실적이 없으면 안내 후 종료 |
| 3 | 연평균 집계 | 코스트센터, 활동유형 조합별로 고정단가, 변동단가, 총단가 합계와 실적 월 수를 모아 실적 월 수로 나눔 |
| 4 | 고정비, 변동비 인상률 적용 | 평균 고정단가와 평균 변동단가에 각각의 인상률을 적용하고, 두 값의 합을 계획 임률로 계산. 기준 대비 차이금액과 차이율 함께 계산 |
| 5 | 시뮬레이션 | 조합별 1~12월 실제 임률과 연간 계획 임률을 Tree, ALV, 불릿 차트로 비교 |
| 6 | 연간 계획 임률 저장 | 확인 팝업, 중복 검증 후 목표연도, 목표 버전의 POPER 000 행만 INSERT. 성공 시 COMMIT, 실패 시 ROLLBACK |

### 데이터 구분
| 데이터 | 연도와 버전 | 기간(POPER) | 처리 |
| --- | --- | --- | --- |
| 실제 임률 (원천) | 기준연도 / 000 | 001~012 | 조회만 |
| 연간 계획 임률 (결과) | 목표연도 / 목표 버전 (000 제외, 기본값 010) | 000 | INSERT로 저장 |
| 월별 시뮬레이션 | 화면 안의 데이터 | 001~012 | 화면 확인용, 저장하지 않음 |

명칭 표시에는 활동유형 마스터(ZTC1CO0015)와 코스트센터 마스터(ZTC1CO0013)를 함께 읽습니다.

## 핵심 구현
### A. HASHED TABLE 집계
코스트센터와 활동유형을 고유 키로 하는 HASHED TABLE에 단가를 누적합니다. 조합이 처음 나오면 행을 만들고, 이후에는 키로 바로 찾아 고정단가, 변동단가, 총단가 합계와 실적 월 수를 더합니다. 평균은 12가 아니라 실제로 실적이 있는 달 수로 나눕니다.

```abap
gt_sum LIKE HASHED TABLE OF gs_sum WITH UNIQUE KEY kostl lstar.

LOOP AT gt_src_rate INTO gs_src_rate.
  READ TABLE gt_sum ASSIGNING <fs_sum>
    WITH TABLE KEY kostl = gs_src_rate-kostl
                   lstar = gs_src_rate-lstar.
  IF sy-subrc <> 0.
    " (요약) 처음 나온 조합은 키와 단위를 채워 INSERT 후 다시 READ
    INSERT gs_sum INTO TABLE gt_sum.
  ENDIF.
  <fs_sum>-sum_fprice = <fs_sum>-sum_fprice + gs_src_rate-fprice.
  <fs_sum>-sum_vprice = <fs_sum>-sum_vprice + gs_src_rate-vprice.
  <fs_sum>-cnt        = <fs_sum>-cnt + 1.
ENDLOOP.
```

### B. 고정비, 변동비 인상률 분리 적용
총단가에 인상률 하나를 곱하지 않고, 고정단가와 변동단가에 각각 다른 인상률을 적용한 뒤 두 값을 더해 계획 임률을 만듭니다. 그래서 총단가 기준 증가율은 두 인상률 사이 값이 됩니다.

```abap
lv_avg_fprice = ps_sum-sum_fprice / ps_sum-cnt.
lv_avg_vprice = ps_sum-sum_vprice / ps_sum-cnt.

gs_result-plan_fprice = lv_avg_fprice * ( 1 + p_frate / 100 ).
gs_result-plan_vprice = lv_avg_vprice * ( 1 + p_vrate / 100 ).
gs_result-plan_price  = gs_result-plan_fprice + gs_result-plan_vprice.
```

### C. Custom Screen 0100, 0200과 화면 구성
실행하면 산정 화면 0200이 열립니다. 화면은 Splitter로 나뉘어 위쪽에 HTML 조건 영역, 아래쪽에 코스트센터 Tree, 결과 ALV, 차트가 놓입니다. 저장된 계획 임률을 보는 조회용 화면 0100도 같은 구성으로 정의했고, 두 화면은 PF-STATUS와 GUI 객체를 따로 가집니다.

- Tree(cl_gui_simple_tree)에서 코스트센터를 더블클릭하면 그 코스트센터의 활동유형별 연간 결과를 표시
- 활동유형을 더블클릭하면 그 조합의 1~12월 시뮬레이션을 표시
- 결과는 ALV Grid(cl_gui_alv_grid), 차트는 HTML로 만든 불릿 차트로 표시

### D. HTML Viewer와 SAPEVENT
조건 영역과 차트는 HTML로 만들어 HTML Viewer(cl_gui_html_viewer)에 표시합니다. 조건 영역의 버튼(조회 및 산정, 저장, 초기화)은 SAPEVENT로 프로그램에 전달됩니다.

- 이벤트로 받은 값은 공백을 정리하고 대문자로 맞추며, 전체를 뜻하는 값은 조건 없음으로 처리
- 코스트센터와 활동유형 범위는 앞뒤 값이 바뀌어 들어와도 작은 값부터 정렬
- 산정과 재조회, 저장, 초기화를 이벤트 이름별로 나눠 처리

### E. 저장 검증
- 산정 모드가 아니거나 산정 결과가 없으면 저장 차단
- 저장 전 확인 팝업
- 목표연도, POPER 000, 목표 버전, 코스트센터, 활동유형이 같은 기존 데이터를 건별로 확인해 건수를 집계하고, 1건이라도 있으면 건수와 함께 저장 차단
- 검증을 통과한 POPER 000 행만 INSERT하고, 가격단위와 통화가 비어 있으면 기본값(1, KRW)으로 보정, 생성일, 시각, 생성자 기록
- INSERT 성공 시 COMMIT, 실패 시 ROLLBACK

원자재 계획단가(ZRC1CO0007)는 키 기준 MODIFY로 신규와 갱신을 함께 처리합니다. 계획 임률은 이미 저장된 버전을 덮어쓰지 않도록 사전 중복 검증과 INSERT를 사용합니다.

```abap
LOOP AT gt_result INTO gs_result WHERE poper = '000'.
  SELECT SINGLE * FROM ztc1co0032 INTO @gs_dup_rate
    WHERE gjahr = @gs_result-gjahr
      AND poper = '000'
      AND versn = @gs_result-versn
      AND kostl = @gs_result-kostl
      AND lstar = @gs_result-lstar.
  IF sy-subrc = 0.
    lv_cnt = lv_cnt + 1.
  ENDIF.
ENDLOOP.
" lv_cnt > 0 이면 건수와 함께 오류로 저장 중단

INSERT ztc1co0032 FROM TABLE gt_save_rate.   " POPER 000 행만
IF sy-subrc = 0.
  COMMIT WORK AND WAIT.
ELSE.
  ROLLBACK WORK.
ENDIF.
```

## 문제 해결
대표적인 두 가지를 정리했습니다.

### 1. 월별 실적 누락
- 문제: 12개월 실적이 모두 있지 않은 조합을 12로 나누면 연평균이 낮게 계산되고, 실적이 없는 달은 비교할 기준이 없음
- 처리: 조합별 실적 월 수로 나눠 연평균을 구하고, 월별 전개에서 실적이 없는 달은 연평균으로 채움. 차이율은 기준 단가가 0이 아닐 때만 계산
- 확인: 활동유형을 선택하면 1~12월 기준 실제 단가, 연평균, 목표 계획 단가를 한 표에서 비교

### 2. 산정, 조회 화면의 GUI 객체 충돌
- 문제: 산정 화면과 조회 화면이 같은 구성(컨테이너, Splitter, HTML Viewer, Tree, ALV)을 쓰기 때문에, 객체를 함께 쓰거나 이전 화면 객체가 남으면 중복 생성이나 빈 화면이 생길 수 있음
- 처리: 화면별 객체를 따로 선언하고, 컨테이너가 없을 때만 생성하고 있으면 새로고침. 화면을 나갈 때 컨테이너를 해제하고 flush 후 객체 참조를 모두 해제
- 처리: 초기화는 현재 화면 번호를 확인해 그 화면의 Tree, ALV, 조건 영역, 차트만 다시 그림

## 화면과 검증
실제 프로그램 화면에서 확인할 수 있는 내용입니다.

- 산정 화면(0200)에 기준연도 2025, 목표연도 2026, 실제버전 000 고정, 고정비 인상률 3.00%, 변동비 인상률 5.00% 조건으로 활동유형별 결과가 표시됩니다
- 예를 들어 전기/전자 조립(노무) EASSYH는 기준 평균 단가 166,568, 목표 계획 단가 172,905, 증가금액 6,337, 증가율 3.80%입니다. 고정비와 변동비에 다른 인상률을 적용했기 때문에 증가율이 3%와 5% 사이에 있습니다
- 활동유형을 선택하면 1~12월 기준 실제 단가와 연평균 166,568, 목표 계획 단가 172,905를 한 표에서 비교합니다
- 불릿 차트는 활동유형별 기준 실제 평균과 목표 계획 임률을 함께 표시합니다

### 프로그램 안의 검증
| 조건 | 처리 |
| --- | --- |
| 목표 버전이 000 | 입력 오류 |
| 기준연도가 목표연도와 같거나 늦음 | 입력 오류 |
| 기준연도 실제 임률 없음 | 안내 후 종료 |
| 산정 모드가 아니거나 결과 없음 | 저장 차단 |
| 같은 키의 계획 임률이 이미 있음 | 건수와 함께 저장 차단 |
| INSERT 실패 | ROLLBACK |

## 수행 범위와 산출물
CO 담당으로 계획 임률 산정 기능을 설계하고 ABAP으로 구현했습니다. 원천 실제 임률의 기간과 버전 구분, 고정비와 변동비 인상률 분리 적용, 산정 화면 구성, 저장 전 검증까지 맡았습니다.

### 관련 산출물
| 산출물 | 내용 |
| --- | --- |
| 프로그램 | ZRC1CO0009 (Report) |
| Include | TOP, S01, C01, O01, I01, F01 |
| 화면 | 0200 산정, 0100 조회 |
| 사용 테이블 | ZTC1CO0032 임률(원천 조회와 계획 저장), ZTC1CO0015 활동유형 마스터, ZTC1CO0013 코스트센터 마스터 |

### 배운 점
> 계획 데이터는 한 번 확정되면 다른 계산의 기준이 되기 때문에, 산정 로직만큼 저장 정책이 중요하다는 것을 배웠습니다. 같은 테이블을 버전과 기간으로 나눠 실적과 계획을 구분했고, 평균과 비율 계산에서는 빈 달과 0 나누기를 먼저 고려했습니다.
