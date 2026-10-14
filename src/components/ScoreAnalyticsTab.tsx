import React, { useState } from 'react';
import { SubjectData } from '../types';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Clock, BarChart3, TrendingUp, HelpCircle } from 'lucide-react';

interface ScoreAnalyticsTabProps {
  subjects: SubjectData[];
  onUpdateSubject: (subjectId: string, updatedFields: Partial<SubjectData>) => void;
  onAddSubject: (newSubject: SubjectData) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const ScoreAnalyticsTab: React.FC<ScoreAnalyticsTabProps> = ({
  subjects,
  onUpdateSubject,
  onAddSubject,
  onDeleteSubject,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubPrev, setNewSubPrev] = useState(75);
  const [newSubMid, setNewSubMid] = useState(78);
  const [newSubFinal, setNewSubFinal] = useState(80);
  const [newSubRank, setNewSubRank] = useState(3);
  const [newSubHours, setNewSubHours] = useState(6);
  const [newSubTarget, setNewSubTarget] = useState(85);
  const [selectedChartMode, setSelectedChartMode] = useState<'comparison' | 'matrix' | 'trend'>('comparison');

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const newSubject: SubjectData = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      prevScore: Number(newSubPrev),
      currentMidterm: Number(newSubMid),
      currentFinal: Number(newSubFinal),
      gradeRank: Number(newSubRank),
      weeklyStudyHours: Number(newSubHours),
      targetScore: Number(newSubTarget),
      category: '기타',
    };
    onAddSubject(newSubject);
    setNewSubName('');
    setShowAddForm(false);
  };

  // Calculations
  const totalHours = subjects.reduce((sum, s) => sum + s.weeklyStudyHours, 0);
  const avgFinal = Math.round(
    subjects.reduce((sum, s) => sum + s.currentFinal, 0) / (subjects.length || 1)
  );

  return (
    <div className="space-y-6">
      
      {/* Section 1: Subject Score & Hours Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>과목별 성적 및 주당 학습 시간 관리</span>
              <span className="text-xs font-normal text-slate-400">
                (수치를 클릭하여 직접 수정할 수 있습니다)
              </span>
            </h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 과목 추가</span>
          </button>
        </div>

        {/* Add Subject Collapsible Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateSubject}
            className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs"
          >
            <div>
              <label className="block text-slate-600 mb-1 font-medium">과목명</label>
              <input
                type="text"
                placeholder="예: 사회문화"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">지난학기(점)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newSubPrev}
                onChange={(e) => setNewSubPrev(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">중간고사(점)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newSubMid}
                onChange={(e) => setNewSubMid(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">기말고사(점)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newSubFinal}
                onChange={(e) => setNewSubFinal(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">내신 등급</label>
              <input
                type="number"
                min="1"
                max="9"
                value={newSubRank}
                onChange={(e) => setNewSubRank(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">주당 공부(시간)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={newSubHours}
                onChange={(e) => setNewSubHours(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-indigo-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-slate-600 mb-1 font-medium">목표(점)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newSubTarget}
                  onChange={(e) => setNewSubTarget(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 transition-colors shrink-0"
              >
                추가
              </button>
            </div>
          </form>
        )}

        {/* Subjects Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold">
                <th className="py-2.5 px-3">과목명</th>
                <th className="py-2.5 px-3 text-right">전학기 점수</th>
                <th className="py-2.5 px-3 text-right">이번 중간</th>
                <th className="py-2.5 px-3 text-right">이번 기말</th>
                <th className="py-2.5 px-3 text-center">내신 등급</th>
                <th className="py-2.5 px-3 text-right">주당 학습시간</th>
                <th className="py-2.5 px-3 text-right">목표 점수</th>
                <th className="py-2.5 px-3 text-center">전학기 대비</th>
                <th className="py-2.5 px-3 text-center">효율성 진단</th>
                <th className="py-2.5 px-2 text-center">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((sub) => {
                const diff = sub.currentFinal - sub.prevScore;
                const isOverworkingStagnant = sub.weeklyStudyHours >= 9 && sub.currentFinal < 80;
                const isHighYield = sub.weeklyStudyHours <= 5 && sub.currentFinal >= 85;

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {sub.name}
                    </td>
                    
                    {/* Previous Score */}
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sub.prevScore}
                        onChange={(e) => onUpdateSubject(sub.id, { prevScore: Number(e.target.value) })}
                        className="w-14 text-right bg-transparent hover:bg-slate-100 focus:bg-white border-b border-dashed border-slate-300 focus:border-indigo-500 px-1 py-0.5 rounded text-slate-700 tabular-nums"
                      />
                    </td>

                    {/* Current Midterm */}
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sub.currentMidterm}
                        onChange={(e) => onUpdateSubject(sub.id, { currentMidterm: Number(e.target.value) })}
                        className="w-14 text-right bg-transparent hover:bg-slate-100 focus:bg-white border-b border-dashed border-slate-300 focus:border-indigo-500 px-1 py-0.5 rounded text-slate-700 tabular-nums"
                      />
                    </td>

                    {/* Current Final */}
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sub.currentFinal}
                        onChange={(e) => onUpdateSubject(sub.id, { currentFinal: Number(e.target.value) })}
                        className="w-14 text-right bg-transparent hover:bg-slate-100 focus:bg-white border-b border-dashed border-slate-300 focus:border-indigo-500 px-1 py-0.5 rounded font-bold text-indigo-700 tabular-nums"
                      />
                    </td>

                    {/* Grade Rank */}
                    <td className="py-2.5 px-3 text-center">
                      <select
                        aria-label={`${sub.name} 석차 등급`}
                        value={sub.gradeRank}
                        onChange={(e) => onUpdateSubject(sub.id, { gradeRank: Number(e.target.value) })}
                        className="bg-transparent hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-800"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
                          <option key={r} value={r}>
                            {r}등급
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Weekly Study Hours */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={sub.weeklyStudyHours}
                          onChange={(e) => onUpdateSubject(sub.id, { weeklyStudyHours: Number(e.target.value) })}
                          className="w-12 text-right bg-transparent hover:bg-slate-100 focus:bg-white border-b border-dashed border-slate-300 focus:border-indigo-500 px-1 py-0.5 rounded font-medium text-slate-900 tabular-nums"
                        />
                        <span className="text-xs text-slate-400">h</span>
                      </div>
                    </td>

                    {/* Target Score */}
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={sub.targetScore}
                        onChange={(e) => onUpdateSubject(sub.id, { targetScore: Number(e.target.value) })}
                        className="w-14 text-right bg-transparent hover:bg-slate-100 focus:bg-white border-b border-dashed border-slate-300 focus:border-indigo-500 px-1 py-0.5 rounded text-emerald-700 font-semibold tabular-nums"
                      />
                    </td>

                    {/* Difference */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-0.5 font-semibold text-xs tabular-nums ${
                          diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {diff > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : diff < 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : null}
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    </td>

                    {/* Efficiency diagnosis label */}
                    <td className="py-2.5 px-3 text-center text-xs">
                      {isOverworkingStagnant ? (
                        <span className="text-amber-700 font-semibold" title="공부 시간은 많으나 점수 정체">
                          공부법 개선 시급
                        </span>
                      ) : isHighYield ? (
                        <span className="text-emerald-700 font-semibold" title="적은 시간 대비 높은 성취도">
                          고효율 효자과목
                        </span>
                      ) : sub.weeklyStudyHours < 4 && sub.currentFinal < 75 ? (
                        <span className="text-rose-700 font-medium" title="절대 학습 시간 부족">
                          학습량 증대 필요
                        </span>
                      ) : (
                        <span className="text-slate-500 font-normal">
                          정상 궤도
                        </span>
                      )}
                    </td>

                    {/* Delete button */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => onDeleteSubject(sub.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                        title="과목 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Data Visualizations (Segmented Control) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              데이터 시각화 및 상관관계 분석
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              과목별 성적 변화, 공부 시간 대비 성과 효율성, 학기별 변화 추이를 시각화합니다.
            </p>
          </div>

          {/* Segmented Control Buttons */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setSelectedChartMode('comparison')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedChartMode === 'comparison'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              과목별 성적 비교
            </button>
            <button
              onClick={() => setSelectedChartMode('matrix')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedChartMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              학습시간 vs 성적 효율 매트릭스
            </button>
            <button
              onClick={() => setSelectedChartMode('trend')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedChartMode === 'trend'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              학기별 성적 추이 트렌드
            </button>
          </div>
        </div>

        {/* VIEW 1: Score Comparison Bar Chart */}
        {selectedChartMode === 'comparison' && (
          <div className="pt-6">
            <div className="flex items-center justify-end gap-5 text-xs mb-4 text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-300 rounded-xs" />
                <span>지난학기</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-indigo-600 rounded-xs" />
                <span>이번 기말 (현재)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-xs" />
                <span>목표 점수</span>
              </div>
            </div>

            <div className="space-y-4">
              {subjects.map((sub) => (
                <div key={sub.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{sub.name}</span>
                    <span className="text-slate-500 tabular-nums">
                      현재 <strong className="text-indigo-600">{sub.currentFinal}점</strong> / 목표 {sub.targetScore}점
                    </span>
                  </div>
                  <div className="h-6 bg-slate-100 rounded-md overflow-hidden relative flex flex-col justify-center">
                    {/* Prev bar */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-slate-300/80 transition-all duration-500"
                      style={{ width: `${Math.min(100, sub.prevScore)}%` }}
                      title={`전학기: ${sub.prevScore}점`}
                    />
                    {/* Current bar */}
                    <div
                      className="absolute top-1 bottom-1 left-0 bg-indigo-600 rounded-r-xs transition-all duration-500 opacity-90"
                      style={{ width: `${Math.min(100, sub.currentFinal)}%` }}
                      title={`이번 기말: ${sub.currentFinal}점`}
                    />
                    {/* Target line indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-10"
                      style={{ left: `${Math.min(100, sub.targetScore)}%` }}
                      title={`목표: ${sub.targetScore}점`}
                    >
                      <div className="w-2 h-2 bg-emerald-500 rotate-45 -ml-[3px] -mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: Study Hours vs Score Efficiency Matrix */}
        {selectedChartMode === 'matrix' && (
          <div className="pt-4">
            <div className="mb-4 text-xs text-slate-500 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>
                가로축은 <strong>주당 공부 시간</strong>, 세로축은 <strong>성적</strong>입니다. 4개 사분면을 통해 시간 투자 대비 효율을 진단합니다.
              </span>
            </div>

            {/* Matrix Container */}
            <div className="relative w-full h-80 bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-hidden">
              
              {/* Quadrant Background Zones */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-60 pointer-events-none text-[11px] font-semibold">
                {/* Top-Left: High Yield */}
                <div className="p-3 bg-emerald-50/50 border-r border-b border-dashed border-slate-200 text-emerald-800 flex items-start justify-start">
                  🌟 고효율 핵심 존 (적은 시간·고득점)
                </div>
                {/* Top-Right: Mastered */}
                <div className="p-3 bg-indigo-50/50 border-b border-dashed border-slate-200 text-indigo-800 flex items-start justify-end">
                  🏆 최우수 정복 존 (집중 투자·고득점)
                </div>
                {/* Bottom-Left: Low Input */}
                <div className="p-3 bg-slate-100/40 border-r border-dashed border-slate-200 text-slate-600 flex items-end justify-start">
                  ⚠️ 시간 증대 필요 (적은 시간·중저득점)
                </div>
                {/* Bottom-Right: Red Zone - Stagnant */}
                <div className="p-3 bg-rose-50/60 text-rose-800 flex items-end justify-end">
                  🚨 공부법 개선 시급 (많은 시간·정체)
                </div>
              </div>

              {/* Data Points */}
              <div className="relative w-full h-full">
                {subjects.map((sub) => {
                  // Max hours: 16h (scale 0~16 -> 5% ~ 95%)
                  const xPercent = Math.min(92, Math.max(8, (sub.weeklyStudyHours / 16) * 100));
                  // Score: 40~100 (scale 40~100 -> 90% ~ 10% inverted)
                  const yPercent = Math.min(90, Math.max(10, 100 - ((sub.currentFinal - 40) / 60) * 100));

                  const isCritical = sub.weeklyStudyHours >= 8 && sub.currentFinal < 78;

                  return (
                    <div
                      key={sub.id}
                      className="absolute group -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer"
                      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md transition-transform group-hover:scale-125 ${
                          isCritical ? 'bg-rose-600 ring-4 ring-rose-200' : 'bg-indigo-600'
                        }`}
                      >
                        {sub.name.slice(0, 1)}
                      </div>

                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[11px] rounded-lg p-2.5 pointer-events-none z-20 shadow-xl">
                        <div className="font-bold border-b border-slate-700 pb-1 mb-1">
                          {sub.name} ({sub.currentFinal}점)
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>주당 학습:</span>
                          <span className="font-semibold text-white">{sub.weeklyStudyHours}시간</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>목표 점수:</span>
                          <span className="font-semibold text-emerald-400">{sub.targetScore}점</span>
                        </div>
                        <div className="mt-1 text-[10px] text-indigo-300">
                          {isCritical
                            ? '⚠️ 시간 투입 대비 점수 정체! 문제풀이 위주에서 개념·오답 재구축 필요'
                            : '현재 학습 효율성 양호'}
                        </div>
                      </div>

                      <span className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-800 whitespace-nowrap bg-white/90 px-1 rounded shadow-2xs">
                        {sub.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matrix Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-2 px-1">
              <span>← 주 0시간 (투입 적음)</span>
              <span>시간 축: 주당 학습 시간</span>
              <span>주 16시간 이상 (투입 많음) →</span>
            </div>
          </div>
        )}

        {/* VIEW 3: Score Trajectory Trend Chart */}
        {selectedChartMode === 'trend' && (
          <div className="pt-4 space-y-4">
            <div className="text-xs text-slate-500">
              학기별 성적 궤적: <strong>전학기 평균 → 중간고사 → 기말고사 → 최종 목표</strong>로 이어지는 성적 변화 추이입니다.
            </div>

            <div className="overflow-x-auto">
              <svg className="w-full h-64 border border-slate-100 rounded-lg bg-slate-50/50" viewBox="0 0 600 240">
                {/* Y-Axis Grid Lines */}
                {[100, 80, 60, 40].map((val, idx) => {
                  const y = 30 + idx * 55;
                  return (
                    <g key={val}>
                      <line x1="50" y1={y} x2="560" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x="35" y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" className="tabular-nums">
                        {val}점
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Labels */}
                {[
                  { label: '전학기 성적', x: 100 },
                  { label: '이번 중간', x: 240 },
                  { label: '이번 기말 (현재)', x: 380 },
                  { label: '차기 목표', x: 520 },
                ].map((col) => (
                  <text key={col.label} x={col.x} y="225" textAnchor="middle" fontSize="11" fill="#475569" fontWeight="600">
                    {col.label}
                  </text>
                ))}

                {/* Subject Trend Lines */}
                {subjects.map((sub, sIdx) => {
                  const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626'];
                  const color = colors[sIdx % colors.length];

                  const getY = (score: number) => {
                    // 40 -> 195, 100 -> 30
                    return 195 - ((score - 40) / 60) * 165;
                  };

                  const p1 = { x: 100, y: getY(sub.prevScore) };
                  const p2 = { x: 240, y: getY(sub.currentMidterm) };
                  const p3 = { x: 380, y: getY(sub.currentFinal) };
                  const p4 = { x: 520, y: getY(sub.targetScore) };

                  return (
                    <g key={sub.id}>
                      {/* Past to Present Solid Line */}
                      <path
                        d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                      />
                      {/* Present to Target Dashed Line */}
                      <path
                        d={`M ${p3.x} ${p3.y} L ${p4.x} ${p4.y}`}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      {/* Dots */}
                      <circle cx={p1.x} cy={p1.y} r="4" fill={color} />
                      <circle cx={p2.x} cy={p2.y} r="4" fill={color} />
                      <circle cx={p3.x} cy={p3.y} r="5" fill={color} stroke="#ffffff" strokeWidth="2" />
                      <circle cx={p4.x} cy={p4.y} r="4" fill="#ffffff" stroke={color} strokeWidth="2" />

                      {/* Label on final node */}
                      <text x={p3.x + 8} y={p3.y - 6} fontSize="10" fill={color} fontWeight="bold">
                        {sub.name} ({sub.currentFinal}점)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
