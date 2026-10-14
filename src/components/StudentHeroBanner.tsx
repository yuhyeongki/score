import React from 'react';
import { StudentProfile } from '../types';
import { Target, Clock, Award, TrendingUp, Sparkles } from 'lucide-react';

interface StudentHeroBannerProps {
  student: StudentProfile;
  onUpdateTargetGoal: (newGoal: string) => void;
  onRunAiCounseling: () => void;
  isAiLoading: boolean;
}

export const StudentHeroBanner: React.FC<StudentHeroBannerProps> = ({
  student,
  onUpdateTargetGoal,
  onRunAiCounseling,
  isAiLoading,
}) => {
  const totalWeeklyHours = student.subjects.reduce((sum, s) => sum + s.weeklyStudyHours, 0);
  const currentAvg = Math.round(
    student.subjects.reduce((sum, s) => sum + s.currentFinal, 0) / (student.subjects.length || 1)
  );
  const prevAvg = Math.round(
    student.subjects.reduce((sum, s) => sum + s.prevScore, 0) / (student.subjects.length || 1)
  );
  const targetAvg = Math.round(
    student.subjects.reduce((sum, s) => sum + s.targetScore, 0) / (student.subjects.length || 1)
  );
  const avgDiff = currentAvg - prevAvg;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Student Identity */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {student.name}
            </span>
            <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-md">
              {student.schoolName}
            </span>
            <span className="text-xs text-indigo-700 font-semibold px-2 py-0.5 bg-indigo-50 rounded-md">
              {student.grade}
            </span>
            <span className="text-xs text-slate-400">
              담당: {student.counselorName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <Target className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-semibold text-slate-800">목표 로드맵:</span>
            <input
              type="text"
              value={student.targetGoal}
              onChange={(e) => onUpdateTargetGoal(e.target.value)}
              className="bg-transparent hover:bg-slate-50 focus:bg-white border-b border-dashed border-slate-300 focus:border-indigo-500 px-1 py-0.5 text-slate-800 focus:outline-none w-full max-w-md transition-colors"
              title="클릭하여 목표 수정"
            />
          </div>
        </div>

        {/* Right: Key Performance Indicators & AI Action */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          
          {/* Metric 1: Current Avg Score */}
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">현재 기말 평균</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {currentAvg}점
              </span>
              <span
                className={`text-xs font-semibold flex items-center tabular-nums ${
                  avgDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                <TrendingUp className={`w-3 h-3 ${avgDiff < 0 ? 'rotate-180' : ''}`} />
                {avgDiff >= 0 ? `+${avgDiff}` : avgDiff}점
              </span>
            </div>
          </div>

          {/* Metric 2: Total Study Hours */}
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">주당 자습 시간</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-indigo-600 tabular-nums">
                {totalWeeklyHours}
              </span>
              <span className="text-xs text-slate-500">시간/주</span>
            </div>
          </div>

          {/* Metric 3: Target Avg */}
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">최종 목표 평균</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-emerald-600 tabular-nums">
                {targetAvg}점
              </span>
              <span className="text-xs text-slate-400">목표</span>
            </div>
          </div>

          {/* Quick AI Analyze Button */}
          <button
            onClick={onRunAiCounseling}
            disabled={isAiLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-xs disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? 'AI 분석 및 계획표 수립 중...' : 'AI 맞춤 상담 & 계획표 생성'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
