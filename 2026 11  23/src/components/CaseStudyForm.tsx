/**
 * 탭 2: 사례보고서(Case Study) 도우미 입력 폼
 * - 문헌고찰, 간호사정(S/O 분리), 진단검사·약물, 간호진단, 목표·중재·이론적 근거, 평가·참고문헌을 입력합니다.
 */

import React from 'react';
import { Sparkles, RotateCcw, FileSpreadsheet, Loader2 } from 'lucide-react';
import { CaseStudyData } from '../types/nursing';
import { CASE_STUDY_GUIDES } from '../data/nursingGuides';
import { HelpTooltip } from './HelpTooltip';

interface CaseStudyFormProps {
  data: CaseStudyData;
  onChange: (next: CaseStudyData) => void;
  onFillSample: () => void;
  onReset: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const CaseStudyForm: React.FC<CaseStudyFormProps> = ({
  data,
  onChange,
  onFillSample,
  onReset,
  onAnalyze,
  isLoading,
}) => {
  const updateField = (field: keyof CaseStudyData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const hasAnyContent = Object.values(data).some((v) => v.trim().length > 0);

  return (
    <div className="space-y-5">
      {/* 상단 빠른 도구 바 */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800">사례보고서(Case Study) 초안 작성</h2>
          <p className="text-xs text-slate-500">
            S/O 구분, NANDA-I 간호진단, SMART 목표까지 1학년 눈높이로 꼼꼼히 점검해 드립니다.
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

      {/* 1. 기본 정보 및 문헌고찰 요약 */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>1. 기본 정보 및 문헌고찰 요약 (진단명, 교과서 핵심 증상·치료)</span>
          <HelpTooltip guide={CASE_STUDY_GUIDES.patientSummaryAndLiterature} />
        </label>
        <textarea
          rows={3}
          value={data.patientSummaryAndLiterature}
          onChange={(e) => updateField('patientSummaryAndLiterature', e.target.value)}
          placeholder="대상자 연령/성별, 주진단명, 교과서상 병태생리·증상·치료 요약 및 실제 환자와의 비교 내용을 적어보세요."
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* 2. 간호사정 - S / O 분리 입력창 */}
      <div className="rounded-xl border border-teal-100 bg-teal-50/30 p-3.5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-teal-800">
          2. 간호사정 (주관적 자료 S / 객관적 자료 O 분리 작성)
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-sky-100 text-xs font-extrabold text-sky-700">
                S
              </span>
              <span>주관적 자료 (Subjective)</span>
              <HelpTooltip guide={CASE_STUDY_GUIDES.subjectiveData} />
            </label>
            <textarea
              rows={4}
              value={data.subjectiveData}
              onChange={(e) => updateField('subjectiveData', e.target.value)}
              placeholder='환자 본인이 직접 말한 증상을 따옴표(" ")로 적어보세요. 예: "숨이 차고 가슴이 답답해요."'
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-teal-100 text-xs font-extrabold text-teal-700">
                O
              </span>
              <span>객관적 자료 (Objective)</span>
              <HelpTooltip guide={CASE_STUDY_GUIDES.objectiveData} />
            </label>
            <textarea
              rows={4}
              value={data.objectiveData}
              onChange={(e) => updateField('objectiveData', e.target.value)}
              placeholder="활력징후(BP, PR, RR, BT, SpO2), 신체검진, 청진 소견, 관찰된 모습, 보호자 진술 등을 적어보세요."
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>
      </div>

      {/* 3. 진단검사 결과 및 투여 약물 */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>3. 진단검사 결과 및 투여 약물</span>
          <HelpTooltip guide={CASE_STUDY_GUIDES.labsAndMedications} />
        </label>
        <textarea
          rows={3}
          value={data.labsAndMedications}
          onChange={(e) => updateField('labsAndMedications', e.target.value)}
          placeholder="혈액검사(WBC, Hb, CRP 등) 수치와 정상 범위 비교, 영상검사 소견, 투여 약물(약명·용량·경로·작용·부작용)을 적어보세요."
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* 4. 간호진단 (우선순위 포함) */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>4. 간호진단 (우선순위 포함)</span>
          <HelpTooltip guide={CASE_STUDY_GUIDES.nursingDiagnosis} />
        </label>
        <textarea
          rows={3}
          value={data.nursingDiagnosis}
          onChange={(e) => updateField('nursingDiagnosis', e.target.value)}
          placeholder="예: 1순위: 기관지 분비물 축적과 관련된 비효과적 기도청결 (NANDA-I 형식)"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* 5. 단기·장기 목표 및 간호중재와 이론적 근거 */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>5. 단기·장기 목표 및 간호중재(진단적/치료적/교육적)와 이론적 근거</span>
          <HelpTooltip guide={CASE_STUDY_GUIDES.goalsAndInterventions} />
        </label>
        <textarea
          rows={5}
          value={data.goalsAndInterventions}
          onChange={(e) => updateField('goalsAndInterventions', e.target.value)}
          placeholder="SMART 원칙에 맞는 단기·장기 목표와 진단적/치료적/교육적 중재, 각 중재의 이론적 근거를 작성해 보세요."
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* 6. 평가 및 참고문헌 */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <span>6. 평가 및 참고문헌</span>
          <HelpTooltip guide={CASE_STUDY_GUIDES.evaluationAndReferences} />
        </label>
        <textarea
          rows={3}
          value={data.evaluationAndReferences}
          onChange={(e) => updateField('evaluationAndReferences', e.target.value)}
          placeholder="목표 달성 여부(달성/부분달성/미달성)와 객관적 근거, 참고한 전공 교과서 및 공식 자료(약학정보원 등)를 적어보세요."
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
              AI가 사례보고서를 정밀 분석하고 있습니다...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              사례보고서 AI 정밀 피드백 & 추가 제안 받기
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
