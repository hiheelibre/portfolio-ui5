---
# 홈 화면 (PF-01)
hero:
  eyebrow: SAP ERP CONSULTING / ABAP DEVELOPMENT / AMS
  # 헤드라인 5종: 순서 고정. 01은 바로 표시, 02~05는 타이핑. \n 은 항상 줄바꿈, | 는 모바일에서만 줄바꿈 (PC 에서는 띄어쓰기)
  slides:
  - label: WHAT I BRING
    text: "기획부터 구현, 운영까지,\n업무와 시스템을 잇는 사람"
  - label: WHERE I COME FROM
    text: "공공 웹시스템에서 SAP까지,\n복잡한 업무를|하나의 흐름으로"
  - label: HOW I THINK
    text: "할 수 없다는 말과\n아직 해보지 않았다는 말을|구분하는 사람"
  - label: WHAT I PURSUE
    text: "내가 아는 세계의 끝이,\n내가 할 수 있는|세계의 끝은 아니다"
  - label: HOW I GROW
    text: "아는 만큼 더 보였고,\n해볼수록 더 나아갔다"
  points:
  - 'SAP CODE 아카데미 1기 S/4HANA 팀 프로젝트 PM 및 CO 모듈 개발 수행, 28개 팀 중 **대상** 수상'
  - '원가 계획부터 배부, 가공비 산정, 재공품 처리까지 CO 업무 프로세스 설계 및 ABAP 프로그램 구현'
  - '환경부 수질오염총량관리제 업무 전산 시스템 5년 운영 및 개선, 사용자 요구사항 분석과 데이터 정합성 관리 경험'
  primary:
    label: SAP ERP 구축 및 설계 사례
    to: sap
  secondary:
    label: 공공 시스템 운영 및 개선 경력
    to: public
photo:
  file: profile.jpg
  alt: 한지희 프로필 사진
idcard:
  label: PROFILE
  name: 한지희
  # 0.2: 직무 키워드 (지원 직무 방향, 실제 컨설턴트 재직 경력이 아님). 중간 3열 요약(rows)은 삭제
  role: SAP ERP 운영 및 개선 / 비즈니스 프로세스 컨설팅 / ABAP, Fiori 기술 구현
  tags:
  - CO
  - FI
  - MM
  - ABAP
  - SAPUI5
  - SQL
  - PL/SQL
glance:
  title: ''
  note: ''
  # v0.4 확정 문구를 큰 문구(big)와 보조 문구(sub)로 나눠 2x2 로 표시
  items:
  - key: SAP 프로젝트
    big: 28개 팀 중 1위
    sub: SAP CODE 1기 팀 프로젝트 대상
    to: sap
  - key: SAP 자격
    big: SAP Certified 4종 보유
    sub: (ABAP Cloud / CO / FI / MM) / SQLD
    to: 기술과-자격
  - key: 공공 웹시스템
    big: 5년간 운영 및 개선
    sub: 약 200개 지자체 대상 오염총량제 관련 시스템
    to: public
  - key: 표창
    big: "환경부장관 표창\n물환경 유공자(개인)"
    sub: 공공 정보시스템 운영 및 개선 공로
    to: public/award
highlights:
  # v0.7: 섹션명 대표 하이라이트 → 주요 구현 사례
  title: 주요 구현 사례
  # 2026-10-21 UX 개선 8: 사용법 안내 문장 삭제 (카드 모양과 호버로 눌린다는 것을 보여 줌)
  note: ''
  # v0.4: 01, 02 는 실제 캡처, 03, 04 는 개념도(flow 단계를 화살표로 이어 그림)
  items:
  - 'no': 1
    axis: sap
    title: CO 모듈 월말 결산 프로세스(CBO)
    # 0.2: 한 줄 소개 대신 불릿 2줄 (points 가 있으면 one 대신 불릿으로 표시)
    points:
    - 간접비 배부, 실제 임률 및 가공비 산정, 오더 마감, 재공품(WIP) 증분 전기까지 이어지는 결산 흐름 설계
    - 단계별 결산 상태 검증 및 중복 실행 방지 로직 구현
    image: sap/step2_target.jpg
    to: sap/flow
  - 'no': 2
    axis: sap
    title: 원자재 계획단가 예측
    points:
    - 과거 구매 계약단가 이력 정제 및 최소제곱법 선형회귀 기반 기준단가 산출
    - 리스크 가중치 적용 및 차년도 계획단가 버전별 저장, 정합성 관리
    image: sap/pred_main.jpg
    to: sap/pred
  - 'no': 3
    axis: sap
    title: 자재 이동과 원가 반영의 연결
    points:
    - MM 자재 입출고 이벤트 기반 CO 원가 전표 자동 생성 공통 함수 개발
    - 이동유형별 계정 매핑 및 원자재 입고 시 가격차이 분리 반영 로직 구현
    image: ''
    flow:
    - MM 자재 이동
    - 전표 연계 로직
    - 원가 반영
    to: sap/fm
  - 'no': 4
    axis: public
    title: 건축행정 데이터 연계 지원 및 자동 산정 로직 개발
    points:
    - 타기관 건축행정 원천 데이터 연계 절차 정립 및 정합성 검증 기준 수립
    - PL/SQL 기반 소규모 개발사업 오염부하량 자동 산정 프로시저 직접 개발
    image: ''
    flow:
    - 건축행정 데이터
    - 데이터 연계 및 검증
    - 부하량 자동 산정
    to: public/b01-link
axes:
  # v0.4: 상단 분류 태그 없음, 공공은 작은 소개 카드, 고정 건수 쓰지 않음
  sap:
    title: SAP S/4HANA 통합 ERP 구축
    meta: SAP CODE 아카데미 1기 / 7인 팀 / PM 및 CO 개발 / 2026.03 ~ 07
    summary: 가상 제조기업(태산자전거)을 대상으로 구매부터 결산까지 이어지는 SAP S/4HANA 통합 ERP 프로세스를 설계 및 구축했습니다. PM으로서 프로젝트를 이끌고 CO 원가관리 및 월말 결산 프로세스를 정립했으며, ABAP 프로그램 6개와 RAP, CDS, OData 기반 Fiori 앱 3개, 모듈 간 전표 연계 공통 기능을 개발했습니다.
    # 0.2: summary 대신 불릿 3줄로 표시 (points 가 있으면 points)
    points:
    - 가상 제조기업(태산자전거) 대상 구매, 생산, 출하, 원가, 결산 End‑to‑End 통합 ERP 프로세스 설계 및 구축
    - 팀 내 PM 수행 및 CO 모듈 원가 계획, 월말 결산 프로세스 정립
    - ABAP 프로그램 6개, Fiori 앱 3개(RAP, CDS, OData), 모듈 간 전표 연계 공통 기능 개발
    image: sap/dashboard.jpg
    cta: 상세보기
    to: sap
  public:
    title: 공공 웹시스템 운영 및 개선
    summary: 환경부 수질오염총량관리시스템을 중심으로 5년간 현업 요구사항 분석, 기능 설계, 데이터 연계 및 PL/SQL 기반 자동 산정 로직 개발까지 수행했습니다.
    points:
    - 환경부 수질오염총량관리시스템 5년 운영 및 개선
    - 법령, 지침 기반 현업 요구사항 분석, 화면, 기능 설계 및 외부 연계 지원
    - PL/SQL 기반 오염부하량 자동 산정 로직 개발 및 데이터 정합성 관리
    cta: 상세보기
    # v0.8: 공공 프로젝트 페이지 03 주요 개발 및 개선 사례로
    to: public/cases
career:
  # 0.2: 가로 타임라인. 왼쪽 과거에서 오른쪽 최근 순서 (시작, 발생 시점 기준). cat 은 기존 이력 구분
  title: 이력
  note: ''
  # 0.2: 묶음 상자. 입과에서 수료(대상)까지 아카데미 기간을 한 상자로 감쌈 (from, to 는 시점 date 와 같은 값)
  groups:
  - from: '2025.10'
    to: '2026.07'
    label: SAP CODE 아카데미 1기
  items:
  # 0.2: type period = 기간(선 아래 음영 사각형, from~to 로 위치), 나머지 = 시점(선 위 점). "|" 는 줄바꿈
  - date: '2019.08'
    cat: 학력
    title: 상명대학교|화공신소재공학|졸업
  - type: period
    date: 2020 ~ 2025
    from: '2020.02'
    to: '2025.02'
    cat: 실무 경험
    title: 공공 웹시스템 설계 및 개발|((주)엔지스 재직)
    detail: 현업 요구사항 분석|기능 설계|PL/SQL 기반 산정 로직 개발|시스템 운영 및 개선
  - date: '2023'
    cat: 실무 경험
    key: true
    title: 수질오염총량관리시스템 운영 제안 참여 및 수주
    detail: 2024~2026년 사업 제안서 및 발표자료 작성
  - date: '2024.03'
    cat: 실무 경험
    key: true
    title: 환경부장관 표창 수상
    detail: 물환경 유공자 개인 표창
  - date: '2025.10'
    cat: SAP 교육 및 프로젝트
    title: SAP CODE 아카데미 1기|입과
    detail: 180일(1,440시간)|ABAP 및 SAP Fiori 학습
  - type: period
    date: 2026.03 ~ 07
    from: '2026.03'
    to: '2026.07'
    cat: SAP 교육 및 프로젝트
    title: SAP S/4HANA 통합 ERP 구축 프로젝트
    detail: 팀 PM|CO 관련 ABAP 프로그램 개발
  - date: '2026.06'
    cat: SAP 교육 및 프로젝트
    title: SAP Certified Back-End Developer, ABAP Cloud 취득
  - date: '2026.07'
    cat: SAP 교육 및 프로젝트
    key: true
    title: SAP CODE 아카데미 1기 수료 및 프로젝트 대상
    detail: 28개 팀 중 1위
  - date: '2026.10'
    cat: SAP 교육 및 프로젝트
    key: true
    title: SAP S/4HANA CO / FI / MM 자격 취득
    detail: SAP S/4HANA Cloud Private Edition 관련 자격 3종
skills:
  # v0.6: RAP 정식 포함, 자격 유효기간 표시 없음 (부제 없음)
  title: 기술과 자격
  note: ''
  groups:
  - name: SAP 개발
    tags:
    - ABAP
    - RAP
    - CDS
    - OData V4
    - SAPUI5 Freestyle
    - Module Pool
    - ALV
    - ALV Tree
  - name: 데이터베이스
    tags:
    - Oracle SQL
    - PL/SQL
    - 데이터 오류 원인 분석
  - name: 업무 분석 및 프로젝트 관리
    tags:
    - 현업 요구사항 분석
    - 화면 및 기능 설계
    - 제안서 작성
    - 프로젝트 PM
    - 통합 테스트 설계
    - 시스템 운영 및 개선
  # 2026-10-21 UX 개선 11: 자격마다 검증 링크 (url). 지금은 Credly 프로필 주소, 배지별 주소를 받으면 각 url 만 바꾸면 됨
  # 2026-10-21 UX 개선 12: TOEIC Speaking 줄 삭제 (직무와 무관)
  certGroups:
  - title: SAP Certified 4종
    items:
    - name: SAP Certified Back-End Developer, ABAP Cloud
      url: https://www.credly.com/users/jihee-han.308a1d52/badges/credly
    - name: SAP S/4HANA Management Accounting (CO)
      url: https://www.credly.com/users/jihee-han.308a1d52/badges/credly
    - name: SAP S/4HANA Financial Accounting (FI)
      url: https://www.credly.com/users/jihee-han.308a1d52/badges/credly
    - name: SAP S/4HANA Sourcing and Procurement (MM)
      url: https://www.credly.com/users/jihee-han.308a1d52/badges/credly
  - title: 기타 자격
    items:
    - name: SQLD (국가공인)
# 0.2: 기술과 자격 아래 작은 안내 패널과 "구현 정보 보기" 팝업 (이 포트폴리오 자체의 SAPUI5 구현, 보조 사례)
# 기술 구성은 실제 소스(webapp, scripts, ui5.yaml, netlify.toml)에서 확인한 것만 적음
devInfo:
  title: 이 포트폴리오도 SAPUI5로 만들었습니다.
  sub: SAPUI5 기반 화면 구성 / 정보 구조 설계 / 반응형 사용자 경험
  link: 구현 정보 보기 →
  eyebrow: PORTFOLIO DEVELOPMENT
  popTitle: 포트폴리오 웹사이트 설계 및 구현
  popSub: SAPUI5 기반 개인 포트폴리오
  purposeTitle: 개발 목적
  purpose: SAP ERP 프로젝트 경험과 기술 구현 결과를 체계적으로 전달하기 위해 SAPUI5 기반 웹 포트폴리오를 설계하고 구현했습니다. 방문자가 프로젝트의 업무 배경부터 실제 개발 결과까지 단계적으로 탐색할 수 있도록 정보 구조와 화면 이동 방식을 구성했습니다.
  techTitle: 주요 기술 구성
  techHint: 기술 이름에 마우스를 올리면 설명이 보입니다
  tech:
  - k: SAPUI5 1.120 (sap.m)
    v: Component와 manifest 기반 앱 구성, Horizon 테마의 화면 컨트롤
  - k: XML View, Fragment, Controller
    v: 화면 정의와 재사용 조각(기록 팝업), 이벤트와 필터 처리
  - k: JSONModel, 데이터 바인딩
    v: 콘텐츠 모델과 화면용 모델을 나눠 바인딩 (표현식 바인딩 포함)
  - k: Hash 기반 내비게이션
    v: URL 해시로 페이지, 섹션, 기록 팝업 이동을 관리하고 옛 주소를 새 주소로 연결 (UI5 Router 대신 컨트롤러에서 직접 처리)
  - k: sap.m.Dialog, LightBox
    v: 업무 기록과 이 안내의 레이어 팝업, 화면 캡처 확대 보기
  - k: Markdown 콘텐츠 빌드 (Node.js)
    v: content 폴더의 글을 빌드할 때 JSON으로 바꾸고 검증 스크립트로 누락과 형식을 확인
  - k: CSS 반응형 레이아웃
    v: 미디어 쿼리와 Grid로 PC, 태블릿, 휴대폰 배치를 조정
  - k: UI5 Tooling, Netlify
    v: 앱 빌드와 정적 사이트 배포
  techNote: 구현에는 AI 코딩 도구를 함께 활용했고, 요구사항 정의, 정보 구조 설계, 콘텐츠 작성, 화면 검수는 직접 수행했습니다.
---
