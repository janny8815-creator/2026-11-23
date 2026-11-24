/**
 * 우측 AI 분석 결과 패널
 * - 전체 완성도 점수/진행률 바, 4개 핵심 카드(교정 피드백, 추가 선제안, 1학년 용어 풀이, 체크리스트)를 렌더링합니다.
 * - JSON 파싱 실패 시에도 원문 텍스트 폴백으로 안전하게 출력합니다.
 * - 결과 복사하기 및 인쇄(PDF 저장) 기능을 제공합니다.
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileWarning,
  Lightbulb,
  Printer,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { AnalysisResponse, ChecklistStatus, FeedbackCorrection } from '../types/nursing';

interface FeedbackPanelProps {
  result: AnalysisResponse | null;
  isLoading: boolean;
  errorMessage: string | null;
}

/** 복사하기용 깔끔한 텍스트 생성 */
function buildCopyText(result: AnalysisResponse): string {
  const title = result.analyzedTab === 'practice-log' ? '실습일지' : '사례보고서(Case Study)';
  if (result.isFallback || !result.structured) {
    return `[간호실습 메이트 - ${title} AI 피드백]\n\n${result.rawText ?? ''}\n\n※ 본 AI 피드백은 학습 초안 보조용이며, 실제 과제 제출 전 반드시 전공 교과서 및 공식 의약품 정보(약학정보원 등)로 정확성을 검증해야 합니다.`;
  }

  const s = result.structured;
  const lines: string[] = [
    `[간호실습 메이트 - ${title} AI 정밀 피드백]`,
    `전체 완성도: ${s.overallScore}점 / 100점`,
    `총평: ${s.overallSummary}`,
    '',
    '=== 1. 부족한 점 피드백 (교정) ===',
    ...s.corrections.map(
      (c, i) => `${i + 1}. [${c.category}] ${c.issue}\n   → 수정 제안: ${c.suggestion}`,
    ),
    '',
    '=== 2. 추가할 내용 선제안 (먼저 추천) ===',
    ...s.proactiveSuggestions.map(
      (p, i) => `${i + 1}. [${p.category}] ${p.title}\n${p.content}`,
    ),
    '',
    '=== 3. 1학년용 쉬운 용어 풀이 ===',
    ...s.glossary.map((g) => `- ${g.term}: ${g.explanation}`),
    '',
    '=== 4. 항목별 완성도 체크리스트 ===',
    ...s.checklist.map((item) => {
      const label =
        item.status === 'complete'
          ? '충족'
          : item.status === 'needs_improvement'
            ? '보완필요'
            : '누락';
      return `- [${label}] ${item.item}: ${item.comment}`;
    }),
    '',
    '※ 본 AI 피드백은 학습 초안 보조용이며, 실제 과제 제출 전 반드시 전공 교과서 및 공식 의약품 정보(약학정보원 등)로 정확성을 검증해야 합니다.',
  ];

  return lines.join('\n');
}

function getSeverityBadge(severity: FeedbackCorrection['severity']) {
  if (severity === 'high') {
    return {
      label: '필수 교정',
      className: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
    };
  }
  if (severity === 'medium') {
    return {
      label: '보완 권장',
      className: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    };
  }
  return {
    label: '참고 팁',
    className: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
  };
}

function getChecklistBadge(status: ChecklistStatus) {
  if (status === 'complete') {
    return {
      label: '충족',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    };
  }
  if (status === 'needs_improvement') {
    return {
      label: '보완필요',
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    };
  }
  return {
    label: '누락',
    icon: <XCircle className="h-4 w-4 text-rose-500" />,
    badgeClass: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  };
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  result,
  isLoading,
  errorMessage,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildCopyText(result));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API가 차단된 환경 폴백
      const textarea = document.createElement('textarea');
      textarea.value = buildCopyText(result);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-area flex flex-col gap-4">
      {/* 오류 상태 */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-800">분석을 완료하지 못했습니다</h3>
              <p className="text-sm leading-relaxed text-rose-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="rounded-2xl border border-teal-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            프리셉터 AI가 초안을 꼼꼼히 검토 중입니다...
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            비식별화 여부, 객관적 수치, S/O 구분, NANDA-I 간호진단 및 추가 학습 키워드를 정리하고 있습니다.
          </p>
          <div className="mt-6 space-y-2.5 text-left">
            <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      )}

      {/* 결과 대기 상태 */}
      {!isLoading && !result && !errorMessage && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">AI 정밀 피드백 결과가 여기에 표시됩니다</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            왼쪽 입력창에 초안을 작성하거나 <strong>[예시 데이터 채우기]</strong>를 클릭한 뒤 분석 버튼을 눌러보세요.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-2 text-left text-xs text-slate-600 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <strong className="text-rose-700">카드 1. 부족한 점 교정</strong>
              <p className="mt-0.5 text-slate-500">비식별화, 수치 누락, S/O 오류, SMART 위반 지적</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <strong className="text-teal-700">카드 2. 추가할 내용 선제안</strong>
              <p className="mt-0.5 text-slate-500">병동 약어, 핵심간호술, NANDA-I 진단 및 중재 추천</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <strong className="text-sky-700">카드 3. 1학년 쉬운 용어 풀이</strong>
              <p className="mt-0.5 text-slate-500">피드백 속 낯선 의학·간호 용어를 1~2문장으로 해설</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <strong className="text-emerald-700">카드 4. 완성도 체크리스트</strong>
              <p className="mt-0.5 text-slate-500">필수 항목 충족/보완필요/누락 상태를 한눈에 확인</p>
            </div>
          </div>
        </div>
      )}

      {/* 분석 결과 렌더링 */}
      {!isLoading && result && (
        <>
          {/* 결과 상단 액션 바 */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Sparkles className="h-4 w-4 text-teal-600" />
                {result.analyzedTab === 'practice-log' ? '실습일지' : '사례보고서'} AI 분석 완료
              </span>
              <p className="text-xs text-slate-400">분석 시각: {result.analyzedAt}</p>
            </div>
            <div className="no-print flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? '복사됨!' : '결과 복사하기'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Printer className="h-3.5 w-3.5" />
                인쇄 / PDF
              </button>
            </div>
          </div>

          {/* JSON 파싱 실패 시 안전 원문 폴백 출력 */}
          {result.isFallback || !result.structured ? (
            <div className="print-card rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-amber-800">
                <FileWarning className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm font-bold">
                  AI 원문 응답 보기 (구조화 형식 변환 중 일부 형식이 달라 원문으로 표시합니다)
                </h3>
              </div>
              <pre className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-800">
                {result.rawText}
              </pre>
            </div>
          ) : (
            <>
              {/* 선택적 요구사항: 전체 완성도 점수 및 진행률 바 */}
              <div className="print-card rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-white to-sky-50/50 p-5 shadow-sm">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      초안 완성도 점수
                    </p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {result.structured.overallScore}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">/ 100점</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-700 shadow-sm ring-1 ring-teal-100">
                    {result.structured.overallScore >= 80
                      ? '우수한 초안'
                      : result.structured.overallScore >= 60
                        ? '보완 후 제출 권장'
                        : '핵심 항목 집중 보완 필요'}
                  </span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all duration-500"
                    style={{ width: `${result.structured.overallScore}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {result.structured.overallSummary}
                </p>
              </div>

              {/* 카드 1: 부족한 점 피드백 (교정) */}
              <section className="print-card rounded-2xl border border-rose-200/80 bg-white p-5 shadow-sm">
                <div className="mb-3.5 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      카드 1. 부족한 점 피드백 (교정)
                    </h3>
                    <p className="text-xs text-slate-500">
                      초안에서 꼭 고쳐야 할 임상 기록 오류와 개선 방향입니다.
                    </p>
                  </div>
                </div>

                {result.structured.corrections.length === 0 ? (
                  <p className="text-sm text-slate-500">특별히 지적할 큰 오류가 발견되지 않았습니다.</p>
                ) : (
                  <ul className="space-y-3">
                    {result.structured.corrections.map((item, idx) => {
                      const badge = getSeverityBadge(item.severity);
                      return (
                        <li
                          key={idx}
                          className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5"
                        >
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                            <span className="text-xs font-bold text-slate-800">{item.category}</span>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-800">{item.issue}</p>
                          {item.suggestion && (
                            <div className="mt-2 rounded-lg border border-teal-100 bg-teal-50/70 px-3 py-2 text-xs leading-relaxed text-teal-900">
                              <strong className="font-bold text-teal-800">수정 가이드: </strong>
                              {item.suggestion}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* 카드 2: 추가할 내용 선제안 (먼저 추천) */}
              <section className="print-card rounded-2xl border border-teal-200/80 bg-white p-5 shadow-sm">
                <div className="mb-3.5 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                    <Lightbulb className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      카드 2. 추가할 내용 선제안 (먼저 추천)
                    </h3>
                    <p className="text-xs text-slate-500">
                      보고서의 완성도를 한 단계 높여줄 맞춤형 추가 항목과 초안 제안입니다.
                    </p>
                  </div>
                </div>

                {result.structured.proactiveSuggestions.length === 0 ? (
                  <p className="text-sm text-slate-500">추가 제안 항목이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {result.structured.proactiveSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-teal-100 bg-teal-50/40 p-3.5"
                      >
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-white">
                            {item.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 카드 3: 1학년용 쉬운 용어 풀이 */}
              <section className="print-card rounded-2xl border border-sky-200/80 bg-white p-5 shadow-sm">
                <div className="mb-3.5 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      카드 3. 1학년용 쉬운 용어 풀이
                    </h3>
                    <p className="text-xs text-slate-500">
                      피드백에 등장한 의학·간호 전공 용어를 쉽게 풀어 설명합니다.
                    </p>
                  </div>
                </div>

                {result.structured.glossary.length === 0 ? (
                  <p className="text-sm text-slate-500">풀이할 전공 용어가 없습니다.</p>
                ) : (
                  <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {result.structured.glossary.map((g, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-sky-100 bg-sky-50/40 p-3"
                      >
                        <dt className="text-xs font-bold text-sky-900">{g.term}</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-slate-700">
                          {g.explanation}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>

              {/* 카드 4: 항목별 완성도 체크리스트 */}
              <section className="print-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3.5 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <ClipboardCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      카드 4. 항목별 완성도 체크리스트
                    </h3>
                    <p className="text-xs text-slate-500">
                      필수 요소 충족 여부를 한눈에 점검하세요.
                    </p>
                  </div>
                </div>

                <ul className="divide-y divide-slate-100">
                  {result.structured.checklist.map((item, idx) => {
                    const meta = getChecklistBadge(item.status);
                    return (
                      <li
                        key={idx}
                        className="flex flex-col gap-1.5 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="mt-0.5 shrink-0">{meta.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.item}</p>
                            {item.comment && (
                              <p className="text-xs leading-relaxed text-slate-500">
                                {item.comment}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`w-fit shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          )}
        </>
      )}

      {/* 하단 고정 면책 안내 문구 */}
      <div className="rounded-xl border border-slate-200 bg-slate-100/90 px-4 py-3 text-xs leading-relaxed text-slate-600">
        <strong className="font-bold text-slate-700">[학습 검증 안내] </strong>
        본 AI 피드백은 학습 초안 보조용이며, 실제 과제 제출 전 반드시 전공 교과서 및 공식 의약품
        정보(약학정보원 등)로 정확성을 검증해야 합니다.
      </div>
    </div>
  );
};
