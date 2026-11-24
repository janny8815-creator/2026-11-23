/**
 * 간호실습 메이트 핵심 타입 정의
 * - 실습일지, 사례보고서, AI 분석 결과, 개인정보 감지 타입을 관리합니다.
 */

export type ActiveTab = 'practice-log' | 'case-study';

/** 탭 1: 실습일지 입력 데이터 */
export interface PracticeLogData {
  practiceDate: string;
  ward: string;
  practiceHours: string;
  observation: string;
  performance: string;
  selfDirectedLearning: string;
  reflection: string;
}

/** 탭 2: 사례보고서(Case Study) 입력 데이터 */
export interface CaseStudyData {
  patientSummaryAndLiterature: string;
  subjectiveData: string;
  objectiveData: string;
  labsAndMedications: string;
  nursingDiagnosis: string;
  goalsAndInterventions: string;
  evaluationAndReferences: string;
}

/** 카드 1: 부족한 점 피드백 항목 */
export interface FeedbackCorrection {
  category: string;
  severity: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
}

/** 카드 2: 추가할 내용 선제안 항목 */
export interface ProactiveSuggestion {
  category: string;
  title: string;
  content: string;
}

/** 카드 3: 1학년용 쉬운 용어 풀이 항목 */
export interface GlossaryTerm {
  term: string;
  explanation: string;
}

/** 카드 4: 항목별 완성도 체크리스트 항목 */
export type ChecklistStatus = 'complete' | 'needs_improvement' | 'missing';

export interface ChecklistItem {
  item: string;
  status: ChecklistStatus;
  comment: string;
}

/** Gemini AI 구조화 응답 형태 */
export interface StructuredAnalysisResult {
  overallScore: number;
  overallSummary: string;
  corrections: FeedbackCorrection[];
  proactiveSuggestions: ProactiveSuggestion[];
  glossary: GlossaryTerm[];
  checklist: ChecklistItem[];
}

/** 앱에서 사용하는 최종 분석 응답 (JSON 파싱 실패 시 원문 폴백 지원) */
export interface AnalysisResponse {
  isFallback: boolean;
  structured?: StructuredAnalysisResult;
  rawText?: string;
  analyzedTab: ActiveTab;
  analyzedAt: string;
}

/** 도움말 텍스트 구조 */
export interface FieldGuide {
  title: string;
  summary: string;
  tip: string;
}

/** 개인정보 감지 항목 */
export interface PrivacyIssue {
  type: string;
  matchedText: string;
  guidance: string;
}
