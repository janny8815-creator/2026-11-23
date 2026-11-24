/**
 * 간호학과 1학년 맞춤 개념 도움말 및 실습 테스트용 예시 데이터
 * - 예시 데이터에는 실명/연락처 노출, S/O 혼동, 수치 누락, 일기체, SMART 위반 등
 *   초보자가 자주 하는 실수를 의도적으로 포함해 AI 피드백을 바로 체험할 수 있게 합니다.
 */

import { CaseStudyData, FieldGuide, PracticeLogData } from '../types/nursing';

/** 실습일지 초기 빈 값 */
export const INITIAL_PRACTICE_LOG: PracticeLogData = {
  practiceDate: '',
  ward: '',
  practiceHours: '',
  observation: '',
  performance: '',
  selfDirectedLearning: '',
  reflection: '',
};

/** 사례보고서 초기 빈 값 */
export const INITIAL_CASE_STUDY: CaseStudyData = {
  patientSummaryAndLiterature: '',
  subjectiveData: '',
  objectiveData: '',
  labsAndMedications: '',
  nursingDiagnosis: '',
  goalsAndInterventions: '',
  evaluationAndReferences: '',
};

/** 실습일지 항목별 1학년용 도움말 */
export const PRACTICE_LOG_GUIDES: Record<keyof PracticeLogData, FieldGuide> = {
  practiceDate: {
    title: '실습 날짜',
    summary: '실습을 진행한 날짜를 기록합니다. (예: 2026-05-12)',
    tip: '주차와 일차를 함께 기억해 두면 나중에 실습 포트폴리오 정리에 좋습니다.',
  },
  ward: {
    title: '실습 병동',
    summary: '어느 진료과 병동인지 작성합니다. (예: 호흡기내과 71병동, 외과계 중환자실)',
    tip: '병동 특성에 따라 자주 쓰는 약어와 핵심간호술이 달라지므로 정확히 적으면 맞춤 제안을 받을 수 있습니다.',
  },
  practiceHours: {
    title: '실습 시간 (근무 번)',
    summary: 'Day(07:00~15:00) 또는 Evening(15:00~23:00) 등 실습 시간대를 적습니다.',
    tip: '인계 시간, 투약 시간, 라운딩 시간 등 시간대별 흐름을 파악하는 기준이 됩니다.',
  },
  observation: {
    title: '관찰 내용 (Observation)',
    summary: '학생이 직접 손대지 않고, 간호사 선생님의 처치나 병동 상황·환자 상태를 눈으로 보고 들은 내용입니다.',
    tip: '환자 실명 대신 "김OO(M/68)"처럼 비식별화하고, "열이 났다" 대신 "BT 38.2℃"처럼 구체적 수치를 적으세요.',
  },
  performance: {
    title: '수행 내용 (Performance)',
    summary: '학생 간호사가 직접 수행한 간호 활동만 따로 적습니다. (예: 활력징후 측정, 혈당 측정, 침상 정리)',
    tip: '"혈압을 쟀다"로 끝내지 말고 측정값(BP 130/80mmHg), 수행 시 주의점(커프 크기, 안정 후 측정 등)을 함께 쓰세요.',
  },
  selfDirectedLearning: {
    title: '자기주도학습',
    summary: '실습 중 궁금했던 질환, 검사, 약물, 의학 약어를 스스로 찾아 정리한 내용입니다.',
    tip: '약어의 풀네임(영문) + 한국어 뜻 + 왜 이 환자에게 적용했는지를 1~2줄로 연결하면 훌륭합니다.',
  },
  reflection: {
    title: '성찰 및 느낀 점',
    summary: '단순한 감정 일기가 아니라, [경험한 상황 → 배운 간호 원리 → 다음 실습 적용 계획] 순서로 쓰는 전문적 성찰입니다.',
    tip: '"힘들었지만 뿌듯했다" 대신 "환자 불안을 줄이기 위해 시술 전 설명의 중요성을 깨달았고, 다음에는 눈높이를 맞춰 먼저 안내하겠다"처럼 적어보세요.',
  },
};

/** 사례보고서 항목별 1학년용 도움말 */
export const CASE_STUDY_GUIDES: Record<keyof CaseStudyData, FieldGuide> = {
  patientSummaryAndLiterature: {
    title: '기본 정보 및 문헌고찰 요약',
    summary: '환자의 연령·성별·주진단명과 교과서(문헌)에서 설명하는 해당 질환의 원인, 대표 증상, 치료법을 요약합니다.',
    tip: '문헌에 나온 교과서 내용과 "실제 내 대상자"의 공통점·차이점을 비교해 적으면 점수가 크게 올라갑니다.',
  },
  subjectiveData: {
    title: '주관적 자료 (Subjective Data, S)',
    summary: '환자 본인이 직접 말로 호소하는 증상이나 느낌입니다. 반드시 따옴표(" ")로 환자의 표현을 그대로 적습니다.',
    tip: '주의! 보호자가 대신 말한 내용이나 간호사가 잰 체온·혈압은 주관적 자료(S)가 아니라 객관적 자료(O)입니다.',
  },
  objectiveData: {
    title: '객관적 자료 (Objective Data, O)',
    summary: '간호사가 직접 측정·관찰·검진한 사실입니다. (활력징후, 신체검진 소견, 검사 수치, 표정, 호흡 양상 등)',
    tip: '보호자의 진술("어제부터 밥을 못 드셨어요" - 보호자)도 임상에서는 주로 객관적 자료(O)로 분류하며 출처를 표기합니다.',
  },
  labsAndMedications: {
    title: '진단검사 결과 및 투여 약물',
    summary: '혈액검사·영상검사 수치와 투여 중인 약물의 상품명/성분명, 용량, 투여 경로, 작용 및 부작용을 정리합니다.',
    tip: '검사 수치는 숫자만 나열하지 말고 "정상 범위(예: WBC 4.0~10.0)와 비교해 상승/저하되었는지" 해석을 꼭 붙이세요.',
  },
  nursingDiagnosis: {
    title: '간호진단 (우선순위 포함)',
    summary: '의학적 진단명(예: 폐렴, 당뇨)이 아니라, 질환으로 인해 환자가 겪는 건강 문제를 NANDA-I 형식으로 진술합니다.',
    tip: '형식: "[관련요인]과 관련된 [간호진단명]" (예: 기관지 분비물 축적과 관련된 비효과적 기도청결). 우선순위는 ABC(기도-호흡-순환)와 매슬로우 욕구 이론을 따릅니다.',
  },
  goalsAndInterventions: {
    title: '단기·장기 목표 및 간호중재·이론적 근거',
    summary: '목표는 SMART 원칙(구체적·측정가능·달성가능·관련성·기한)으로 작성하고, 중재는 진단적/치료적/교육적으로 균형 있게 구성합니다.',
    tip: '나쁜 목표: "호흡이 편해진다" → 좋은 목표: "3일 이내에 SpO2 95% 이상, 호흡수 20회/분 이하를 유지한다." 각 중재마다 왜 하는지(이론적 근거)를 꼭 적으세요.',
  },
  evaluationAndReferences: {
    title: '평가 및 참고문헌',
    summary: '설정한 단기·장기 목표가 달성되었는지(달성/부분달성/미달성) 객관적 수치로 재평가하고, 참고한 교과서·가이드라인을 적습니다.',
    tip: '참고문헌은 저자, 출판연도, 도서명, 출판사, 쪽수(또는 약학정보원 등 공식 사이트)를 APA 형식으로 기재합니다.',
  },
};

/** 탭 1: 실습일지 테스트용 예시 데이터 (의도적 실수 포함) */
export const SAMPLE_PRACTICE_LOG: PracticeLogData = {
  practiceDate: '2026-05-14',
  ward: '호흡기내과 71병동',
  practiceHours: 'Day (07:00 ~ 15:00)',
  observation:
    '오늘 7102호 김철수(남/72세, 등록번호 2026051488, 보호자 연락처 010-4829-1930) 환자분이 숨이 차다고 하셔서 간호사 선생님이 산소를 틀어주시는 것을 보았다. 그리고 내가 직접 혈압도 쟀다. 가래가 많아 보였고 열도 좀 있는 것 같았다.',
  performance:
    '오전 라운딩 때 환자분들 혈압을 쟀고 체온도 쟀다. 간호사 선생님이 항생제 주사 놓는 걸 옆에서 열심히 구경했다. 침대 시트도 정리해 드렸다.',
  selfDirectedLearning:
    '폐렴이 뭔지 찾아봤다. 그리고 SpO2랑 PRN이라는 말을 들었는데 정확히 뭔지 아직 잘 모르겠다.',
  reflection:
    '오늘 첫 실습이라 너무 긴장되고 다리가 아팠다. 그래도 환자분들이 고맙다고 해주셔서 간호사가 되고 싶다는 마음이 더 커졌고 정말 보람찬 하루였다. 내일은 더 열심히 해야겠다!',
};

/** 탭 2: 사례보고서 테스트용 예시 데이터 (의도적 실수 포함) */
export const SAMPLE_CASE_STUDY: CaseStudyData = {
  patientSummaryAndLiterature:
    '대상자: 이영희(여/68세, 주민번호 580312-2145678). 진단명: 지역사회 획득 폐렴(Community-Acquired Pneumonia). 문헌고찰: 폐렴은 세균이나 바이러스 등에 의해 폐포에 염증이 생기는 질환으로 발열, 기침, 가래, 호흡곤란이 나타나며 항생제 치료를 한다.',
  subjectiveData:
    '"가슴이 답답하고 숨쉬기가 힘들어요."\n보호자(딸)가 "어제 밤부터 열이 펄펄 끓고 기침을 계속 했어요"라고 말함.\nSpO2 90%, 체온 38.4도 측정됨.',
  objectiveData:
    '입원 시 활력징후: BP 138/86mmHg, PR 104회/분, RR 26회/분, BT 38.4℃.\n환자가 "기침할 때마다 옆구리가 아파요"라고 호소함.\n청진 시 우하엽에서 수포음(crackle) 들림. 누런 가래 있음.',
  labsAndMedications:
    'WBC 15.8, CRP 11.4, Chest X-ray: RLL consolidation.\n약물: Ceftriaxone 2g IV, 타이레놀 복용, 뮤코미스트 네뷸라이저.',
  nursingDiagnosis:
    '1순위: 폐렴\n2순위: 고열과 관련된 불편감',
  goalsAndInterventions:
    '단기목표: 환자의 숨이 덜 차고 편안해진다.\n장기목표: 폐렴이 완전히 낫는다.\n간호중재:\n1. 환자에게 물을 많이 마시라고 교육한다.\n2. 숨쉬기 편하게 등을 두드려주고 기침을 하라고 한다.\n3. 산소를 준다.',
  evaluationAndReferences:
    '환자 상태가 전보다 조금 나아진 것 같다.\n참고문헌: 네이버 지식백과, 성인간호학 교과서.',
};
