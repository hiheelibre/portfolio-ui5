---
# 사이트 공통: 브랜드, 사이드바 메뉴와 간략 프로필, 연락처
brand:
  # v0.7: 사이드바 상단 식별 정보 '포트폴리오 / 한지희' (lead 뒤에 한 칸 띄우고 accent)
  lead: 포트폴리오 /
  accent: 한지희
  # v0.7: 사이드바 영문 직무 (홈 상단 키워드 IT CONSULTING 과는 따로 관리)
  caption: SAP ERP Consultant & Operations
nav:
- key: home
  label: 소개
  # 0.2: 홈 아래 하위 탐색 (주요 구현 사례, 이력, 기술과 자격). 주소는 #주요-구현-사례, #이력, #기술과-자격
  children:
  - key: highlights
    label: 주요 구현 사례
  - key: career
    label: 이력
  - key: skills
    label: 기술과 자격
- group: PROJECTS
- key: sap
  label: SAP S/4HANA 통합 ERP 구축
  sub: SAP CODE 아카데미 1기 프로젝트
  # v0.8: SAP 프로젝트 하위 메뉴 5개 (같은 페이지의 섹션으로 이동). SAP 화면이나 SAP 상세에 있을 때 펼침
  children:
  - key: overview
    label: 01. 프로젝트 개요
  - key: process
    label: 02. 업무 프로세스
  - key: programs
    label: 03. 담당 프로그램
  - key: outcomes
    label: 04. 프로젝트 성과
- key: public
  label: 공공 웹시스템 운영 및 개선
  # v0.7: 확정되지 않은 총건수(30건) 표기 삭제
  sub: 수질오염총량관리시스템
  # 결정 P-I: 공공 프로젝트 하위 메뉴 5개 (공공 화면이나 공공 상세에 있을 때 펼침)
  children:
  - key: overview
    label: 01. 프로젝트 개요
  - key: process
    label: 02. 업무 및 시스템 구조
  - key: cases
    label: 03. 주요 개발 및 개선 사례
  - key: operations
    label: 04. 시스템 운영 및 문제 해결
  - key: outcomes
    label: 05. 프로젝트 성과
# v0.6: 사이드바 아래는 이름, 직무, 버튼 두 개 (이메일 복사, Credly 배지 확인)
profile:
  name: 한지희
  role: SAP ERP Consultant & Operations
contact:
  email: hihee9095@gmail.com
  credly: https://www.credly.com/users/jihee-han.308a1d52/badges/credly
# 2026-10-21 UX 개선 4: 각 페이지 맨 아래 마무리 블록 (다음 프로젝트, 이메일 보내기, 주소 복사, Credly)
closing:
  title: 더 궁금한 점이 있으시면 편하게 연락 주세요
  text: 프로젝트에서 맡은 역할, 개발한 프로그램, 공공 시스템 운영 경험에 대해 자세히 말씀드리겠습니다.
  mailLabel: 이메일 보내기
  mailSubject: 포트폴리오를 보고 연락드립니다
  copyLabel: 이메일 주소 복사
  credlyLabel: Credly 배지 확인
  next:
    home:
      label: SAP S/4HANA 통합 ERP 구축 보기
      to: sap
    sap:
      label: 다음 프로젝트, 공공 웹시스템 운영 및 개선
      to: public
    public:
      label: SAP S/4HANA 통합 ERP 구축 다시 보기
      to: sap
---
