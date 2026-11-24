/**
 * 간호실습 메이트 메인 애플리케이션 (App.tsx)
 * - 상단 보안 API 키 바, 탭 전환(실습일지 / 사례보고서), localStorage 자동 저장,
 *   실시간 개인정보 경고, API 키 미입력 모달, 좌측 입력 / 우측 AI 결과 레이아웃을 통합 관리합니다.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Stethoscope,
  ClipboardList,
  FileText,
  KeyRound,
  X,
  Save,
} from 'lucide-react';
import {
  ActiveTab,
  AnalysisResponse,
  CaseStudyData,
  PracticeLogData,
} from './types/nursing';
import {
  INITIAL_CASE_STUDY,
  INITIAL_PRACTICE_LOG,
  SAMPLE_CASE_STUDY,
  SAMPLE_PRACTICE_LOG,
} from './data/nursingGuides';
import { analyzeNursingDraft } from './services/geminiService';
import { ApiKeyBar } from './components/ApiKeyBar';
import {
  PrivacyWarningBanner,
  detectPrivacyIssues,
} from './components/PrivacyWarningBanner';
import { PracticeLogForm } from './components/PracticeLogForm';
import { CaseStudyForm } from './components/CaseStudyForm';
import { FeedbackPanel } from './components/FeedbackPanel';

const STORAGE_KEYS = {
  API_KEY: 'nursing_mate_gemini_api_key',
  PRACTICE_LOG: 'nursing_mate_practice_log_draft',
  CASE_STUDY: 'nursing_mate_case_study_draft',
};

/** localStorage 안전 읽기 유틸 */
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('practice-log');
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEYS.API_KEY) ?? '';
    } catch {
      return '';
    }
  });

  const [practiceLog, setPracticeLog] = useState<PracticeLogData>(() =>
    loadFromStorage(STORAGE_KEYS.PRACTICE_LOG, INITIAL_PRACTICE_LOG),
  );
  const [caseStudy, setCaseStudy] = useState<CaseStudyData>(() =>
    loadFromStorage(STORAGE_KEYS.CASE_STUDY, INITIAL_CASE_STUDY),
  );

  // 탭별 분석 결과와 로딩/오류 상태 관리
  const [resultsByTab, setResultsByTab] = useState<
    Record<ActiveTab, AnalysisResponse | null>
  >({
    'practice-log': null,
    'case-study': null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const apiKeyInputRef = useRef<HTMLInputElement>(null);

  // 초안 자동 저장 (실습일지)
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.PRACTICE_LOG,
        JSON.stringify(practiceLog),
      );
    } catch {
      // 스토리지 용량 제한 등 무시
    }
  }, [practiceLog]);

  // 초안 자동 저장 (사례보고서)
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.CASE_STUDY,
        JSON.stringify(caseStudy),
      );
    } catch {
      // 스토리지 용량 제한 등 무시
    }
  }, [caseStudy]);

  // 현재 탭의 모든 입력 텍스트에서 개인정보 의심 패턴 실시간 감지
  const privacyIssues = useMemo(() => {
    const combinedText =
      activeTab === 'practice-log'
        ? Object.values(practiceLog).join('\n')
        : Object.values(caseStudy).join('\n');
    return detectPrivacyIssues(combinedText);
  }, [activeTab, practiceLog, caseStudy]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      window.localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    } catch {
      // 무시
    }
    setErrorMessage(null);
  };

  const handleDeleteApiKey = () => {
    setApiKey('');
    try {
      window.localStorage.removeItem(STORAGE_KEYS.API_KEY);
    } catch {
      // 무시
    }
  };

  const handleTabChange = (nextTab: ActiveTab) => {
    setActiveTab(nextTab);
    setErrorMessage(null);
  };

  const handleFillSample = () => {
    setErrorMessage(null);
    if (activeTab === 'practice-log') {
      setPracticeLog({ ...SAMPLE_PRACTICE_LOG });
    } else {
      setCaseStudy({ ...SAMPLE_CASE_STUDY });
    }
  };

  const handleReset = () => {
    setErrorMessage(null);
    if (activeTab === 'practice-log') {
      setPracticeLog({ ...INITIAL_PRACTICE_LOG });
      setResultsByTab((prev) => ({ ...prev, 'practice-log': null }));
    } else {
      setCaseStudy({ ...INITIAL_CASE_STUDY });
      setResultsByTab((prev) => ({ ...prev, 'case-study': null }));
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey.trim()) {
      setShowApiKeyModal(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload = activeTab === 'practice-log' ? practiceLog : caseStudy;
      const analysis = await analyzeNursingDraft(apiKey, activeTab, payload);
      setResultsByTab((prev) => ({
        ...prev,
        [activeTab]: analysis,
      }));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const focusApiKeyInput = () => {
    setShowApiKeyModal(false);
    window.setTimeout(() => {
      apiKeyInputRef.current?.focus();
      apiKeyInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const currentResult = resultsByTab[activeTab];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 상단 보안 API 키 설정 바 */}
      <ApiKeyBar
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        onDeleteApiKey={handleDeleteApiKey}
        inputRef={apiKeyInputRef}
      />

      {/* 메인 헤더 */}
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-md shadow-teal-500/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                  간호실습 메이트
                </h1>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 ring-1 ring-teal-200">
                  1학년 실습 대비 AI 도우미
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                실습일지·사례보고서 초안을 입력하면 부족한 부분을 교정하고 필요한 항목을 먼저 제안해 드립니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Save className="h-3.5 w-3.5 text-teal-600" />
            <span>작성 중인 초안은 브라우저에 자동 저장됩니다</span>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* 2개 메인 작성 탭 */}
        <div className="no-print mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:inline-flex">
          <button
            type="button"
            onClick={() => handleTabChange('practice-log')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition sm:flex-initial ${
              activeTab === 'practice-log'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            실습일지 도우미
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('case-study')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition sm:flex-initial ${
              activeTab === 'case-study'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            사례보고서(Case Study) 도우미
          </button>
        </div>

        {/* 실시간 개인정보 사전 경고 배너 */}
        {privacyIssues.length > 0 && (
          <div className="mb-5">
            <PrivacyWarningBanner issues={privacyIssues} />
          </div>
        )}

        {/* 좌측 입력 / 우측 결과 2컬럼 반응형 레이아웃 */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* 좌측 입력 패널 */}
          <section className="no-print rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6">
            {activeTab === 'practice-log' ? (
              <PracticeLogForm
                data={practiceLog}
                onChange={setPracticeLog}
                onFillSample={handleFillSample}
                onReset={handleReset}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
              />
            ) : (
              <CaseStudyForm
                data={caseStudy}
                onChange={setCaseStudy}
                onFillSample={handleFillSample}
                onReset={handleReset}
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
              />
            )}
          </section>

          {/* 우측 AI 피드백 결과 패널 */}
          <section className="lg:sticky lg:top-6 lg:col-span-6">
            <FeedbackPanel
              result={currentResult}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />
          </section>
        </div>
      </main>

      {/* API 키 미입력 시 안내 모달 */}
      {showApiKeyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Gemini API 키를 먼저 입력해 주세요
                  </h2>
                  <p className="text-xs text-slate-500">
                    무료로 발급받은 개인 키로 안전하게 분석합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                aria-label="모달 닫기"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-600">
              <p>
                1.{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-teal-700 underline"
                >
                  Google AI Studio
                </a>
                에서 본인의 Gemini API 키를 발급받으세요.
              </p>
              <p>2. 화면 맨 위 설정 바에 키를 붙여넣고 <strong>[저장]</strong>을 누르세요.</p>
              <p>3. 키는 내 브라우저(localStorage)에만 저장되며 외부 서버에 보관되지 않습니다.</p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={focusApiKeyInput}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                상단 입력창으로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
