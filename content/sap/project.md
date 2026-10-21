---
# SAP 프로젝트 메인 페이지 (0.2, 2026-10-16. v0.8 구조에서 SAP ERP 운영, 컨설팅 관점으로 문구와 정보 구조 정리)
# 화면 순서: Hero → 01 프로젝트 개요 → 02 업무 프로세스(E2E, CO) → 03 담당 프로그램(프로그램 및 공통 기능 탭) → 04 프로젝트 성과
# 프로그램 9개와 공통 모듈 2개의 상세 본문은 programs, modules 폴더 (이 파일에서 고치지 않음)
eyebrow: SAP CODE ACADEMY 1기 (2025. 10 ~ 2026. 07) / TEAM PROJECT (2026. 03 ~ 2026. 07)
title: SAP S/4HANA 통합 ERP 구축

hero:
  sub: 구매에서 생산, 출하, 원가와 결산까지 모듈 간 데이터 흐름을 연결한 제조 ERP 프로젝트 설계 및 구축
  lead: 가상 자전거 제조기업 '태산자전거'를 대상으로 생산, 재고, 출하, 재무 업무가 단절되는 문제를 정의하고, SAP S/4HANA 기반의 End-to-End 업무 흐름을 설계하고 구현했습니다. 7인 팀의 PM과 CO 업무 프로세스 설계와 개발을 담당하며 원가 계획, 배부, 재공품 처리와 Fiori 분석 기능을 프로젝트 전체 흐름과 연결했습니다.
  # 0.2: points 가 있으면 lead 문단 대신 불릿으로 보임
  points:
  - 가상 제조기업 '태산자전거' 대상 생산, 재고, 출하, 재무 영역을 S/4HANA 기반 End‑to‑End 프로세스 설계 및 구현
  - 7인 팀 PM으로서 프로젝트 리딩 및 CO(관리회계) 업무 프로세스(원가 계획, 배부, 재공품 처리) 설계, 개발 담당
  - CO 핵심 로직과 Fiori 분석 기능을 전사 ERP End‑to‑End 흐름에 유기적으로 연계
  # 2026-10-21 UX 개선 3: 맨 위에 수상 배지와 발표 영상 썸네일 (가장 강한 증거를 첫 화면에)
  award:
    label: 프로젝트 대상
    sub: SAP CODE 아카데미 1기, 28개 팀 중 1위
  video:
    url: https://www.youtube.com/watch?v=LRzabWyFz90
    caption: 최종 발표 및 End-to-End 시연 영상
  meta:
  - SAP CODE 아카데미 1기 / 2026.03~07
  - 7인 팀 프로젝트 / PM 및 CO 프로세스 설계와 개발
  - SD, MM, PP, FI, CO 연계
  # 실제 프로그램 캡처. 항목 추가 시 자동 가로스크롤 목록에 포함
  shots:
    - file: sap/activity_list.jpg
      caption: 활동유형 관리
      to: sap/activity
    - file: sap/planrate_calc.jpg
      caption: 계획 임률 산정
      to: sap/planrate
    - file: sap/pred_main.jpg
      caption: 원자재 계획단가 예측 및 산정
      to: sap/pred
    - file: sap/step1_tree.jpg
      caption: 제조간접비 배부
      to: sap/alloc
    - file: sap/step2_target.jpg
      caption: 실제 임률 산정 및 생산오더 가공비 배부
      to: sap/step2
    - file: sap/wip_main.jpg
      caption: 재공품(WIP) 산정 및 증분 전기
      to: sap/wip
    - file: sap/cockpit_main.jpg
      caption: 월말결산 콕핏
      to: sap/cockpit
    - file: sap/bva_plan.jpg
      caption: 예산 편성 및 BvA 리포트
      to: sap/bva
    - file: sap/dashboard_main.jpg
      caption: 경영지표 대시보드
      to: sap/dashboard
  detailLabel: 자세히 보기 →
  previewTabs:
    - key: process
      label: 전체 프로세스 보기
      to: sap/e2e
    - key: programs
      label: 개발 프로그램 미리보기
      to: sap/programs
    - key: outcomes
      label: 프로젝트 성과
      to: sap/outcomes
      points:
        - 기준정보와 원가 사전 설정부터 생산계획, MRP, 자재 구매, 입출고, 판매 및 출하, 결산, 수익성 분석까지 통합 구현 내용을 시연함.
        - SAP CODE 아카데미 1기 최종 프로젝트 발표에서 대상 수상(28개 팀 중 1등)
      images:
        - file: sap/pr01.webp
          caption: 최종 프로젝트 발표 현장
        - file: sap/pr02.webp
          caption: 최종 프로젝트 발표 진행
        - file: sap/pr03.webp
          caption: 최종 프로젝트 대상 수상
        - videoUrl: https://www.youtube.com/watch?v=LRzabWyFz90
          caption: 최종 프로젝트 발표 영상
  links:
  - label: 전체 프로세스 보기
    to: sap/process
  - label: 담당 프로그램 보기
    to: sap/programs
  - label: 프로젝트 성과
    to: sap/outcomes

# 01. 프로젝트 개요 (0.2: 프로젝트 배경과 목표 / 프로젝트 구성 및 수행 역할 두 묶음으로 축약)
overview:
  tabs:
    - key: summary
      label: 개요
      sections:
        - title: 프로젝트 한눈에 보기
          table:
            - key: 기간
              value: 2026. 3. 12. ~ 2026. 7. 15.
            - key: 구분
              value: SAP CODE 아카데미 1기 교육 팀 프로젝트
            - key: 인원
              value: 7명 (SD 1, MM 2, PP 1, FI 1, CO 2)
            - key: 역할
              value: 팀 PM 겸 CO 업무 프로세스 설계와 개발
              strong: true
            - key: 구현 범위
              value: 프로그램 9개 (SAP GUI 6, Fiori 3), 공통 전표 함수 1개
            - key: 기술
              value: ABAP, Module Pool, ALV, SAPUI5, CDS, RAP, OData V2/V4
            - key: 성과
              value: 프로젝트 대상, 28개 팀 중 1위
              strong: true
        - title: 통합 구현 범위
          items:
            - 제조기업의 생산, 재고, 출하, 재무 단절 문제를 해결하고자 SAP S/4HANA 기반 통합 시스템 구축
            - PP MRP, MM 구매와 재고, SD 출하, FI 전표, CO 원가와 수익성 분석을 End‑to‑End로 연계
            - ABAP, ALV, CDS, OData, Fiori 기반 프로그램으로 실시간 조회, 자동 전표, 모바일 의사결정 환경 구현
    - key: background
      label: 프로젝트 배경 및 목표
      sections:
        - title: 기업 개요 및 프로젝트 선정 사유
          items:
            - text: "**가상 기업 개요**"
              children:
                - "**(주)태산자전거**: 아카데미 제시 기업 2 \"대형 자전거 설계 및 제조 기업\"(국내 자전거 시장 대상 대량 생산 및 조립)을 바탕으로 팀이 구체화한 **B2B 자전거 제조 및 유통 전문기업**"
                - "사업 규모 설정: 연 매출 3,200억 원, 영업이익 256억 원(영업이익률 8%), 당기순이익 160억 원, 연간 생산 60만 대, 임직원 300명"
                - 아카데미가 정의한 핵심 사업 모델 3가지(**자전거 대량 생산 및 조립, 표준 BOM 기반 부품 관리, 국내 B2B 채널 중심 판매 및 출고**)를 전제로, 리뷰 피드백을 거쳐 기업 컨셉 확정(4/1)
                - "판매: 국내 대리점과 B2B 특판(지자체, 공유 모빌리티 운영사 등) 중심, 일반 소비자 소매 채널 미운영"
                - "생산: **국내 플랜트 1개(TS00)**, 판매계획 기반 **MTS(계획 생산) 중심** 제조, 창고는 플랜트 하위 저장위치(원자재, 반제품, 완제품, 품질검사 대기, 불량 격리)로 구분"
                - "제품: 옵션(배터리 용량, 색상, 브레이크, 휠 사이즈, LCD) 조합을 모두 열지 않고 **확정형 표준 모델 단위 SKU(전기자전거 16종)**로 운영, 조립체(HALB) 8종과 원자재(ROH)로 구성된 **다단계 표준 BOM** 적용(슈퍼 BOM 배제)"
                - "조달: 원자재는 국내 조달, 반제품과 완제품은 자체 생산"
                - 기존 ERP(영림원 K-System 기반 수작업, 단절 중심 운영)의 한계로 **SAP S/4HANA 전환**을 추진하는 시나리오로 설정
                - "현 시스템의 한계: 생산과 자재 계획 연동 미흡, 현장 물류와 시스템 반영 시차, 판매 출하 재무 데이터 단절, 수량 중심 재고 관리, 이동평균가 기반 단가 관리로 표준과 실제 원가 차이 관리 불가"
                - "비즈니스 변화: 옵션 조합 증가, 장기 체류 재고 증가, 출하 매출 원가 시점 불일치, 모바일 현장 대응 요구"
            - text: "**프로젝트 주제(기업) 선정 사유**"
              children:
                - 아카데미가 제시한 7개 가상 기업(아웃도어 신발 제조, 자전거 제조, 영유아 교구 구독, 식자재 유통, 정유, 화장품 제조 및 유통, 가구 제조 및 렌탈) 중 **기업 2 "대형 자전거 설계 및 제조 기업"** 선정(3/13), 대주제는 "수익성 분석을 적용한 통합 재무 및 공급망 관리 서비스"
                - 연산품 원가 배분(정유), 배치와 유통기한(화장품, 식자재), 렌탈 자산(가구), 구독 정산(교구)처럼 업종 특수 프로세스가 중심인 후보와 달리, 수주, 생산계획, 구매, 생산, 출하, 결산으로 이어지는 **PP-MM-SD 물류 흐름과 FI-CO 재무 및 원가 흐름**을 표준에 가까운 형태로 End-to-End 검증할 수 있는 주제
                - Business Challenge에 "부품 단가 변동이 재고 평가 및 원가에 즉시 반영되지 않음"이 명시되어, **표준원가 산정, 간접비 배부, 실제원가 정산, 수익성 분석**까지 CO 결산 프로세스를 깊이 있게 설계할 수 있는 주제
                - 초기 확장안(글로벌 옴니채널, POS 연동, Configurator, 해외 선박 추적)을 1차, 2차 컨설턴트 리뷰 피드백("흐름도와 시나리오를 먼저, 복잡한 로직은 간단명료하게") 이후 **플랜트 1개, 국내 조달, 표준 모델 중심**으로 수렴해 구현 가능한 범위로 확정
        - title: 프로젝트 최종 구축 목표
          items:
            - text: "**End-to-End 통합 공급망 및 재무, 관리회계 연계**"
              children:
                - "MRP, 구매요청, 구매오더, 입고, 생산출고, 생산실적, 판매 출하, 대금청구까지의 물류 이벤트가 **FI 및 CO 전표로 자동 기표**되어 결산과 원가 정산까지 데이터가 끊김 없이 흐르는 통합 ERP 구축 (계획서 추진 범위: In-Memory 기반 디지털 코어, 단일 진실 공급원(SSOT), 물류-재무 실시간 데이터 통합)"
                - 개별 프로그램 기능 나열이 아니라 비즈니스 챌린지 해소 여부를 검증하는 **24단계 통합테스트 시나리오(5구간)**로 전체 흐름 검증
            - text: "**실시간 원가 산정 및 다차원 수익성(CO-PA) 분석 고도화**"
              children:
                - 기존 이동평균가 중심 운영을 **표준원가 기반 관리회계 체계**로 전환하고, **계획단가 예측, 계획 임률, 표준원가**로 계획 원가를 확정한 뒤 **배부, 실제 가공비, WIP, 실제원가 확정**으로 실제 원가를 같은 구조로 산출해 표준과 실제의 차이 분석이 가능한 체계 구축
                - 제품별, 고객별, 사업부별 원가 집계와 마진 분석으로 경영진 의사결정 지원
            - text: "**Clean Core 지향 및 Fiori 기반 웹, 모바일 UX 확장**"
              children:
                - "표준 오브젝트 수정 없이 표준 테이블 구조와 필드명, Data Element를 재사용한 **CBO 테이블** 위에 **CDS View, OData, RAP**을 적용해 확장성 있는 구조 설계 (1차 설계 리뷰 피드백: \"Clean Core = Fiori, Launchpad는 OData와 CDS View 필수\")"
                - 현장과 경영진이 사용하는 화면은 **SAPUI5 Freestyle 앱과 Fiori Launchpad 타일**로 제공해 업무 효율성과 시스템 확장성 동시 확보
            - text: "**수행 방법론**"
              children:
                - "**SAP Activate** 단계(Prepare, Explore, Realize, Deploy)에 따라 진행하고, Explore 단계에서 **Fit-to-Standard 분석**(표준 프로세스와 대상 기업 업무 차이 분석)과 AS-IS, TO-BE 분석 수행, Realize 단계는 스프린트 단위 Agile 방식 병행"
    - key: team
      label: 프로젝트 구성 및 수행 역할
      sections:
        - title: 시스템 아키텍처 및 기술 환경
          items:
            - text: "**구축 환경**"
              children:
                - 아카데미 시스템 아키텍처(BTP Cloud와 On-Premise 병행 구조) 중 **On-Premise S/4HANA 실습 서버(SAP GUI, SAP Gateway, Fiori Launchpad)** 기반으로 구축
                - 표준 테이블, 표준 IMG, 표준 T-Code, BAPI를 사용하지 않는 **100% CBO 개발**, 과정에서 배우지 않은 외부 프로그램(Python, React 등) 사용 금지
                - "Ground Rule: 팀별 테이블 30개 이상, 개인별 DB View 및 Maintenance View 1개, CDS View 2개, 조회 프로그램 3개, 트랜잭션 프로그램 2개, Launchpad 타일 Fiori 앱 3개(프로그램 유형과 구현 기능 각 2종 이상) 이상"
            - text: "**Back-End (SAP S/4HANA On-Premise)**"
              children:
                - 표준 테이블 구조(VBAK, EKKO, MATDOC, ACDOCA 등)와 표준 필드명, 표준 Data Element를 최대한 재사용한 **ZTC1 계열 CBO 테이블**로 전사 데이터 모델 설계, 모듈 간 테이블 공유 및 네이밍 룰 통일
                - ABAP Dictionary 기반 CBO 테이블, Database View 및 Maintenance View, Search Help, Number Range 설계
                - "**Module Pool(Dynpro, Tabstrip, Subscreen)**, **ALV Grid, ALV Tree**, Docking 및 Splitter Container, HTML Viewer(SAPEVENT), `cl_gui_chart_engine` 차트를 활용한 조회 및 트랜잭션 프로그램 구현"
                - 모듈 경계 전표 처리는 **Function Module**(자재 이동 CO 전표, FI 전표, MRP PR 등록 등)로 모듈별 분담 개발, `CALL TRANSACTION`과 ABAP 메모리로 프로그램 간 처리 흐름 연결, 표준원가 릴리즈는 **배치잡**으로 처리
                - 단계별 성공 플래그와 `ROLLBACK WORK`로 묶은 **LUW 단위 전기 처리**로 FI 헤더, FI 아이템, CO 원장 저장의 정합성 확보
            - text: "**Interface (SAP Gateway OData & ABAP RESTful Application Programming Model)**"
              children:
                - "**CDS View**로 SD, PP, MM, CO 데이터를 계층 집계하고, SAP Gateway(SEGW) 기반 **OData V2 서비스**와 **RAP Service Binding 기반 OData V4 서비스**로 Fiori 앱에 노출"
                - RAP **Behavior Definition**(Managed, Draft, Validation, instance 및 static Action)과 Abstract Entity 파라미터를 활용한 CUD 및 업무 처리 로직 구현
                - 개발한 SAPUI5 앱을 BSP 애플리케이션으로 ABAP 저장소에 배포하고 Fiori Launchpad에 등록
            - text: "**Front-End (SAPUI5 & Fiori Launchpad)**"
              children:
                - 모듈별 **Fiori Launchpad 그룹과 타일** 구성 및 TAESAN ERP 전용 Launchpad 테마 적용
                - "**SAPUI5 1.120 Freestyle** 기반으로 조회(Inquiry), CUD, 상신 및 승인 유형과 팝업, Search Help, 화면 이동, 차트, KPI 카드, QR 스캔 기능을 갖춘 웹 및 모바일 앱 구현"
        - title: 모듈 구성 및 통합 업무 프로세스
          items:
            - text: "**전사 모듈 구성 및 데이터 연계 흐름**"
              children:
                - "**PP, MM, SD, FI, CO** 5개 모듈을 SCM(PP, MM, SD)과 FCM(FI, CO) 두 파트로 구성"
                - 판매계획 → 생산계획 → **MRP** → 구매요청 자동 생성 → 구매오더 및 승인 → 원자재 입고(QM 검사, 배치, QR) → 생산출고 → 생산실적 및 완제품 입고 → 판매오더 및 주문 변경 → 출하 지시 및 **PGI** → 대금청구 → **FI, CO 자동 전표** → 간접비 배부, 실제 가공비, WIP, 실제원가 확정 → 월말 결산, 수익성 분석, 경영지표 대시보드로 이어지는 End-to-End 흐름 설계
                - 통합테스트는 **기준정보 및 원가 사전 세팅(1~4) → 생산계획 안정화(5) → 구매, 입고, 생산출고, 재고 추적(6~12) → 판매, 출하, 재무 연계(13~17) → 결산, 원가, 수익성, 경영관리(18~24)**의 5구간 24단계로 구성
                - CO 결산은 PP 생산오더 상태 체계(REL 생산 중, CNF 생산 완료, GRD 입고 완료, TEC 기술적 마감, CLD 정산 완료)를 PP 담당과 협의해 재정의하고, 상태에 따라 가공비 배부, WIP, 오더 마감 대상을 판정
            - text: "**모듈별 핵심 구축 기능**"
              children:
                - "**PP (생산관리)** : 작업장, 라우팅, BOM 관리와 판매계획 기반 생산계획 수립, 예약수량과 공급예정수량을 반영한 MRP 실행 및 생산오더 전환, Fiori 기반 생산오더 및 생산실적 관리"
                - "**MM (자재관리)** : 자재, 공급업체, 구매정보레코드 마스터 관리와 공급업체 평가, PR 및 PO 관리와 Fiori 결재, 입고 품질검사, 자재 입출고 통합 트랜잭션(배치 관리), 안전재고 및 재주문점 관리, 송장 검증, 회전율과 Aging, ABC-XYZ 재고 분석 대시보드, QR 자재 추적"
                - "**SD (판매물류)** : 영업용 모바일 카탈로그와 주문서 작성, 판매오더 생성 및 주문 변경 이력 관리, 출하 지시 및 출고(PGI) 처리, 대금청구와 전자세금계산서 발행, 국내 물류 트래킹"
                - "**FI (재무회계)** : 자동 분개 매핑, 출고 및 대금청구 시 전표 자동 생성 Function Module, 수기 전표 생성과 전표 조회(역분개, 반제), 채권 및 채무 관리, 환산손익, 재무제표, 회계 월말 결산(Fiori)"
                - "**CO (관리회계)** : 코스트센터, 손익센터, 통계지표(SKF), 활동유형, G/L과 원가요소 매핑 마스터 관리, 원자재 계획단가 예측, 계획 임률 산정, 표준원가 산정 및 확정, 제조간접비 배부, 실제 가공비 산정 및 생산오더 마감, 재공품(WIP) 정산, 실제원가 확정, 다차원 수익성 분석(CO-PA), 월말결산 콕핏, 예산 편성 및 BvA, 경영지표 대시보드"
        - title: 팀 조직 및 공동 구축 규모
          items:
            - text: "**팀 조직 및 공동 구축 규모**"
              children:
                - 총 7명(**SD 1, MM 2, PP 1, FI 1, CO 2**), PM 1명(모듈 겸임) 아래 SCM PL(PP)과 FCM PL(CO)이 파트를 이끄는 **TFT(Task Force Team) 조직**으로 운영, 전원이 설계와 개발을 함께 수행하고 테이블 설계 단계에서는 FCM이 SCM을 교차 지원
                - 최종 개발 프로그램 리스트 기준 **CBO 테이블 131개**, **CDS View 78개**, DB View 10개, Maintenance View 7개, **ABAP 프로그램 36개(조회 21, 트랜잭션 15)**, **Fiori 앱 21개** 공동 구축, 전원 Ground Rule 이행률 100%
                - "**24단계 통합테스트 시나리오** 수행 및 최종 발표, **SAP CODE 1기 프로젝트 대상(28개 팀 중 1위)** 수상"
        - title: 프로젝트 총괄 및 CO 개발
          items:
            - text: "**프로젝트 총괄 매니징 (PM 역할)**"
              children:
                - "**WBS 작성 및 버전 관리(V2.0, 3/16 초안 ~ 7/3 최종)**, 주간회의록(1~16주차)과 일일보고서 작성, 4/1부터 개발자별 개인 업무일지 도입, 매일 아침 공통 업무 및 공지 공유, **모든 주간회의 주도**"
                - 프로젝트 계획서(v0.0.1 ~ v0.2.3) 전 장 작성과 버전 관리, 품질관리계획(명명 규칙, 코드 리뷰, 형상 관리, 단위 및 통합 테스트)과 위험관리방안 수립, 기업 정보 문서(AS-IS 및 TO-BE, 비즈니스 챌린지, 조직도, 핵심 사업 모델) 초기 작성
                - 1차(3/24), 2차(3/31) 설계 리뷰와 FCM 컨설턴트 리뷰(4/2) 질문지 사전 정리, 피드백을 반영한 범위 조정(플랜트 1개, 표준 모델 중심, CO 범위 집중)
                - "일정 리스크 대응: 1차 중간평가 전 신규 기능 개발 일시 중단과 평가 대비 집중, 9주차 진척률(37%) 저조 시 WBS 재조정, 11주차 모듈 경계 전표 처리 책임을 함수 단위로 모듈별 분담, 서버 불안정 대비 백업 시연 영상 사전 제작"
                - "**개발자 외 팀원이 테스트하는 교차 단위테스트 순서** 설계, 통합테스트 직전 MM과 PP 간 **자재 마스터 코드 불일치를 전수 표준화**, SD 담당과 함께 **24단계 통합테스트 순서 설계**, 최종 발표 진행"
            - text: "**CO 업무 프로세스 설계 및 직접 개발**"
              children:
                - 원가 계획, 실제비용 배부, 생산오더 가공비, WIP 및 관리와 분석으로 이어지는 CO 프로세스 설계
                - SAP GUI 프로그램 6개와 SAPUI5 Freestyle 앱 3개, 자재 이동 CO 전표 공통 함수 개발
                - 담당 프로그램의 기능과 화면 설계, ABAP 및 SAPUI5 구현, 테스트 수행
                - 표준원가 산정, 실제원가 확정 및 수익성 분석은 PL / CO 담당 팀원 구현
                - 공용 계획단가 저장 버전 대역을 팀원과 협의하고 연계 규칙 적용
    - key: challenges
      label: 비즈니스 챌린지
      sections:
        - title: 비즈니스 챌린지 도출 기준
          items:
            - text: 아카데미가 사전 설정한 **5대 핵심 Business Challenge(세부 항목 13개, 변경 불가)**를 모두 반영하는 조건(대항목마다 세부 항목 1개 이상)에서, 현행 업무의 병목(AS-IS)을 해결하기 위한 시스템적 개선 프로세스(TO-BE)를 도출하여 설계에 반영함.
              children:
                - 13개 세부 항목 중 업무 흐름 위에서 검증 가능한 10개를 선정하고, 최종 보고에서는 **7대 현안**(생산 계획, BOM 및 자재 복잡도, 옵션 단위 안전재고, 판매 출하 재무, 재고 자산, 부품 단가 변동과 원가, 모바일 협업)으로 재구성해 통합테스트 시나리오로 해소 여부 검증
  tabChallenges:
    - "no": "1"
      title: 생산 계획 안정성 확보 및 자재 가용성 연계
      asis:
        - 거래처 주문 시점과 물량 편차로 생산 일정 재조정 빈번, 생산계획 수립 시 실제 자재 가용 수량 미반영으로 계획 대비 생산 차질 발생, 긴급 생산오더 투입 반복
      tobe:
        - 판매계획 기반 생산계획 수립 후 실재고, 공급예정수량, 안전재고를 반영한 MRP 실행, 부족 자재 자동 산출 및 구매요청(PR) 자동 생성, 구매오더 승인과 계획오더의 생산오더 전환까지 연계
      programs: []
    - "no": "2"
      title: 옵션 증가에 따른 BOM 및 자재 복잡도 통제
      asis:
        - 모델별 옵션 조합 확대로 BOM 버전 관리 부담 증가, 유사 부품의 다중 자재 코드 운영과 표준화 기준 부재, 옵션 단위 안전재고와 재주문점 기준 미흡으로 부품 과잉과 부족 반복
      tobe:
        - 슈퍼 BOM을 배제하고 표준 모델(완제품) 단위 확정형 표준 BOM 체계로 정비, 동일 용도 부품은 표준 자재로 통합하고 구버전과 신버전 자재는 버전 관리 및 대체출고 정책(출고 시 대체 가능 자재 목록 안내) 적용, 안전재고, 재주문점, 최대재고 기준을 MRP 가용 수량에 반영하고 재주문점 이하 자재는 구매 검토 대상으로 자동 식별
      programs: []
    - "no": "3"
      title: 판매-출하-재무 데이터의 실시간 통합 운영
      asis:
        - 주문 변경 사항이 생산과 재고 계획에 즉시 미반영, 출하 이후 매출과 원가 반영 시점 간 시차 발생, 반품과 교환 정보의 수익성 분석 연계 누락
      tobe:
        - 주문 변경 시 가용재고와 구매 소요량 즉시 반영 및 변경 이력 관리, 출고(PGI) 처리와 동시에 MM, FI, CO 전표 자동 연계(FI 전표 생성 Function Module, 자재 이동 CO 전표 생성 함수), 대금청구와 전자세금계산서 발행까지 하나의 문서 흐름으로 연결
        - 반품과 교환(세부 3-3)은 컨설턴트 리뷰(4/2)에서 "반품 없음"을 전제로 범위에서 제외
      programs:
        - name: 자재 이동 CO 전표 함수
          to: sap/fm
    - "no": "4"
      title: 전략적 재고 자산 관리 및 부품 단가 변동의 원가 반영
      asis:
        - 수량 중심 재고 관리로 회전율 및 장기 체류 자재 선제 대응 불가, 이동평균가 기반 단가 관리로 부품 단가 변동이 재고 평가와 원가에 즉시 반영되지 않고 물류 정보와 원가 정보가 분리되어 표준과 실제 원가 차이 관리 불가
      tobe:
        - 배치별 회전율, Aging, ABC-XYZ 기반 재고 분석 대시보드와 QR 자재 추적(배치 단위 선입선출), CO 모듈 도입과 연 단위 표준원가 체계 전환(원자재 예측단가와 계획 임률로 표준원가 산정, 확정 후 적용일에 배치로 릴리즈), 자재 이동과 판매 시 CO 전표 즉시 생성 및 원자재 입고 시 표준원가와 계약단가 차이를 가격차이 계정으로 분리, 월말 간접비 배부, 실제 가공비 산정, 재공품(WIP) 정산, 실제원가 확정을 거쳐 제품별, 고객별 다차원 수익성 분석(CO-PA)으로 연결
      programs:
        - name: 원자재 계획단가 예측
          to: sap/pred
        - name: 계획 임률 산정
          to: sap/planrate
        - name: 제조간접비 배부
          to: sap/alloc
        - name: 실제 임률 및 가공비 배부
          to: sap/step2
        - name: WIP 산정
          to: sap/wip
    - "no": "5"
      title: 모바일(Fiori) 기반 실시간 현장 협업 및 의사결정 지원
      asis:
        - 영업 현장에서 주문 가능 재고, 예상 납기, 가격 조건 실시간 확인 불가, 대리점과 B2B 고객 협의 시 즉시 견적 생성이 어려워 계약 리드타임 증가, 경영진의 외부 환경에서 생산 및 매출 현황 파악 한계
      tobe:
        - SAPUI5 및 Fiori Launchpad 기반으로 영업용 모바일 카탈로그(옵션, 재고, 납기, 가격 통합 조회, 견적서 출력 및 판매 문서 전환), 생산실적, QR 재고 관리, PO 결재 앱 구축, 매출, 영업이익률, 생산 달성률, 재고 리스크를 한 화면에서 확인하는 경영지표 대시보드로 경영진 실시간 모니터링 환경 구현
      programs:
        - name: 경영지표 대시보드
          to: sap/dashboard
  title: 프로젝트 배경과 목표
  subtitle: 제조 업무의 단절을 하나의 데이터 흐름으로
  summary:
    - 제조기업의 생산, 재고, 출하, 재무 단절 문제를 해결하고자 SAP S/4HANA 기반 통합 시스템 구축
    - PP MRP, MM 구매와 재고, SD 출하, FI 전표, CO 원가와 수익성 분석을 End‑to‑End로 연계
    - ABAP, ALV, CDS, OData, Fiori 기반 프로그램으로 실시간 조회, 자동 전표, 모바일 의사결정 환경 구현
  background:
    title: "도입 배경: 기존 운영의 한계"
    headline: 수작업과 단절 중심 운영으로 생산 안정성과 데이터 신뢰도 저하
    flow:
      - 운영 효율성 저하
      - 데이터 불일치
      - 의사결정 지연
    items:
      - "no": "01"
        title: 생산, 자재 계획 연동 미흡
        text: 생산계획 수립 시 실제 자재 가용 수량 반영 부족
      - "no": "02"
        title: 현장 물류와 시스템 반영 시차
        text: 입고, 출고, 이동 처리 후 ERP 반영 지연
      - "no": "03"
        title: 판매, 출하, 재무 데이터 단절
        text: 출하 이후 매출, 원가, 전표 반영 시점 불일치
      - "no": "04"
        title: 수량 중심 재고 관리 한계
        text: 회전율, 장기 체류, 재고가치 중심 분석 부족
  challengesTitle: 비즈니스 챌린지
  # 2026-10-21 UX 개선 8: 사용법 안내는 빼고 범례만 남김
  challengesNote: 연계 프로그램 중 파란 표시는 직접 개발한 프로그램입니다.
  challenges:
    - "no": "1"
      title: 생산 계획 안정성 저하
      asis:
        - 주문 시점과 물량 편차로 생산 일정 재조정이 빈번
        - 실제 자재 가용 수량이 충분히 반영되지 않아 생산 차질 발생
      issues:
        - 자재 가용 수량 미반영
        - 생산계획과 자재수급 연계 미흡
      tobe:
        - 생산계획과 자재수급 미연동을 MRP 기능으로 보완
        - MRP에서 실가용 수량을 반영해 부족 자재를 자동 산출
        - 부족 수량 발생 시 구매요청(PR) 자동 생성
      programs:
        - name: 자재 소요량 계산
        - name: 구매요청 관리
      collapsed: true
    - "no": "2"
      title: 옵션 증가로 인한 BOM 및 자재 복잡도 상승
      asis:
        - 모델별 옵션 조합 확대로 BOM 버전 관리 부담 증가
        - 유사 부품 다중 코드 운영과 동일 용도 부품의 표준화 기준 부재로 운영 혼선, 자재 관리 효율성 저하
      issues:
        - BOM 관리 복잡성 증가
        - 유사 부품 다중 코드 운영 및 자재 표준화 기준 미흡
      tobe:
        - 동일 용도 부품은 표준 자재로 통합 운영
        - 구버전과 신버전 자재는 버전 관리 및 대체출고 정책 적용
        - 출고 시 대체 가능 자재 목록 안내
      programs:
        - name: 자재 마스터 관리
        - name: BOM 관리
        - name: 자재 통합 트랜잭션
      collapsed: true
    - "no": "3"
      title: 옵션 단위 안전재고 기준 미흡
      asis:
        - 옵션 단위 안전재고, 최대재고 기준 미흡으로 부품 과잉, 부족 현상 반복
        - 재주문점 기준 부재로 구매 시점 판단이 어려움
      issues:
        - 안전재고 및 최대재고 기준 미흡
        - 재주문점 관리 부재
      tobe:
        - 안전재고 기준 확립으로 이를 반영한 가용 수량 기준으로 MRP 실행
        - 재주문점 이하 자재는 구매 검토 대상으로 자동 식별 및 월초 구매요청 등록 안내
        - 최대재고 기준을 함께 관리해 과잉 구매 방지
      programs:
        - name: 안전재고와 재주문점 설정
        - name: MRP 프로그램
      collapsed: true
    - "no": "4"
      title: 판매, 출하, 재무 데이터 단계별 운영
      asis:
        - 주문 변경 사항이 생산 및 재고 계획에 즉시 반영되지 않음
        - 출하 이후 매출 및 원가 반영 시점 간 시간차 발생
      issues:
        - 출하, 매출, 원가 시차 존재
        - 주문 변경 영향 반영 지연
      tobe:
        - 주문 변경 시 가용재고, 구매 소요량을 즉시 반영
        - PGI 처리와 동시에 MM, FI, CO 전표 자동 연계
      programs:
        - name: 주문 변경 프로그램
        - name: 판매 출고 요청
        - name: 전표 조회
      collapsed: false
    - "no": "5"
      title: 재고 자산 전략적 관리
      asis:
        - 재고 수량 중심 관리로 회전율, 장기 체류 현황 파악이 어려움
        - 배치 단위 이력 추적이 제한적이어서 선제 대응이 어려움
        - 재고 리스크를 자산 가치 관점에서 보기 어려움
      issues:
        - 회전율 가시성 부족
        - 장기 체류 재고 대응 한계
        - 배치 추적 및 자산 관점 미흡
      tobe:
        - 배치별 회전율, Aging 기반 재고 분석 대시보드 제공으로 재고 리스크 중심 관리
        - QR 기반 자재 추적과 입출고 이력 조회 지원
      programs:
        - name: 재고 분석 대시보드
        - name: QR 자재 추적 관리
        - name: 자재 문서 통합 조회
      collapsed: true
    - "no": "6"
      title: 부품 단가 변동과 원가 반영
      asis:
        - 부품 단가 변동이 재고 평가 및 원가에 즉시 반영되지 않음
        - 물류 정보와 원가 정보가 분리되어 실시간 손익 분석에 한계
        - 표준원가와 실제원가 차이 관리가 어려움
      issues:
        - 이동평균가 사용 및 부품 단가 변동 반영 지연
        - 재고 가치와 원가 정보 분리
      tobe:
        - CO 모듈 도입으로 원자재 예측단가 및 계획 임률 기반으로 표준원가 산정
        - 자재 이동 및 판매 시 회계전표를 즉시 생성해 원가 반영
        - 제품, 고객별 수익성 분석으로 손익 변동 확인
      programs:
        - name: 계획단가 예측
          to: sap/pred
        - name: 계획 임률 산정
          to: sap/planrate
        - name: 자재 이동 CO 전표 함수
          to: sap/fm
        - name: 표준원가 산정
        - name: 다차원 수익성 분석
      collapsed: false
    - "no": "7"
      title: 모바일 기반 실시간 협업
      asis:
        - 영업 담당자가 현장에서 주문 가능 재고, 예상 납기, 가격 조건을 확인하기 어려움
        - 경영진이 외부 환경에서 생산 및 매출 현황 확인이 어려움
        - 모바일 기반 협업 및 의사결정 체계가 부족
      issues:
        - 현장 영업 실시간 조회 한계
        - 경영진 외부 모니터링 한계
        - 모바일 협업 체계 부족
      tobe:
        - Fiori 모바일 카탈로그로 옵션, 재고, 납기, 가격 통합 조회
        - 매출, 생산, 재고 현황을 KPI 대시보드, 생산실적 Fiori 등으로 실시간 제공
      programs:
        - name: 영업용 모바일 카탈로그
        - name: 경영지표 대시보드
          to: sap/dashboard
        - name: 생산실적 관리
      collapsed: false
  recap:
    title: "요약: AS-IS → TO-BE"
    rows:
      - asis: 생산 계획 안정성 저하
        tobe: MRP와 PR 자동 생성으로 생산계획과 자재수급 연계
      - asis: BOM 및 자재 복잡도 상승
        tobe: 자재 표준화와 대체출고 지원
      - asis: 옵션 단위 안전재고 기준 미흡
        tobe: 안전재고, 재주문점, 최대재고 관리
      - asis: 판매, 출하, 재무 단계별 운영
        tobe: 주문변경에서 PGI, 전표까지 자동 연계
      - asis: 재고 자산의 전략적 관리
        tobe: 회전율, Aging, 배치 추적 기반 관리
      - asis: 부품 단가 변동과 원가 반영
        tobe: 표준원가, CO 전표, 수익성 분석
      - asis: 모바일 기반 실시간 협업
        tobe: Fiori 모바일 조회와 KPI 대시보드
    repsTitle: 대표 구현 프로그램
    reps:
      - 생산계획 관리와 MRP
      - 구매요청, 구매오더, 자재 입출고
      - 출하 및 PGI 처리
      - 전표 조회, 원가, 수익성 분석
      - 재고 분석과 QR 추적
      - 모바일 카탈로그와 KPI 대시보드
    messageLabel: 핵심 메시지
    message: SAP S/4HANA 기반 End‑to‑End 프로세스와 ABAP, Fiori 프로그램으로 통합 해결
    visible: false
  paragraphs:
    - 태산자전거는 일반 자전거와 전기자전거를 제조, 조립하고 B2B로 공급하는 가상 기업입니다. 이 시나리오에서는 생산계획과 자재 가용량의 불일치, 입출고 내역의 반영 시차, 판매와 출하, 재무 데이터의 단절, 수량 중심의 재고 관리가 주요 업무 과제로 설정됐습니다.
    - 프로젝트는 이 과제를 개별 화면의 개선으로만 다루지 않고, PP의 생산계획과 MRP, MM의 구매와 재고, SD의 판매와 출하, FI의 전표, CO의 원가와 수익성 데이터를 연계하는 방식으로 접근했습니다. SAP S/4HANA 교육용 서버에서는 표준 업무 테이블과 BAPI 등 주요 표준 기능을 활용할 수 없어, 자체 업무 테이블(CBO)과 ABAP 프로그램을 중심으로 시스템을 구현해야 했습니다. 이러한 환경에서 구매, 생산, 판매, 재무, 원가관리의 데이터 구조와 처리 로직을 직접 설계하고, 모듈 간 문서 및 전표 연계 흐름을 구현하고 검증했습니다.
  scenario: 원자재는 외부에서 구매하고, 반제품은 내부에서 생산하며, 완제품은 조립하는 가상 제조기업 시나리오입니다.
  goalsTitle: 기존 업무의 문제와 통합 ERP 구축 목표
  goals:
    - title: 업무 프로세스 연결
      asis:
        - 생산계획과 자재 수급 간 단절
        - 출하, 회계, 원가의 반영 시차
      tobe:
        - 구매부터 생산, 출하, 결산까지 단계별 데이터 관계 구축
        - MRP와 실가용 재고, 안전재고와 재주문점 기준 연계
        - 판매와 출고 이벤트를 FI, CO 전표와 연계
    - title: 데이터 정합성 확보
      asis:
        - 재고 데이터의 반영과 분석 한계
      tobe:
        - 마스터, 문서, 전표, 처리 상태의 연결 기준 정리
        - 입고, 출고, 배치 이력과 회전율, Aging 분석
    - title: 의사결정 정보 제공
      asis:
        - 경영 현황의 분산
      tobe:
        - ABAP 기반 처리와 Fiori 기반 조회, 분석 병행
        - Fiori 기반 매출, 생산, 재고 KPI 통합 조회
  table:
    - key: 기간
      value: 2026. 3. 12. ~ 2026. 7. 15.
    - key: 구분
      value: SAP CODE 아카데미 1기 교육 팀 프로젝트
    - key: 인원
      value: 7명 (SD 1, MM 2, PP 1, FI 1, CO 2)
    - key: 역할
      value: 팀 PM 겸 CO 업무 프로세스 설계와 개발
      strong: true
    - key: 구현 범위
      value: 프로그램 9개 (SAP GUI 6, Fiori 3), 공통 전표 함수 1개
    - key: 기술
      value: ABAP, Module Pool, ALV, SAPUI5, CDS, RAP, OData V2/V4
    - key: 성과
      value: 프로젝트 대상, 28개 팀 중 1위
      strong: true
  showScenario: false

# 01. 프로젝트 구성 및 수행 역할
team:
  title: 프로젝트 구성 및 수행 역할
  subtitle: 7개의 역할, 하나의 제조 ERP 흐름
  lead: 팀원들은 MM, PP, SD, FI, CO 영역의 업무와 프로그램을 나눠 맡았습니다. 저는 PM 역할과 CO 업무 프로세스 설계와 개발을 맡아 업무 흐름을 조율하는 동시에 원가 계획, 실제비용 배부, 생산오더별 가공비와 WIP 처리, Fiori 분석 기능을 구현했습니다.
  head:
    - 역할
    - 담당 영역
  rows:
    - - PM / CO
      - CO 프로그램 9개 (SAP GUI 6, Fiori 3), 공통 전표 함수 1개, 보조 도구 1개, 프로젝트 진행 조율
      - 본인
    - - PL / CO
      - 표준원가와 실제원가 산정, 수익성 분석 등 원가 관련 프로그램
      - 팀원
    - - PP
      - 생산계획, MRP, 생산오더와 생산실적
      - 팀원
    - - MM (2명)
      - 구매와 자재 관리, 재고와 입출고, 안전재고와 재주문점
      - 팀원
    - - SD
      - 판매오더, 모바일 카탈로그, 출하와 출고
      - 팀원
    - - FI
      - 전표, 재무제표, 회계 결산
      - 팀원
  rolesTitle: 내가 맡은 일
  rolesNote: PM과 CO 담당 범위만 요약했습니다. 상세 활동과 의사결정 근거는 04 프로젝트 성과에 있습니다
  points:
    - 모듈별로 업무와 프로그램을 분담하여 개발
  showRoles: false

# 0.2: 담당 범위 요약만 (주간회의, WBS, 일일보고, 자재코드 표준화, 산출물 등 상세는 05 로 옮김)
roles:
- title: PM
  badge: 7명 팀
  items:
  - text: 일정, 우선순위와 개발 진척 관리
    role: 직접
  - text: 모듈 간 인터페이스와 공통 데이터 기준 조율
    role: 직접
  - text: 통합테스트 25단계 순서 설계
    role: 공동
  - text: 최종 발표
    role: 직접
- title: CO 프로세스 설계 및 개발
  badge: CO 2명 중 1명
  items:
  - text: SAP GUI 프로그램 6개 (계획에서 월말 결산까지)
    role: 직접
  - text: Fiori 앱 3개 (대시보드, 콕핏, 예산 BvA)
    role: 직접
  - text: 공통 전표 함수 1개, 보조 도구 1개 (시연 데이터)
    role: 직접
  - text: 표준원가, 실제원가 확정
    role: 팀

# 02. 업무 프로세스
coDocument:
  - name: 계획 기준
    tracks:
      - label: 원자재 단가 기준
        nodes:
          - title: 원자재 계획단가 예측
            sub: 구매 계약단가 이력으로 차기연도 원자재 계획단가
            go: pred
            role: 직접
      - label: 임률 기준
        nodes:
          - title: 활동유형 관리
            sub: 활동유형과 계획 임률 관련 기준정보 관리
            go: activity
            role: 직접
          - title: 계획 임률 산정
            go: planrate
            role: 직접
    target:
      label: 두 계획원가 기준이 모이는 곳
      title: 표준원가 산정
      sub: 팀원 구현 (PL / CO 담당). 원자재 계획단가와 계획 임률을 함께 사용
      role: 팀
  - name: 실제 발생과 결산
    entryLabel: 원가 전표의 유입
    entry:
      title: 자재 이동 CO 전표 자동 생성
      sub: 입고, 생산출고, 제품 입고, 판매 출고 시 표준원가로 원가 전표 생성, 원자재 입고 시 가격차이 분리
      go: fm
    branchLabel: 배부와 생산오더 상태별 후속 처리
    allocation:
      title: 제조간접비 배부
      go: alloc
    processing:
      title: 실제 임률 산정, 가공비 배부 및 오더 마감
      go: step2
    branches:
      - title: "완료 오더(GRD): TEC 마감 → 실제원가 확정"
        role: 팀
      - title: "진행 중 오더(REL): 재공품(WIP) 산정 및 전기"
        go: wip
  - name: 결산 관리와 분석
    nodes:
      - label: 결산 상태 관리
        title: 월말결산 콕핏
        sub: 결산 상태와 단계 확인, 미실행 단계와 처리 이력 조회
        go: cockpit
        role: 직접
      - label: 예산 및 실적 분석
        title: 예산 편성 및 BvA 리포트
        sub: 예산 편성과 배부, 계획 대비 실적 비교
        go: bva
        role: 직접
      - label: 경영정보 조회
        title: 경영지표 대시보드
        sub: 매출, 생산, 재고 KPI 조회와 분석
        go: dashboard
        role: 직접
process:
  intro: 프로젝트 전체의 업무 흐름과, 그중 제가 담당한 CO 업무 흐름을 나눠 정리했습니다. 전체 프로세스에서 데이터가 어떻게 이동하는지 확인한 뒤 CO 단계의 실제 구현 사례로 내려갈 수 있습니다.
  e2e:
    title: End-to-End 프로세스
    subtitle: 한 번의 업무 흐름으로 이어지는 구매, 생산, 출하, 재무
    desc: 원가와 재고 기준을 미리 준비한 뒤 생산계획에서 자재 소요량을 산출하고, 구매와 입고, 생산출고, 판매출하를 거쳐 결산과 수익성 분석으로 이어지는 통합 시나리오를 구성했습니다. 각 단계의 데이터가 다음 단계의 입력이 되는 관계를 중심으로 연결했습니다.
    steps:
      - "no": "01"
        title: 기준정보, 원가 사전 세팅
        items: 원자재 예측단가, 계획 임률, 표준원가, 안전재고와 재주문점 설정
        challenge: 부품 단가 변동, 안전재고 기준 미흡
        modules: CO, MM
        # 2026-10-21 UX 개선 17: 링크 순서를 카드 순서와 같게
        programs:
          - planrate
          - pred
      - "no": "02"
        title: 생산계획 안정화
        items: 생산계획, MRP, PR 자동 생성
        challenge: 생산 계획 안정성 저하
        modules: PP, MM
        programs: []
        team: 팀원 구현
      - "no": "03"
        title: 구매, 입고, 생산출고, 재고추적
        items: PR, PO, 입고, 원자재 출고, 배치, QR, 재고 분석
        challenge: BOM과 자재 복잡도, 전략적 재고관리
        modules: MM, PP, FI 연계
        programs:
          - fm
      - "no": "04"
        title: 판매, 출하, 재무 연계
        items: 모바일 카탈로그, 주문 변경, 출하 지시, PGI, 전표 조회
        challenge: 판매, 출하, 재무 단계별 운영, 모바일 협업
        modules: SD, MM, FI, CO 연계
        programs: []
        team: 팀원 구현
      - "no": "05"
        title: 결산, 원가, 수익성, 경영관리
        items: 간접비 전표, 제조간접비 배부, 실제 가공비, 실제원가, 월말결산, 수익성 분석, KPI
        challenge: 원가 반영, 경영진 의사결정
        modules: CO, FI, Fiori
        programs:
          - alloc
          - step2
          - wip
          - cockpit
          - bva
          - dashboard
        toCo: true
    issueTitle: 업무 프로세스와 주요 문제점, 도입 방안
    issueHead:
      - 업무 단계
      - 주요 문제점
      - 도입 방안
    issueRows:
      - stage: 생산 계획 수립, 자재 소요량 계획
        issue: 계획 수량 대비 가용 수량 차질 발생
        fix: 생산 및 자재 소요 계획 안정화
      - stage: 구매 요청 및 구매 오더
        issue: 옵션별 안전재고 기준 부재
        fix: 안전재고 및 재주문점 설정
      - stage: 원자재 입고, 완제품 생산 및 입고
        issue: 수량 중심의 재고 운영
        fix: 재고 자산의 전략적 분석 체계 구축
      - stage: 판매, 출고, 대금 청구
        issue: 판매, 출하, 재무 데이터 분리
        fix: 판매, 출하, 재무 통합 프로세스 구축
      - stage: 원가 산정, 회계 결산, 의사결정 지원
        issue: 모바일 기반 협업 및 의사결정 체계 부족
        fix: 모바일 기반 실시간 의사결정 지원
    stepsTitle: 프로젝트 시연 순서
    stepsEnd: ""
    stepsAlt: 5단계 흐름. 01 기준정보와 원가 준비, 02 생산계획과 MRP, 03 구매, 자재, 생산, 04 판매와 출하, 05 원가, 결산, 분석 순서로 앞 단계의 데이터가 다음 단계의 입력이 됩니다.
    interfacesTitle: 모듈 사이의 데이터 연결
    interfaces:
      head:
        - 발생한 데이터, 이벤트
        - 다음 단계에서의 활용
        - 연결의 의미
        - 구현 구분
      rows:
        - - PP 생산계획, BOM, MRP
          - MM 부족 자재 PR, PO
          - 생산계획과 구매수요 연결
          - 문서 연결 (PP, MM 팀원 구현)
        - - MM PO와 자재 입고
          - 재고 수량, 배치, 회계전표
          - 물류 처리 결과와 회계 연계
          - 전표 연계 구현 (입고 101 때 CO 전표 함수 호출)
        - - MM 생산 출고
          - 생산오더 자재 투입비용
          - 물류 데이터가 원가로 연결
          - 전표 연계 구현 (생산출고 261 CO 전표)
        - - SD 판매오더, PGI, 청구
          - 재고 감소, 매출과 원가, 회계
          - 판매, 출하, 회계 시점 연결
          - 일부 구현 (판매 출고 601 CO 전표는 함수로 생성, 청구 이후 회계는 SD, FI 팀원 영역)
        - - FI, CO 비용 전표
          - CO 실제 임률, 오더 배부, WIP
          - 비용을 생산오더와 결산 결과로 추적
          - 전표 연계 구현 (CO 결산 프로그램이 원가 전표를 집계하고 배부 전표 생성)
        - - SD, PP, MM 집계
          - 경영지표, 분석 화면
          - 모듈별 데이터를 판단 지표로 재구성
          - 조회 연계 (최종 시연은 시연용 데이터)
    interfacesNote: 구현 구분의 "전표 연계 구현"은 프로젝트에서 전표 생성까지 직접 구현한 연결이고, "문서 연결"과 "조회 연계"는 업무 흐름상의 데이터 이동입니다. 모든 연계는 SAP 표준의 실시간 자동 전표가 아니라 교육용 서버의 CBO 기반으로 구현했으며, 경영지표 대시보드의 최종 시연은 시연용 데이터로 진행했습니다.
    showInterfaces: false
  co:
    title: CO 모듈 프로세스
    subtitle: 계획원가에서 실제원가와 재공품까지
    lead: CO 영역은 계획 기준을 만드는 단계와 실제 발생 비용을 산정하고 배부하는 단계, 그리고 결산 상태와 경영정보를 보는 관리, 분석 기능으로 나뉩니다. 원자재 계획단가와 계획 임률은 서로 독립된 계획원가 기준으로 표준원가 산정에 쓰이고, 실제 비용은 자재 이동 전표와 배부를 거쳐 생산오더에 반영된 뒤 오더 상태에 따라 후속 처리됩니다.
    notesTitle: 흐름도에서 오해하기 쉬운 부분
    notes:
      - 원자재 계획단가 예측과 계획 임률 산정은 차례로 실행되는 단계가 아니라 서로 독립된 계획원가 기준이며, 표준원가 산정(PL / CO 팀원 구현)이 두 기준을 함께 사용합니다.
      - 가공비 배부 뒤 REL 오더는 WIP 산정 대상이 되며, WIP는 당월 WIP에서 전월 WIP를 뺀 증분만 전기합니다. GRD 오더는 조건을 갖추면 가공비 배부 프로그램 안에서 TEC로 마감되며, WIP 프로그램은 오더를 마감하지 않습니다.
      - 표준원가 산정과 실제원가 확정은 PL / CO 팀원이 맡은 별도 프로그램이라 점선으로 표시하고 제 개발 수에 넣지 않았습니다. 실제원가 확정의 실행 시점은 이 흐름도에서 단정하지 않습니다.
      - 결산 관리와 분석 줄의 세 Fiori 화면은 결산 순서의 다음 단계가 아니라 서로 독립된 기능입니다. 월말결산 콕핏은 결산 상태를 조회할 뿐 전표를 직접 만들지 않습니다.
    points:
      - CO 영역을 계획원가 기준 수립, 실제원가 산정 및 배부, 결산 관리 및 경영정보 분석으로 구분
      - 원자재 계획단가와 계획 임률을 독립적인 계획원가 기준으로 활용하여 표준원가 산정
      - 자재 이동 전표 및 비용 배부를 통한 생산오더별 실제원가 반영
      - 생산오더 상태에 따른 후속 처리 및 결산 현황 관리
    showNotes: false
  showIntro: false

# 0.2: CO 업무 흐름도. lane 안의 tracks 는 나란히 있는 경로(위에서 아래로), target 은 여러 경로가 모이는 곳,
#      nodes 안의 branch 는 상태별 분기, independent 는 화살표 없이 서로 독립된 기능
flow:
  title: CO 업무 흐름
  # 2026-10-21 UX 개선 8: 사용법 안내 문장 삭제
  note: ''
  alt: 계획 기준 줄에서는 원자재 계획단가 예측과 활동유형 관리 및 계획 임률 산정이 표준원가 산정(팀원 구현)으로 모입니다. 실제 발생과 결산 줄에는 제조간접비 배부, 실제 임률 산정 및 생산오더 가공비 배부, 재공품 산정 및 마감과 팀원 프로그램인 실제원가 확정이 표시됩니다. 월말결산 콕핏, 예산 편성 및 BvA, 경영지표 대시보드는 서로 독립된 기능입니다.
  lanes:
    - name: 계획 기준
      tracks:
        - label: 원자재 단가 기준
          nodes:
            - title: 원자재 계획단가 예측
              sub: 구매 계약단가 이력으로 차기연도 원자재 계획단가
              go: pred
              role: 직접
        - label: 임률 기준
          nodes:
            - title: 활동유형 관리
              sub: 활동유형과 계획 임률 관련 기준정보 관리
              go: activity
              role: 직접
            - title: 계획 임률 산정
              go: planrate
              role: 직접
      target:
        label: 두 계획원가 기준이 모이는 곳
        title: 표준원가 산정
        sub: 팀원 구현 (PL / CO 담당). 원자재 계획단가와 계획 임률을 함께 사용
        role: 팀
    - name: 실제 발생과 결산
      tracks:
        - label: 자재 이동에 따른 비용 발생
          nodes:
            - title: 자재 이동에 따른 CO 전표 연계
              sub: MM 입출고 때 이동유형별 CO 전표 생성 (공통 함수). 배부, 가공비, WIP 프로그램이 이 전표를 집계
              go: fm
              role: 직접
          visible: false
        - label: 배부와 생산오더 상태별 후속 처리
          nodes:
            - title: 제조간접비 배부
              go: alloc
              role: 직접
            - title: 실제 임률 산정 및 생산오더 가공비 배부
              go: step2
              role: 직접
            - title: 재공품 산정 및 마감
              go: wip
              role: 직접
        - label: 팀원 프로그램
          nodes:
            - title: 실제원가 확정
              sub: 팀원 구현 (PL / CO 담당)
              role: 팀
    - name: 결산 관리와 분석
      independent: true
      tracks:
        - nodes:
            - label: 결산 상태 관리
              title: 월말결산 콕핏
              sub: 결산 상태와 단계 확인, 미실행 단계와 처리 이력 조회
              go: cockpit
              role: 직접
            - label: 예산 및 실적 분석
              title: 예산 편성 및 BvA 리포트
              sub: 예산 편성과 배부, 계획 대비 실적 비교
              go: bva
              role: 직접
            - label: 경영정보 조회
              title: 경영지표 대시보드
              sub: 매출, 생산, 재고 KPI 조회와 분석
              go: dashboard
              role: 직접
  footnote: 통합테스트 25단계 중 1, 2단계(계획)와 20, 21, 25단계(결산, 대시보드)가 제 프로그램입니다. 점선은 팀원 프로그램입니다.
  showRoles: false
  showFootnote: false

# 03. 담당 프로그램 (요약 패널 9개, 누르면 기존 상세로). programs 는 카드 목록 이름이라 panels 로 씀
panels:
  badge: CORE DELIVERABLES
  subtitle: CO 업무 흐름을 구현한 9개의 개발 결과물
  description: 원가 계획부터 실제비용 배부, 재공품 평가 및 경영 지표까지 SAP CO End-to-End 프로세스 기반의 SAP GUI(ABAP) 및 SAP Fiori 통합 구현
  notice: ''
  flow:
    - "no": STEP 01
      title: 원가 및 임률 계획
    - "no": STEP 02
      title: 실제 배부 및 WIP
    - "no": STEP 03
      title: 결산 콕핏 및 대시보드
  groups:
    - name: SAP GUI / ABAP
      count: 6개
      # 2026-10-21 UX 개선 17: 카드 순서와 번호를 상세 페이지 이전, 다음 순서(업무 흐름)와 같게
      items:
        - key: activity
          code: GUI-01
          type: gui
          phase: 기준 정보
          title: 활동유형 관리
          one: 활동유형 마스터, 코스트센터 할당, 계획단가 단일 화면 등록, 수정, 삭제 통합 관리
          points:
            - Master-Detail 구조 이중 ALV 인터랙션 연동
            - 변경 및 삭제 내역 실시간 검증과 DB 동기화
          tags:
            - Editable ALV
            - Event Handler
            - Data Sync
        - key: planrate
          code: GUI-02
          type: gui
          phase: 원가 계획
          title: 계획 임률 산정
          one: 월별 실제 임률 집계 및 고정비, 변동비 인상률 차등 적용 기반 차기연도 계획 임률 산정
          points:
            - 코스트센터 및 활동유형별 실적 다차원 집계
            - 연간 계획 임률 시뮬레이션 및 조회 화면 구현
          tags:
            - ABAP
            - Hashed Table
            - Simple Tree
            - ALV Grid
        - key: pred
          code: GUI-03
          type: gui
          phase: 원가 계획
          title: 원자재 계획단가 예측 및 산정
          one: 구매 계약단가 이력 기반 회귀 분석 및 리스크 가중치 적용 차기연도 원자재 계획단가 산정
          points:
            - 계약단가 추세 기반 예측값 자동 산정
            - 선택 리스크 요인 및 버전별 저장 정합성 관리
          tags:
            - ABAP
            - Regression
            - ALV
            - Version 관리
        - key: alloc
          code: GUI-04
          type: gui
          phase: 비용 배부
          title: 제조간접비 배부
          one: 통계지표 기준 지원부서 제조간접비의 생산부서 배부 및 결과 전표, 이력 통합 관리
          points:
            - 배부율 100% 정합성 검증 및 끝전 보정 로직 구현
            - 전표와 이력 LUW 처리 및 중복 배부 원천 방지
          tags:
            - Module Pool
            - ALV Tree
            - SAP LUW
        - key: step2
          code: GUI-05
          type: gui
          phase: 실제 원가
          title: 실제 임률 산정 및 생산오더 가공비 배부
          one: 생산부서 실제 비용과 활동시간 기반 실제 임률 산정 및 생산오더별 가공비 배부
          points:
            - 계획 대비 실제 임률 차이(Variance) 비교 분석
            - DB 기반 진행 상태 복원 및 배부 전표 일괄 처리
          tags:
            - Module Pool
            - ALV
            - Order Status
        - key: wip
          code: GUI-06
          type: gui
          phase: 기말 결산
          title: 재공품(WIP) 산정 및 증분 전기
          one: 미완성 생산오더 재공품 평가 및 전월 대비 증감액(Delta) 산출 기반 회계 전표 전기
          points:
            - 당월 및 전월 WIP 차액 자동 계산 엔진 구현
            - 오더별 전기 상태 추적 및 실패 보상(Rollback) 처리
          tags:
            - Module Pool
            - WIP Delta
            - Posting Validation
    - name: SAP Fiori
      count: 3개
      items:
        - key: cockpit
          code: Fiori-01
          type: fiori
          phase: 결산 통제
          title: 월말결산 콕핏
          one: GUI 결산 프로그램 처리 이력 통합 기반 결산 진행 상태 모니터링 및 후속 단계 통제
          points:
            - 선행 결산 완료 여부 검증 및 단계별 워크플로우 제어
            - 결산 오류 로그 실시간 추적 및 조치 가이드 제공
          tags:
            - SAP Fiori
            - Workflow
            - Status Tracking
        - key: bva
          code: Fiori-02
          type: fiori
          phase: 예산 관리
          title: 예산 편성 및 BvA 리포트
          one: 부서별 예산 편성, 통계지표 기반 배부, 예산 대비 실적(BvA) 분석 통합 관리
          points:
            - 부서별 가용 예산 통제 및 집행률 시각화
            - 계획, 배부, 실적 3단계 BvA 비교 분석 리포트 구현
          tags:
            - SAP Fiori
            - BvA Analytics
            - Allocation
        - key: dashboard
          code: Fiori-03
          type: fiori
          phase: 경영 분석
          title: 경영지표 대시보드
          one: SD 매출, PP 생산, MM 재고 지표 통합 기반 경영 현황 및 리스크 실시간 시각화
          points:
            - 모듈 간 핵심 KPI 통합 조회 및 상세 드릴다운 구현
            - 임계치 초과 리스크 항목 조기 경보 UI 구성
          tags:
            - SAPUI5
            - OData
            - CDS View
            - Chart

# 04. 공통 기능 개발 (0.2: 자재 이동 CO 전표 함수를 핵심 사례로, 시연 데이터 도구는 보조. HTML 헤더 공통 기능은 포트폴리오에서 제외)
shared:
  subtitle: 모듈의 경계를 넘는 데이터와 전표 연결
  lead: MM에서 발생한 자재 이동 결과를 CO의 원가 데이터 및 전표 처리와 연결하기 위해, 이동유형에 따른 계정 처리 기준과 전표 생성 로직을 구현했습니다. 개별 업무 프로그램 외에 자재 이동 CO 전표 함수 1개와 시연 데이터 보조 도구 1개를 공통 기능으로 개발했습니다.
  chainTitle: 자재 이동 CO 전표 자동 생성 함수
  chain:
  - title: MM 자재 이동 처리
    sub: 입고, 생산출고, 완제품 입고, 판매 출고 등 (MM 담당 프로그램)
    who: 팀원 개발
  - title: 전표 연계 호출
    sub: 자재 이동을 전기할 때 원가 전표 함수를 부르는 로직
    who: 직접 추가
  - title: 자재 이동 CO 전표 함수
    sub: 이동유형별로 계정을 정해 표준원가로 CO 전표 생성, 원자재 입고 때 가격차이 분리
    who: 직접 개발
    go: fm
  - title: 공통 채번 함수 호출
    sub: 전표번호는 FI 담당 팀원이 개발한 공통 채번 함수로 받음
    who: 팀원 개발 (FI)
  - title: 원가 전표에서 결과 추적
    sub: 제조간접비 배부, 가공비 배부, WIP가 이 전표를 집계
    who: 직접 개발 프로그램
  chainAlt: MM 자재 이동 처리(팀원 개발)가 전기될 때, 직접 추가한 호출 로직이 직접 개발한 자재 이동 CO 전표 함수를 부르고, 이 함수는 FI 담당 팀원이 개발한 공통 채번 함수로 전표번호를 받아 원가 전표를 만듭니다. 제조간접비 배부, 가공비 배부, WIP 프로그램이 이 전표를 집계합니다.
  note: 전표를 만드는 함수(직접 개발)와, 자재 이동 뒤 이를 호출하는 로직(직접 추가), 전표번호를 주는 채번 함수(FI 팀원 개발)를 나눠 표시했습니다.
  # 0.2: 이동유형별 회계처리 기준 (자재 이동 CO 전표 함수 상세 페이지에 있는 이동유형 표와 같은 내용)
  movementsTitle: 이동유형별 회계처리 기준
  movements:
    head:
    - 이동유형
    - 업무
    - 차변 / 대변
    rows:
    - - '101'
      - 원자재 입고 (계약단가와의 차이는 가격차이 계정으로 분리)
      - 원재료 재고 / GR-IR
    - - '261'
      - 생산 출고
      - 원재료 소비 / 원재료 재고
    - - '131'
      - 완제품 입고
      - 완제품 재고 / 제조원가 상계
    - - '201'
      - 내부 소비
      - 소모품비 / 소모품 재고
    - - '601'
      - 판매 출고
      - 매출원가 / 완제품 재고
    - - 551, 553
      - 폐기
      - 폐기손실 / 재고
  modulesTitle: 핵심 공통 기능 상세
  modulesNote: ''
  # 아래 key 만 핵심 공통 기능에 두고, 나머지 공통 모듈은 보조 도구로 표시
  mainModules:
  - fm
  auxTitle: 시연 데이터 생성 및 롤백 도구 (보조)
  auxNote: 원가 배부와 결산 시연에 필요한 선행 데이터를 만들고, 반복 테스트를 위해 해당 월 실행 데이터를 되돌려 테스트 조건을 같게 유지하는 보조 도구입니다. 생성과 롤백 프로그램 2개를 한 묶음의 도구 1개로 셉니다

# 05. 프로젝트 성과 (0.2: PM 수행, 의사결정과 산출물, 결과, 회고)
outcomes:
  reportLabels:
    pmNote: 일정 조율, CO 모듈 구현, 통합 검증
    decisionNote: 기준 수립과 검증 산출물
    resultNote: 통합 시나리오 시연 및 발표 영상
    alternativeLabel: 대안 비교
    decisionColumn: 검토 기준, 실제 결정, 영향
    videoTitle: 최종 발표 및 End-to-End 5단계 시연 영상
    # 2026-10-21 UX 개선 8, 14: 사용법 안내 문장 삭제, 영상은 YouTube 썸네일 위 재생 버튼으로
    videoAction: ''
    videoPlay: 발표 영상 재생
    videoExternal: YouTube에서 열기
    videoCaption: ''
  subtitle: 기술의 완성도와 팀의 연결을 함께 관리한 경험
  lead: PM으로서 개별 프로그램이 완성되는 것만큼 모듈 간 입력과 출력 시점, 데이터 기준을 맞추는 일이 중요했습니다. 생산계획에서 구매와 자재로, 입출고에서 전표와 원가로, 최종적으로 결산과 경영 분석으로 이어지는 시나리오를 중심으로 팀의 협의와 통합 시연을 준비했습니다.
  pmTitle: PM 수행 및 협업
  panels:
  - area: 프로젝트 진행과 협업
    text: 모듈마다 개발 속도가 달라 전체 흐름이 늦어지지 않도록 주간회의를 주도해 일정과 우선순위를 조율하고(일정 앞당기기 결정 포함), WBS를 작성해 팀원 일정과 개발 진척을 관리했습니다. 매일 오전 그날의 공통 할 일과 전달사항을 공유하고, 막힌 작업이 바로 드러나도록 일일 업무보고 체계를 운영했습니다.
    to: sap/overview
    toLabel: 담당 범위 보기
  - area: CO 구현
    text: CO 업무 흐름이 다른 모듈의 결과와 이어지도록 원가 계획, 배부, 실제 임률, WIP, 분석 프로그램을 SAP GUI와 Fiori로 구현했습니다.
    to: sap/programs
    toLabel: 담당 프로그램 9개 보기
  - area: 통합 검증 관점
    text: 모듈별 데이터가 어떤 문서, 시점, 상태로 이어지는지 맞추기 위해 모듈 간 인터페이스와 자재코드 등 공통 데이터 기준을 협의하고, 업무 흐름 순서의 통합테스트 순서를 팀과 함께 설계했습니다. 최종 발표에서 이 흐름을 시연했습니다.
    to: sap/e2e
    toLabel: 5단계 시연 흐름 보기
  decisionTitle: 프로젝트 의사결정과 산출물
  decisionsLead: 모듈 간 흐름을 연결하는 과정에서 공통 기준정보, 문서와 전표의 참조 관계, 테스트 순서를 정해야 하는 순간이 있었습니다. 각 사례는 문제 상황, 검토한 기준, 실제 결정, 영향 순서로 정리했고, 팀원과 함께 정한 결정은 공동으로 표시했습니다.
  resultTitle: 프로젝트 결과
  resultSubtitle: 최종 발표에서 연결한 End-to-End 시나리오
  resultText: 기준정보와 원가 사전 설정부터 생산계획과 MRP, 구매와 입출고, 판매와 출하, 원가와 결산, 수익성 분석까지 5단계 시나리오로 통합 구현 내용을 시연했습니다. 여러 모듈이 만든 데이터를 하나의 흐름에서 해석하도록 구성한 것이 프로젝트의 핵심 결과입니다.
  # 0.2: 프로젝트 전체 성과(팀)와 개인 담당 범위를 나눠 표시
  stats:
  - key: 팀 성과
    value: 28개 팀 중 1위, 프로젝트 대상 (7인 팀 공동 수상)
    strong: true
  - key: 프로젝트 구분
    value: SAP CODE 아카데미 1기 교육 팀 프로젝트 (7인 협업)
  - key: 개인 담당
    value: PM, CO 업무 프로세스 설계와 개발
  - key: 개인 개발 범위
    value: 프로그램 9개 (SAP GUI 6, Fiori 3), 공통 전표 함수 1개, 보조 도구 1개
  demoTitle: 최종 발표 시연 흐름
  demoText: 생산계획과 MRP부터 구매와 입출고, 판매와 출하, 결산과 분석까지 이어지는 팀 공동 시연입니다. 시연 순서는 위 End-to-End 5단계와 같습니다.
  demoLink: 시연 단계 보기
  # 발표 영상 (유튜브). 비어 있으면 버튼을 그리지 않음
  demoVideo: https://youtu.be/LRzabWyFz90
  demoVideoLabel: 최종 발표 영상 보기 (YouTube)
  retroTitle: 회고 및 개선점
  retroSubtitle: 기능을 구현하는 것과 ERP를 연결하는 것의 차이
  retroParagraphs:
  - 이번 프로젝트에서 배운 가장 큰 점은 개별 화면의 완성도만으로 통합 ERP가 성립하지 않는다는 것이었습니다. 어떤 기준정보를 참조하고, 처리 결과가 어떤 문서와 전표로 남으며, 다른 모듈에서 그 결과를 언제 읽는지가 업무의 연결을 결정했습니다.
  - 특히 CO에서는 계획과 실제의 기준이 일치해야 비교가 가능하고, 배부와 마감에서는 중복 처리와 상태 불일치를 미리 검증해야 한다는 점을 개발 과정에서 체감했습니다. 앞으로는 공통 데이터 기준과 모듈 간 인터페이스를 더 이른 단계에서 명확히 정의하고 조율하는 SAP ERP 컨설턴트 및 운영 전문가가 되고자 합니다.
  # v0.8 개선 3: 강점과 개선 과제 표는 아래 retro (잘한 것, 아쉬운 것과 다음 과제)로 합침
  closing: 여러 기능을 하나의 흐름으로 연결해 본 경험은, 업무 흐름과 기술 구현을 함께 이해하고 모듈 간 데이터 기준과 인터페이스를 설계하는 역량이 필요하다는 것을 알려 줬습니다.

decisions:
  # 0.2: 사례마다 문제 상황 → 검토한 기준(A안, B안 비교와 판단 근거) → 실제 결정 → 영향
  title: 결정의 순간
  note: 문제 상황, 검토한 기준, 실제 결정, 영향
  items:
  - title: 자재코드 표준화
    role: 직접
    roleNote: PM 제안, 모듈 담당자 합의
    situation: 통합테스트 직전, MM과 PP의 자재마스터 코드 형식이 달라 CO 표준원가 계산이 막혔습니다. 모듈별 자재 식별 기준이 다르면 다음 단계에서도 같은 문제가 생길 수 있었습니다.
    a:
      text: 시연에 나오는 자재만 맞춘다
      note: 빠르지만 다른 자재에서 같은 문제가 다시 생김
    b:
      text: 자재코드 전체를 하나의 기준으로 표준화한다
      note: 시간이 들고, 제 담당 모듈이 아님
    pick: b
    why: 원가는 마스터데이터에서 이미 정해진다고 봤습니다. 시연만 고치면 통합테스트 25단계 중 어디서든 다시 막힙니다.
    decision: 공통 자재코드 기준을 정하고 모듈 담당자들과 합의해 원자재 68개, 반제품 34개, 완제품 19개, 총 121개를 표준화
    # 2026-10-21 UX 개선 15: 핵심 숫자를 크게 (본문에 이미 있는 숫자만)
    stat:
      value: 121개
      label: 자재코드 표준화
    impact: 모듈 간 데이터 연결과 통합테스트가 같은 자재 기준 위에서 진행되어, 통합테스트를 끝까지 진행
  - title: 이동평균가와 표준원가 처리 기준
    role: 공동
    roleNote: CO 2명
    situation: '"부품 단가 변동이 재고 평가에 늦게 반영된다"는 과제를 처음엔 이동평균가로 풀려고 했습니다. 물류 단계의 재고 평가 기준과 원가관리 단계의 기준을 어떻게 맞출지가 문제였습니다.'
    a:
      text: 이동평균가 유지
      note: 입고마다 단가가 바뀌어 MM 담당이 계속 관리해야 함
    b:
      text: 표준원가를 쓰고, 단가 변동은 계획 단계 예측단가와 결산의 가격차이로 나눔
      note: 과제를 버리지 않고 해법의 위치를 옮김
    pick: b
    why: 추적성과 릴리즈 통제라는 이론에 더해, 모듈 담당자가 실제로 운영할 수 있는 방식이어야 했습니다.
    decision: 자재 이동의 CO 전표는 표준원가로 만들고, 원자재 입고 때 계약단가와의 차이는 가격차이 계정으로 분리하는 것으로 MM과 CO의 역할과 전표 연계 기준을 정리
    impact: 같은 입고 거래를 CO에서 어떤 단가와 계정으로 반영할지 기준이 분명해졌고, 원자재 예측단가 프로그램과 전표 함수의 가격차이 분리로 구현
  - title: 통합테스트 순서
    role: 공동
    roleNote: 팀 공동 설계
    situation: 각 모듈의 기능이 기준정보, 계획, 입고 같은 선행 데이터와 다른 모듈의 작업에 의존해, 기능별로 따로 확인하면 모듈 사이의 연결 오류가 드러나지 않았습니다.
    a:
      text: 기능 목록 순서대로 모듈별로 테스트
      note: 기능 단위 확인은 쉽지만 모듈 간 연결은 확인되지 않음
    b:
      text: 업무 흐름 순서대로 단계별 통합테스트
      note: 선행 데이터 준비가 필요하지만 연결 지점이 드러남
    pick: b
    why: 기능 나열이 아니라, 프로젝트 과제가 업무 흐름 위에서 풀리는지를 확인해야 한다고 봤습니다.
    stat:
      value: 25단계
      label: 업무 흐름 순 통합테스트
    decision: 기준정보와 계획에서 결산과 대시보드까지 업무 흐름 순서로 통합테스트 25단계를 팀과 함께 설계. 그 앞에는 만든 사람이 아닌 사람이 테스트하는 교차 단위테스트 순서를 둠 (교차 단위테스트 원칙과 순서는 직접)
    impact: 오류가 나면 어느 단계와 어느 모듈 간 연결에서 생겼는지 추적할 수 있는 검증 구조를 갖춤
  - title: CO 범위 정하기
    role: 직접
    situation: 컨설턴트 질문 템플릿을 7명 중 혼자 채워 CO 범위를 먼저 물었습니다. 예산 통제, 판매계획, 내부오더까지 넓힐지 정해야 했습니다.
    a:
      text: 예산 통제, 판매계획, 내부오더까지 넓게
      note: 기간 안에 깊이가 얕아짐
    b:
      text: 계획단가에서 실제원가까지 결산 흐름에 집중
      note: 판매계획은 PP로, 예산 통제는 BvA 리포트로 축소
    pick: b
    why: '"표준원가, 실제원가 쪽만 해도 성공"이라는 답을 받고, 흐름이 끊기지 않는 범위를 골랐습니다.'
    decision: 계획단가에서 실제원가까지 결산 흐름에 집중
    impact: 결산 STEP 1~3과 대시보드까지 하나로 연결
outputs:
  # 0.2: 산출물과 활용 목적을 표로 연결
  title: 남긴 산출물
  note: 코드 밖에서 만든 것과 쓰임
  head:
  - 산출물
  - 활용 목적
  - 구분
  items:
  - title: 프로젝트 계획서, WBS
    purpose: 개발 범위와 일정 관리 (계획서는 전 직장 착수보고와 제안서 목차를 바탕으로 작성)
    role: 직접
  - title: 기능 목록 양식, 메뉴구조도
    purpose: 구현 범위와 화면 구성 협의 (7명이 같은 틀로 작성)
    role: 직접
  - title: 공통 UI 규칙
    purpose: 모듈별 화면 사용성 기준 조정 (2차 중간평가, 7명 공동)
    role: 공동
  - title: 교차 단위테스트 순서
    purpose: 기능 간 데이터 연결 점검 (만든 사람이 아닌 사람이 테스트)
    role: 직접
  - title: 통합테스트 25단계
    purpose: End-to-End 업무 흐름 검증 (과제가 흐름 위에서 풀리는지 확인)
    role: 공동
  - title: 최종 발표자료
    purpose: 프로젝트 결과 공유와 시연 (발표 담당)
    role: 직접
retro:
  # v0.8 개선 3: 05 회고를 하나로 합침 (예전 assess 표의 강점과 개선 과제 포함)
  goodTitle: 잘한 것
  good:
  - 하나의 제조 시나리오로 MM, PP, SD, FI, CO를 연계
  - SAP GUI, ABAP과 Fiori 기반 구현을 병행
  - 문서, 전표, 상태를 중심으로 데이터 흐름을 설계
  - 통합테스트 직전 자재코드를 전부 표준화해 흐름을 살린 일
  - 기능 나열이 아니라 과제가 흐름 위에서 풀리는지 보는 통합테스트 순서
  regretTitle: 아쉬운 것과 다음 과제
  regret:
  - 배부 규칙 지정 프로그램은 설계까지만 하고 규칙은 초기 데이터로 넣었습니다. 다음에는 미완성 기능을 시연으로 대체하지 않도록 데이터 매핑까지 마무리하겠습니다.
  - 프로젝트 막바지에 End-to-End 통합 시연의 데이터 정합성을 확보하는 데 집중하느라 초기 설계 문서의 변경 이력을 실시간으로 현행화하지 못한 점이 아쉽습니다. 다음에는 구현과 산출물 현행화가 병행될 수 있도록 마일스톤별 문서 관리 기준을 더 명확히 운영하겠습니다.
  - 마스터 기준, 기간 표현, 인터페이스 검증 규칙을 개발 전에 먼저 정의하는 것이 다음 과제입니다.
---
