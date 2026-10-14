import React from 'react';
import { StudentProfile } from '../types';
import { GraduationCap, Printer, UserPlus, RotateCcw, ChevronDown } from 'lucide-react';

interface HeaderProps {
  students: StudentProfile[];
  currentStudent: StudentProfile;
  onSelectStudent: (id: string) => void;
  onOpenAddModal: () => void;
  onResetDemo: () => void;
  onPrint: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  students,
  currentStudent,
  onSelectStudent,
  onOpenAddModal,
  onResetDemo,
  onPrint,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                에듀 플랜
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400">
                AI 성적 상담 & 맞춤 플래너
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              성적·시간 분석
            </button>
            <button
              onClick={() => setActiveTab('habit')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'habit'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              학습 습관 진단
            </button>
            <button
              onClick={() => setActiveTab('counseling')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'counseling'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI 전략 & 시간표
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'report'
                  ? 'bg-slate-100 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              학부모 상담 리포트
            </button>
          </nav>

          {/* Zone 3: Student Switcher & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Student Dropdown Selector */}
            <div className="relative">
              <select
                aria-label="상담 학생 선택"
                value={currentStudent.id}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium rounded-lg pl-3 pr-8 py-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.grade.split(' ')[0]})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Add Student Button */}
            <button
              onClick={onOpenAddModal}
              title="새 학생 등록"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">학생 추가</span>
            </button>

            {/* Print Official Report */}
            <button
              onClick={onPrint}
              title="리포트 카드 인쇄 / PDF 저장"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>리포트 인쇄</span>
            </button>

            {/* Demo Reset */}
            <button
              onClick={onResetDemo}
              title="초기 예시 데이터로 복원"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Strip */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1 px-2 rounded ${activeTab === 'analytics' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            성적 분석
          </button>
          <button
            onClick={() => setActiveTab('habit')}
            className={`py-1 px-2 rounded ${activeTab === 'habit' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            습관 진단
          </button>
          <button
            onClick={() => setActiveTab('counseling')}
            className={`py-1 px-2 rounded ${activeTab === 'counseling' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            AI 계획표
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`py-1 px-2 rounded ${activeTab === 'report' ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}
          >
            학부모 리포트
          </button>
        </div>
      </div>
    </header>
  );
};
