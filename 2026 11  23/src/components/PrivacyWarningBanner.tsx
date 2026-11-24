/**
 * 실시간 개인정보(비식별화) 사전 경고 배너
 * - 주민등록번호, 전화번호, 병원등록번호(연속 숫자) 패턴을 실시간 감지해
 *   AI 전송 전 화면에 빨간색 주의 배너를 즉시 표시합니다.
 */

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { PrivacyIssue } from '../types/nursing';

/** 입력 텍스트에서 개인정보 의심 패턴을 실시간 탐지하는 유틸 함수 */
export function detectPrivacyIssues(combinedText: string): PrivacyIssue[] {
  if (!combinedText.trim()) return [];

  const issues: PrivacyIssue[] = [];
  const matchedSpans = new Set<string>();

  // 1. 주민등록번호 패턴 (예: 580312-2145678 또는 13자리 연속 숫자)
  const rrnRegex = /\b\d{6}\s*-\s*[1-4]\d{6}\b|\b\d{6}[1-4]\d{6}\b/g;
  const rrnMatches = combinedText.match(rrnRegex) ?? [];
  for (const m of rrnMatches) {
    if (!matchedSpans.has(m)) {
      matchedSpans.add(m);
      issues.push({
        type: '주민등록번호 의심',
        matchedText: m,
        guidance: '주민등록번호는 절대 기재하지 말고 연령·성별(예: F/68)만 남기세요.',
      });
    }
  }

  // 2. 휴대전화 및 일반 전화번호 패턴 (예: 010-1234-5678, 02-123-4567)
  const phoneRegex = /\b01[016789][-\s]?\d{3,4}[-\s]?\d{4}\b|\b0\d{1,2}-\d{3,4}-\d{4}\b/g;
  const phoneMatches = combinedText.match(phoneRegex) ?? [];
  for (const m of phoneMatches) {
    if (!matchedSpans.has(m)) {
      matchedSpans.add(m);
      issues.push({
        type: '전화번호(연락처) 의심',
        matchedText: m,
        guidance: '환자 및 보호자 연락처는 즉시 삭제해 주세요.',
      });
    }
  }

  // 3. 병원등록번호/차트번호 의심 (7~12자리 연속 숫자, 이미 탐지된 번호 제외)
  const sanitizedForMrn = combinedText
    .replace(rrnRegex, ' ')
    .replace(phoneRegex, ' ');
  const mrnRegex = /\b\d{7,12}\b/g;
  const mrnMatches = sanitizedForMrn.match(mrnRegex) ?? [];
  for (const m of mrnMatches) {
    if (!matchedSpans.has(m)) {
      matchedSpans.add(m);
      issues.push({
        type: '병원등록번호(연속 숫자) 의심',
        matchedText: m,
        guidance: '병원등록번호·차트번호는 삭제하거나 비식별 처리해 주세요.',
      });
    }
  }

  return issues;
}

interface PrivacyWarningBannerProps {
  issues: PrivacyIssue[];
}

export const PrivacyWarningBanner: React.FC<PrivacyWarningBannerProps> = ({ issues }) => {
  if (issues.length === 0) return null;

  return (
    <div
      role="alert"
      className="no-print rounded-xl border-2 border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-rose-100 p-2 text-rose-600">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-rose-800">
              개인정보 노출 주의! AI 분석 전 비식별화를 확인해 주세요
            </h3>
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white">
              {issues.length}건 감지
            </span>
          </div>
          <p className="text-xs leading-relaxed text-rose-800">
            임상실습 보고서에는 환자의 실명, 주민등록번호, 전화번호, 병원등록번호를 절대 포함하면 안 됩니다.
            아래 항목을 삭제하거나 <strong className="font-semibold">김OO(M/72)</strong> 형태로 바꾼 뒤 전송하는 것을 권장합니다.
          </p>
          <ul className="space-y-1.5 pt-1">
            {issues.map((issue, idx) => (
              <li
                key={`${issue.type}-${idx}`}
                className="flex flex-col gap-0.5 rounded-lg border border-rose-200 bg-white/80 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-rose-700">[{issue.type}]</span>
                  <code className="rounded bg-rose-100 px-1.5 py-0.5 font-mono text-rose-900">
                    {issue.matchedText}
                  </code>
                </div>
                <span className="text-rose-700">{issue.guidance}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
