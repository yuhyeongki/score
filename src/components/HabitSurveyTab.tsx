import React from 'react';
import { HabitQuestion } from '../types';
import { CheckCircle2, AlertTriangle, ShieldCheck, Zap, Brain, Sparkles } from 'lucide-react';

interface HabitSurveyTabProps {
  questions: HabitQuestion[];
  onUpdateQuestionScore: (id: number, score: number) => void;
  onRunAiCounseling: () => void;
  isAiLoading: boolean;
}

export const HabitSurveyTab: React.FC<HabitSurveyTabProps> = ({
  questions,
  onUpdateQuestionScore,
  onRunAiCounseling,
  isAiLoading,
}) => {
  // Aggregate category scores
  const categoryMap: Record<string, { total: number; count: number }> = {};
  questions.forEach((q) => {
    if (!categoryMap[q.category]) {
      categoryMap[q.category] = { total: 0, count: 0 };
    }
    categoryMap[q.category].total += q.score;
    categoryMap[q.category].count += 1;
  });

  const categories = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    avg: Number((categoryMap[cat].total / categoryMap[cat].count).toFixed(1)),
  }));

  const totalPoints = questions.reduce((sum, q) => sum + q.score, 0);
  const maxPoints = questions.length * 5;
  const percentage = Math.round((totalPoints / maxPoints) * 100);

  // Weakest category
  const weakest = [...categories].sort((a, b) => a.avg - b.avg)[0];
  const strongest = [...categories].sort((a, b) => b.avg - a.avg)[0];

  // Radar chart math (6 categories)
  const radarRadius = 85;
  const centerX = 140;
  const centerY = 120;
  const angleStep = (Math.PI * 2) / (categories.length || 6);

  const radarPoints = categories
    .map((cat, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (cat.avg / 5) * radarRadius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Diagnosis Summary & Radar Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left summary */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                <Brain className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                학습 습관 및 자기주도성 다면 진단
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              성적 향상의 80%는 올바른 학습 습관에서 결정됩니다. 집중력, 자기통제, 복습 루틴 등 6개 핵심 지표를 점검하고 취약 습관을 정밀 교정합니다.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-xs text-slate-500 font-medium">종합 습관 지수</span>
                <div className="text-xl font-bold text-indigo-700 mt-0.5 tabular-nums">
                  {percentage}점 <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-xs text-slate-500 font-medium">최우수 습관 강점</span>
                <div className="text-sm font-bold text-emerald-700 mt-1 truncate">
                  {strongest ? `${strongest.name} (${strongest.avg}점)` : '-'}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-xs text-slate-500 font-medium">최우선 개선 과제</span>
                <div className="text-sm font-bold text-rose-600 mt-1 truncate">
                  {weakest ? `${weakest.name} (${weakest.avg}점)` : '-'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onRunAiCounseling}
                disabled={isAiLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>습관 진단 결과 반영 AI 코칭 실행</span>
              </button>
            </div>
          </div>

          {/* Right: SVG Radar Chart */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-2 bg-slate-50/50 rounded-lg border border-slate-100">
            <svg className="w-72 h-64" viewBox="0 0 280 240">
              {/* Concentric Reference Rings */}
              {[1, 2, 3, 4, 5].map((lvl) => {
                const r = (lvl / 5) * radarRadius;
                return (
                  <circle
                    key={lvl}
                    cx={centerX}
                    cy={centerY}
                    r={r}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={lvl === 5 ? '1.5' : '1'}
                    strokeDasharray={lvl < 5 ? '2 2' : 'none'}
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {categories.map((cat, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const x = centerX + radarRadius * Math.cos(angle);
                const y = centerY + radarRadius * Math.sin(angle);
                const labelX = centerX + (radarRadius + 20) * Math.cos(angle);
                const labelY = centerY + (radarRadius + 15) * Math.sin(angle);

                return (
                  <g key={cat.name}>
                    <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1" />
                    <text
                      x={labelX}
                      y={labelY + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#334155"
                    >
                      {cat.name}
                    </text>
                  </g>
                );
              })}

              {/* Student Radar Polygon */}
              <polygon
                points={radarPoints}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="#4f46e5"
                strokeWidth="2"
              />

              {/* Data Node Markers */}
              {categories.map((cat, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = (cat.avg / 5) * radarRadius;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                return (
                  <circle
                    key={cat.name}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#4f46e5"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
            <span className="text-[11px] text-slate-400 font-medium -mt-2">
              ※ 중심 0점(매우 취약) ~ 바깥 5점(매우 우수)
            </span>
          </div>

        </div>
      </div>

      {/* Section 2: 10 Diagnostic Questions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
          학습 습관 자가진단 설문 (10개 문항)
        </h3>

        <div className="divide-y divide-slate-100">
          {questions.map((q, idx) => (
            <div key={q.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">[{q.category}]</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 font-medium">
                  {q.text}
                </p>
              </div>

              {/* 1 to 5 Radio Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-200">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = q.score === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onUpdateQuestionScore(q.id, val)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs scale-105'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                      title={`${val}점`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
