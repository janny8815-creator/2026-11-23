/**
 * 탭 1: 실습일지 도우미 입력 폼
 * - 기본 정보(날짜/병동/시간), 관찰 내용, 수행 내용, 자기주도학습, 성찰 및 느낀 점을 입력합니다.
 * - [예시 데이터 채우기], [초기화], [AI 정밀 피드백 분석하기] 버튼을 제공합니다.
 */

import React from 'react';
import { Sparkles, RotateCcw, FileSpreadsheet, Loader2 } from 'lucide-react';
import { PracticeLogData } from '../types/nursing';
import { PRACTICE_LOG_GUIDES } from '../data/nursingGuides';
import { HelpTooltip } from './HelpTooltip';

interface PracticeLogFormProps {
  data: PracticeLogData;
  onChange: (next: PracticeLogData) => void;
  onFillSample: () => void;
  onReset: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const PracticeLogForm: React.FC<PracticeLogFormProps> = ({
  data,
  onChange,
  onFillSample,
  onReset,
  onAnalyze,
  isLoading,
}) => {
  const updateField = (field: keyof PracticeLogData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const hasAnyContent = Object.values(data).some((v) => v.trim().length > 0);

  return (
    <div className="space-y-5">
      {/* 상단 빠른 도구 바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800">실습일지 초안 작성</h2>
          <p className="text-xs text-slate-500">
            각 항목 옆 <span className="font-semibold text-teal-700">?</span> 아이콘을 눌러 1학년 작성 가이드를 확인하세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onFillSample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 transition hover:bg-teal-100"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            예시 데이터 채우기
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화
          </button>
        </div>
      </div>

      {/* 1. 기본 정보 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>실습 날짜</span>
            <HelpTooltip guide={PRACTICE_LOG_GUIDES.practiceDate} />
          </label>
          <input
            type="date"
            value={data.practiceDate}
            onChange={(e) => updateField('practiceDate', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>실습 병동</span>
            <HelpTooltip guide={PRACTICE_LOG_GUIDES.ward} />
          </label>
          <input
            type="text"
            value={data.ward}
            onChange={(e) => updateField('ward', e.target.value)}
            placeholder="예: 호흡기내과 71병동"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>실습 시간</span>
            <HelpTooltip guide={PRACTICE_LOG_GUIDES.practiceHours} />
          </label>
          <input
            type="text"
            value={data.practiceHours}
            onChange={(e) => updateField('practiceHours', e.target.value)}
            placeholder="예: Day (07:00 ~ 15:00)"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* 2. 관찰 내용 */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>관찰 내용 (간호사의 처치 및 병동 상황)</span>
          <HelpTooltip guide={PRACTICE_LOG_GUIDES.observation} />
        </label>
        <textarea
          rows={4}
          value={data.observation}
          onChange={(e) => updateField('observation', e.target.value)}
          placeholder="간호사 선생님의 처치, 환자 상태 변화, 병동 라운딩 상황 등을 객관적 수치와 함께 기록해 보세요. (환자 실명은 김OO 형태로 비식별화)"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* 3. 수행 내용 */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>수행 내용 (학생 간호사가 직접 수행한 활동)</span>
          <HelpTooltip guide={PRACTICE_LOG_GUIDES.performance} />
        </label>
        <textarea
          rows={4}
          value={data.performance}
          onChange={(e) => updateField('performance', e.target.value)}
          placeholder="활력징후 측정, BST 측정, 침상 정리 등 직접 수행한 간호 활동과 구체적인 측정값·주의점을 작성해 보세요."
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* 4. 자기주도학습 */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>자기주도학습 (새로 찾은 질환·검사·의학 용어)</span>
          <HelpTooltip guide={PRACTICE_LOG_GUIDES.selfDirectedLearning} />
        </label>
        <textarea
          rows={3}
          value={data.selfDirectedLearning}
          onChange={(e) => updateField('selfDirectedLearning', e.target.value)}
          placeholder="실습 중 처음 들은 의학 약어, 질환, 검사, 약물에 대해 스스로 찾아 정리한 내용을 적어보세요."
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* 5. 성찰 및 느낀 점 */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>성찰 및 느낀 점</span>
          <HelpTooltip guide={PRACTICE_LOG_GUIDES.reflection} />
        </label>
        <textarea
          rows={4}
          value={data.reflection}
          onChange={(e) => updateField('reflection', e.target.value)}
          placeholder="[경험한 상황 → 배운 간호 원리 → 다음 실습 적용 계획] 순서로 성찰을 작성해 보세요."
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* 분석 실행 버튼 */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || !hasAnyContent}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI가 실습일지를 정밀 분석하고 있습니다...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              실습일지 AI 정밀 피드백 & 추가 제안 받기
            </>
          )}
        </button>
        {!hasAnyContent && (
          <p className="mt-2 text-center text-xs text-slate-500">
            내용을 입력하거나 상단의 <strong>[예시 데이터 채우기]</strong>를 눌러 바로 테스트해 보세요.
          </p>
        )}
      </div>
    </div>
  );
};
