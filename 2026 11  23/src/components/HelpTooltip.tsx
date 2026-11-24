/**
 * 1학년 맞춤 개념 도움말 버튼 (?)
 * - 입력 항목 제목 옆에 배치되어 호버(PC) 또는 클릭(모바일/PC) 시 쉬운 설명을 띄웁니다.
 */

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Lightbulb, X } from 'lucide-react';
import { FieldGuide } from '../types/nursing';

interface HelpTooltipProps {
  guide: FieldGuide;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ guide }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`${guide.title} 작성 도움말`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-teal-600 transition hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute left-0 top-7 z-30 w-72 rounded-xl border border-teal-200 bg-white p-3.5 text-left shadow-xl sm:w-80"
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-teal-800">{guide.title} 가이드</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="도움말 닫기"
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-slate-700">{guide.summary}</p>
          <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-teal-50/80 p-2 text-xs leading-relaxed text-teal-900">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />
            <span>{guide.tip}</span>
          </div>
        </div>
      )}
    </div>
  );
};
