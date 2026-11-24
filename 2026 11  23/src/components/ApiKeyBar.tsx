/**
 * 상단 보안 API 키 설정 바 (BYOK: Bring Your Own Key)
 * - 사용자가 본인의 Gemini API 키를 입력·저장·삭제할 수 있습니다.
 * - 키는 브라우저 localStorage에만 저장되며 코드에 하드코딩되지 않습니다.
 */

import React, { useState, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle2, Trash2, ShieldCheck, ExternalLink } from 'lucide-react';

interface ApiKeyBarProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onDeleteApiKey: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const ApiKeyBar: React.FC<ApiKeyBarProps> = ({
  apiKey,
  onSaveApiKey,
  onDeleteApiKey,
  inputRef,
}) => {
  const [draftKey, setDraftKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setDraftKey(apiKey);
  }, [apiKey]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftKey.trim();
    if (!trimmed) return;
    onSaveApiKey(trimmed);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2000);
  };

  const handleDelete = () => {
    setDraftKey('');
    onDeleteApiKey();
  };

  const isSaved = Boolean(apiKey.trim());

  return (
    <div className="no-print border-b border-teal-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 font-semibold text-teal-700 ring-1 ring-teal-200/80">
            <ShieldCheck className="h-3.5 w-3.5" />
            보안 BYOK 모드
          </span>
          <span>
            API 키는 <strong className="font-semibold text-slate-700">내 브라우저(localStorage)</strong>에만 저장됩니다.
          </span>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-teal-600 underline decoration-teal-300 underline-offset-2 hover:text-teal-700"
          >
            키 발급받기
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:min-w-[280px] sm:flex-initial">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type={showKey ? 'text' : 'password'}
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="Gemini API 키를 입력하세요 (AIza...)"
              autoComplete="off"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-1.5 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              aria-label={showKey ? 'API 키 숨기기' : 'API 키 보기'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!draftKey.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            {justSaved ? '저장됨!' : '저장'}
          </button>

          {isSaved && (
            <button
              type="button"
              onClick={handleDelete}
              title="저장된 API 키 삭제"
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">삭제</span>
            </button>
          )}

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isSaved
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
            }`}
          >
            {isSaved ? '연결 준비됨' : '미설정'}
          </span>
        </form>
      </div>
    </div>
  );
};
