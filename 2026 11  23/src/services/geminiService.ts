/**
 * Google Gemini REST API 연동 서비스
 * - 사용자가 상단 바에 입력한 API 키로 gemini-2.5-flash 모델을 직접 호출합니다.
 * - JSON 응답 파싱 실패 시에도 앱이 크래시되지 않도록 원문 텍스트 폴백(Fallback)을 제공합니다.
 */

import {
  ActiveTab,
  AnalysisResponse,
  CaseStudyData,
  ChecklistItem,
  ChecklistStatus,
  FeedbackCorrection,
  GlossaryTerm,
  PracticeLogData,
  ProactiveSuggestion,
  StructuredAnalysisResult,
} from '../types/nursing';

const GEMINI_MODEL = 'gemini-2.5-flash';

/** Gemini API 호출 공통 시스템 프롬프트 */
function buildSystemPrompt(tab: ActiveTab): string {
  const baseRole = `당신은 대한민국 간호학과 교수이자 임상실습 전담 지도간호사(프리셉터)입니다.
대상 사용자는 3학년 임상실습을 미리 연습하는 '간호학과 1학년 학생'입니다.
따뜻하고 격려하는 말투를 유지하되, 임상 간호 기록의 정확성·객관성·비식별화 원칙은 엄격하고 정밀하게 피드백해 주세요.
모든 답변은 자연스러운 한국어로 작성하고, 반드시 지정된 JSON 스키마만 출력하세요.`;

  if (tab === 'practice-log') {
    return `${baseRole}

[실습일지 분석 중점 사항]
1. 부족한 점 피드백(corrections):
   - 개인정보 노출 여부(환자 실명, 주민등록번호, 전화번호, 병원등록번호 등 비식별화 위반) 최우선 지적
   - 객관적 수치 누락("혈압을 쟀다", "열이 좀 있다" 등 구체적 수치/단위 누락) 지적
   - 관찰 내용과 수행 내용 혼동(직접 한 일과 지켜본 일이 섞여 있는 경우) 지적
   - 감정 위주 일기체 성찰("힘들었지만 뿌듯했다") 지적
2. 추가할 내용 선제안(proactiveSuggestions):
   - 해당 병동에서 자주 쓰이는 핵심 의학 약어 3~5개(영문 풀네임 + 뜻)
   - 작성 내용과 연결되는 한국간호교육평가원 핵심기본간호술 추천
   - [경험한 상황 → 배운 간호 원리 → 다음 실습 적용 계획] 구조의 성찰 보완 초안
   - 추가로 공부하면 좋은 자기주도학습 키워드 제안
3. 1학년용 쉬운 용어 풀이(glossary):
   - 피드백과 제안에 등장한 의학·간호 용어를 1학년이 이해할 수 있는 쉬운 한국어 1~2문장으로 풀이
4. 항목별 완성도 체크리스트(checklist):
   - '기본 정보(날짜/병동/시간)', '개인정보 비식별화', '관찰 내용의 객관성·수치', '수행 내용 구분 및 구체성', '자기주도학습 깊이', '전문적 성찰 구조' 6개 항목을 complete / needs_improvement / missing 으로 평가`;
  }

  return `${baseRole}

[사례보고서(Case Study) 분석 중점 사항]
1. 부족한 점 피드백(corrections):
   - 개인정보 노출 여부(실명, 주민등록번호 등) 최우선 지적
   - 문헌고찰과 실제 대상자의 증상·치료 비교 누락 지적
   - 간호사정 S(주관적 자료)/O(객관적 자료) 분류 오류(보호자 진술을 S에 넣거나, 활력징후를 S에 넣거나, 환자 직접 호소를 O에 넣은 경우 등) 정밀 지적
   - 진단검사 수치의 정상 범위 비교 및 임상적 해석 누락, 약물의 작용/부작용 누락 지적
   - 의학적 진단명(예: 폐렴)과 NANDA-I 간호진단 혼용 지적
   - 기한·측정 가능한 수치가 없는 막연한 목표(SMART 원칙 위반) 지적
   - 간호중재 유형(진단적/치료적/교육적) 편중 및 이론적 근거 누락 지적
   - 참고문헌 형식(비공식 블로그/지식백과 사용 등) 지적
2. 추가할 내용 선제안(proactiveSuggestions):
   - 진단명 기준 추가로 확인해야 할 핵심 검사 항목 및 투여 약물의 주요 관찰 부작용
   - 입력된 S/O 자료 기반 NANDA-I 형식 간호진단 후보 2~3개와 우선순위 근거(ABC / 매슬로우 욕구 이론)
   - SMART 원칙을 충족하는 측정 가능한 단기·장기 목표 수정안
   - 진단적/치료적/교육적 간호중재 및 각 중재의 이론적 근거 초안
3. 1학년용 쉬운 용어 풀이(glossary):
   - 피드백과 제안에 등장한 의학·간호 용어(예: NANDA-I, SMART, 수포음, CRP 등)를 1학년 눈높이로 1~2문장 풀이
4. 항목별 완성도 체크리스트(checklist):
   - '개인정보 비식별화', '문헌고찰 및 대상자 비교', '간호사정(S/O 정확한 구분)', '진단검사 해석 및 약물 정리', 'NANDA-I 간호진단 및 우선순위', 'SMART 목표 및 중재·이론적 근거', '평가 및 참고문헌 신뢰성' 7개 항목을 complete / needs_improvement / missing 으로 평가`;
}

/** 사용자 입력 내용을 프롬프트 문자열로 포맷 */
function buildUserPrompt(tab: ActiveTab, data: PracticeLogData | CaseStudyData): string {
  const jsonSchemaGuide = `
반드시 아래 JSON 형식으로만 응답하세요(마크다운 코드블록 없이 순수 JSON):
{
  "overallScore": 0~100 사이의 정수,
  "overallSummary": "학생을 격려하며 핵심 개선 방향을 요약하는 2~3문장",
  "corrections": [
    {
      "category": "항목명 (예: 개인정보 보호, S/O 분류 오류 등)",
      "severity": "high | medium | low",
      "issue": "초안에서 발견된 구체적인 부족한 점",
      "suggestion": "이렇게 고치면 좋다는 구체적인 수정 예시"
    }
  ],
  "proactiveSuggestions": [
    {
      "category": "제안 분류 (예: 병동 핵심 약어, NANDA-I 간호진단 추천 등)",
      "title": "제안 제목",
      "content": "바로 보고서에 참고·응용할 수 있는 구체적 제안 내용 (줄바꿈 활용 가능)"
    }
  ],
  "glossary": [
    {
      "term": "의학/간호 전공 용어",
      "explanation": "1학년도 바로 이해할 수 있는 쉬운 한국어 1~2문장 설명"
    }
  ],
  "checklist": [
    {
      "item": "체크 항목명",
      "status": "complete | needs_improvement | missing",
      "comment": "해당 항목에 대한 1줄 코멘트"
    }
  ]
}`;

  if (tab === 'practice-log') {
    const log = data as PracticeLogData;
    return `[학생이 작성한 실습일지 초안]
- 실습 날짜: ${log.practiceDate || '(미입력)'}
- 실습 병동: ${log.ward || '(미입력)'}
- 실습 시간: ${log.practiceHours || '(미입력)'}
- 관찰 내용:
${log.observation || '(미입력)'}

- 수행 내용:
${log.performance || '(미입력)'}

- 자기주도학습:
${log.selfDirectedLearning || '(미입력)'}

- 성찰 및 느낀 점:
${log.reflection || '(미입력)'}
${jsonSchemaGuide}`;
  }

  const cs = data as CaseStudyData;
  return `[학생이 작성한 사례보고서(Case Study) 초안]
- 기본 정보 및 문헌고찰 요약:
${cs.patientSummaryAndLiterature || '(미입력)'}

- 간호사정 - 주관적 자료(S):
${cs.subjectiveData || '(미입력)'}

- 간호사정 - 객관적 자료(O):
${cs.objectiveData || '(미입력)'}

- 진단검사 결과 및 투여 약물:
${cs.labsAndMedications || '(미입력)'}

- 간호진단(우선순위 포함):
${cs.nursingDiagnosis || '(미입력)'}

- 단기·장기 목표 및 간호중재(진단적/치료적/교육적)·이론적 근거:
${cs.goalsAndInterventions || '(미입력)'}

- 평가 및 참고문헌:
${cs.evaluationAndReferences || '(미입력)'}
${jsonSchemaGuide}`;
}

/** 응답 JSON의 안전 정규화 */
function normalizeStructuredResult(parsed: unknown): StructuredAnalysisResult | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;

  const rawScore = Number(obj.overallScore);
  const overallScore = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, Math.round(rawScore)))
    : 50;

  const overallSummary =
    typeof obj.overallSummary === 'string' && obj.overallSummary.trim()
      ? obj.overallSummary.trim()
      : '작성하신 초안을 바탕으로 개선 포인트와 추가 학습 제안을 정리했습니다.';

  const corrections: FeedbackCorrection[] = Array.isArray(obj.corrections)
    ? obj.corrections
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item): FeedbackCorrection => ({
          category: String(item.category ?? '일반 피드백'),
          severity:
            item.severity === 'high' || item.severity === 'medium' || item.severity === 'low'
              ? item.severity
              : 'medium',
          issue: String(item.issue ?? ''),
          suggestion: String(item.suggestion ?? ''),
        }))
        .filter((item) => item.issue || item.suggestion)
    : [];

  const proactiveSuggestions: ProactiveSuggestion[] = Array.isArray(obj.proactiveSuggestions)
    ? obj.proactiveSuggestions
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => ({
          category: String(item.category ?? '추가 제안'),
          title: String(item.title ?? '추천 항목'),
          content: String(item.content ?? ''),
        }))
        .filter((item) => item.content)
    : [];

  const glossary: GlossaryTerm[] = Array.isArray(obj.glossary)
    ? obj.glossary
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => ({
          term: String(item.term ?? ''),
          explanation: String(item.explanation ?? ''),
        }))
        .filter((item) => item.term && item.explanation)
    : [];

  const validStatuses: ChecklistStatus[] = ['complete', 'needs_improvement', 'missing'];
  const checklist: ChecklistItem[] = Array.isArray(obj.checklist)
    ? obj.checklist
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => ({
          item: String(item.item ?? ''),
          status: validStatuses.includes(item.status as ChecklistStatus)
            ? (item.status as ChecklistStatus)
            : 'needs_improvement',
          comment: String(item.comment ?? ''),
        }))
        .filter((item) => item.item)
    : [];

  // 핵심 섹션이 하나도 없으면 구조화 파싱 실패로 간주
  if (
    corrections.length === 0 &&
    proactiveSuggestions.length === 0 &&
    glossary.length === 0 &&
    checklist.length === 0
  ) {
    return null;
  }

  return {
    overallScore,
    overallSummary,
    corrections,
    proactiveSuggestions,
    glossary,
    checklist,
  };
}

/** 코드 펜스 제거 후 안전 JSON 파싱 */
function safeParseJson(rawText: string): StructuredAnalysisResult | null {
  try {
    const cleaned = rawText
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    return normalizeStructuredResult(parsed);
  } catch {
    // JSON 본문만 중괄호 범위로 한 번 더 추출 시도
    try {
      const startIdx = rawText.indexOf('{');
      const endIdx = rawText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx > startIdx) {
        const sliced = rawText.slice(startIdx, endIdx + 1);
        const parsed = JSON.parse(sliced);
        return normalizeStructuredResult(parsed);
      }
    } catch {
      return null;
    }
    return null;
  }
}

/**
 * Gemini API 호출 메인 함수
 * - 오류 발생 시 사용자에게 명확한 한국어 안내 메시지를 throw 합니다.
 */
export async function analyzeNursingDraft(
  apiKey: string,
  tab: ActiveTab,
  data: PracticeLogData | CaseStudyData,
): Promise<AnalysisResponse> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    throw new Error('Gemini API 키가 입력되지 않았습니다. 상단 설정 바에 API 키를 먼저 입력해 주세요.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
    trimmedKey,
  )}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemPrompt(tab) }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: buildUserPrompt(tab, data) }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      }),
    });
  } catch {
    throw new Error(
      '네트워크 연결에 실패했습니다. 인터넷 연결 상태를 확인한 뒤 다시 시도해 주세요.',
    );
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = (await response.json()) as { error?: { message?: string } };
      errorDetail = errJson?.error?.message ?? '';
    } catch {
      // 응답 본문 파싱 실패 무시
    }

    if (response.status === 400 || response.status === 401 || response.status === 403) {
      throw new Error(
        `API 키가 올바르지 않거나 권한이 없습니다. Google AI Studio에서 발급받은 Gemini API 키를 다시 확인해 주세요.${
          errorDetail ? ` (상세: ${errorDetail})` : ''
        }`,
      );
    }

    if (response.status === 429) {
      throw new Error(
        'API 호출 한도를 초과했습니다. 잠시 후(약 1분 뒤) 다시 시도하거나 API 키 할당량을 확인해 주세요.',
      );
    }

    throw new Error(
      `Gemini API 요청 중 오류가 발생했습니다 (HTTP ${response.status}).${
        errorDetail ? ` ${errorDetail}` : ''
      }`,
    );
  }

  let responseJson: {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  try {
    responseJson = await response.json();
  } catch {
    throw new Error('AI 응답을 읽는 중 오류가 발생했습니다. 다시 시도해 주세요.');
  }

  const rawText =
    responseJson.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('\n')
      .trim() ?? '';

  if (!rawText) {
    throw new Error('AI로부터 빈 응답을 받았습니다. 입력 내용을 조금 더 보완한 뒤 다시 시도해 주세요.');
  }

  const analyzedAt = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const structured = safeParseJson(rawText);
  if (structured) {
    return {
      isFallback: false,
      structured,
      rawText,
      analyzedTab: tab,
      analyzedAt,
    };
  }

  // JSON 파싱 실패 시 앱 크래시 없이 원문 텍스트 폴백 반환
  return {
    isFallback: true,
    rawText,
    analyzedTab: tab,
    analyzedAt,
  };
}
