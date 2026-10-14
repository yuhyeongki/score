import React from 'react';
import { StudentProfile, WeeklyScheduleSlot } from '../types';
import { Sparkles, Calendar, CheckSquare, Square, Target, BookOpen, Clock, AlertCircle, Award } from 'lucide-react';

interface AiCounselingTabProps {
  student: StudentProfile;
  onRunAiCounseling: () => void;
  isAiLoading: boolean;
  onToggleScheduleSlot: (slotId: string) => void;
  onToggleRoutine: (routineText: string) => void;
}

export const AiCounselingTab: React.FC<AiCounselingTabProps> = ({
  student,
  onRunAiCounseling,
  isAiLoading,
  onToggleScheduleSlot,
  onToggleRoutine,
}) => {
  const analysis = student.counselingAnalysis;

  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          아직 AI 성적 상담 리포트가 생성되지 않았습니다
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          학생의 과목별 성적, 주당 공부 시간, 학습 습관 진단 데이터를 분석하여 최적의 성적 향상 전략과 주간 계획표를 자동으로 도출합니다.
        </p>
        <button
          onClick={onRunAiCounseling}
          disabled={isAiLoading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-xs disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
          <span>{isAiLoading ? 'AI 분석 중...' : 'AI 맞춤 상담 & 주간 시간표 자동 생성'}</span>
        </button>
      </div>
    );
  }

  // Calculate schedule completion rate
  const totalSlots = analysis.weeklyPlan.length;
  const completedSlots = analysis.weeklyPlan.filter((s) => s.isCompleted).length;
  const completionRate = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* 1. Overall AI Consultation Briefing */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                AI 전문 성적 향상 컨설팅 종합 브리핑
              </h2>
              <span className="text-xs text-slate-400">
                진단 생성일시: {analysis.generatedAt || '최신 분석'}
              </span>
            </div>
          </div>

          <button
            onClick={onRunAiCounseling}
            disabled={isAiLoading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? '재분석 중...' : '전략 재분석'}</span>
          </button>
        </div>

        {/* Diagnosis text */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            {analysis.overallSummary}
          </p>
        </div>

        {/* Strengths and Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg">
            <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>핵심 강점 및 유지할 동력</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {analysis.strengths.map((st, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{st}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-lg">
            <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>성적 반등을 위해 반드시 교정할 약점</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {analysis.weaknesses.map((wk, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold">!</span>
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Study Habit Advice */}
        {analysis.studyHabitAdvice && (
          <div className="mt-4 p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold">💡 습관 처방 요약: </strong>
            <span>{analysis.studyHabitAdvice}</span>
          </div>
        )}
      </div>

      {/* 2. Subject-by-Subject Tailored Strategies */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              과목별 학습 시간 분석 및 맞춤형 공부 전략
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              공부 시간 투입 대비 성적 효율성을 분석하고 목표 달성을 위한 구체적인 공부법을 제시합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {analysis.subjectStrategies.map((strat, idx) => {
            const currentSub = student.subjects.find((s) => s.name.includes(strat.subject) || strat.subject.includes(s.name));
            const currentHours = currentSub ? currentSub.weeklyStudyHours : 0;
            const currentScore = currentSub ? currentSub.currentFinal : 0;

            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 hover:bg-white hover:border-indigo-300 transition-all space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-sm font-bold text-slate-900">
                    {strat.subject}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">
                      현재 <strong className="text-slate-800">{currentScore}점</strong> (주 {currentHours}h)
                    </span>
                    <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                      권장: 주 {strat.recommendedWeeklyHours}h
                    </span>
                  </div>
                </div>

                {/* Efficiency Diagnosis */}
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-800">📊 시간 대비 효율 진단: </span>
                  <span>{strat.diagnosis}</span>
                </div>

                {/* Action Plan */}
                <div className="text-xs text-slate-800 bg-white p-2.5 rounded-md border border-slate-200/60">
                  <span className="font-bold text-indigo-700">🎯 성적 향상 실천 공부법: </span>
                  <span>{strat.actionPlan}</span>
                </div>

                {/* Focus Topic */}
                <div className="text-[11px] text-emerald-800 font-medium">
                  <strong>집중 공략 영역: </strong>
                  <span>{strat.focusTopic}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Automated Weekly Schedule Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>성적 향상 맞춤형 주간 시간표 매트릭스</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              취약 과목을 우선 배분한 주간 타임테이블입니다. 실천한 항목은 체크하여 달성률을 기록하세요.
            </p>
          </div>

          {/* Completion Rate Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-500">
              실천 달성도: <strong className="text-indigo-600 tabular-nums">{completionRate}%</strong> ({completedSlots}/{totalSlots})
            </span>
            <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mt-5">
          {['월', '화', '수', '목', '금', '토', '일'].map((day) => {
            const daySlots = analysis.weeklyPlan.filter((s) => s.day === day);

            return (
              <div
                key={day}
                className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 flex flex-col space-y-2.5"
              >
                {/* Day Header */}
                <div className="text-center font-bold text-xs text-slate-800 pb-1.5 border-b border-slate-200/60">
                  {day}요일
                </div>

                {/* Day Slots */}
                {daySlots.length === 0 ? (
                  <div className="text-[11px] text-slate-400 text-center py-6">
                    자율 복습 및 휴식
                  </div>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => onToggleScheduleSlot(slot.id)}
                      className={`p-2 rounded-md border text-xs cursor-pointer transition-all ${
                        slot.isCompleted
                          ? 'bg-emerald-50/80 border-emerald-200 text-slate-500 line-through'
                          : 'bg-white border-slate-200 hover:border-indigo-400 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-indigo-700 text-[11px]">
                          {slot.subject}
                        </span>
                        <div className="text-slate-400">
                          {slot.isCompleted ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{slot.timeSlot} ({slot.durationMin}분)</span>
                      </div>
                      <p className="text-[11px] leading-tight text-slate-700">
                        {slot.task}
                      </p>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Daily 3 Actionable Routines Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-indigo-600" />
          <span>매일 실천할 일일 3대 핵심 루틴</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          습관이 성적을 바꿉니다. 오늘 실천한 핵심 루틴을 클릭하여 체크하세요.
        </p>

        <div className="space-y-2.5">
          {analysis.dailyRoutines.map((routine, idx) => {
            const isDone = Boolean(student.completedRoutines[routine]);

            return (
              <div
                key={idx}
                onClick={() => onToggleRoutine(routine)}
                className={`p-3 rounded-lg border text-xs sm:text-sm font-medium flex items-center gap-3 cursor-pointer transition-all ${
                  isDone
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="text-indigo-600 shrink-0">
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <span className={isDone ? 'line-through text-slate-500' : ''}>
                  {routine}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
