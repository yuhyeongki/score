/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudentProfile, SubjectData } from './types';
import { INITIAL_STUDENTS } from './data/initialStudents';
import { Header } from './components/Header';
import { StudentHeroBanner } from './components/StudentHeroBanner';
import { ScoreAnalyticsTab } from './components/ScoreAnalyticsTab';
import { HabitSurveyTab } from './components/HabitSurveyTab';
import { AiCounselingTab } from './components/AiCounselingTab';
import { ParentReportTab } from './components/ParentReportTab';
import { AddStudentModal } from './components/AddStudentModal';
import { Sparkles, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'eduplan_students_data_v1';

export default function App() {
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved students:', e);
    }
    return INITIAL_STUDENTS;
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'student-1'
  );
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.warn('Failed to save students to localStorage:', e);
    }
  }, [students]);

  const currentStudent =
    students.find((s) => s.id === selectedStudentId) || students[0] || INITIAL_STUDENTS[0];

  const updateCurrentStudent = (updater: (prev: StudentProfile) => StudentProfile) => {
    setStudents((prev) =>
      prev.map((st) => (st.id === currentStudent.id ? updater(st) : st))
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Subject actions
  const handleUpdateSubject = (subjectId: string, updatedFields: Partial<SubjectData>) => {
    updateCurrentStudent((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) =>
        sub.id === subjectId ? { ...sub, ...updatedFields } : sub
      ),
    }));
  };

  const handleAddSubject = (newSubject: SubjectData) => {
    updateCurrentStudent((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
    showToast(`'${newSubject.name}' 과목이 추가되었습니다.`);
  };

  const handleDeleteSubject = (subjectId: string) => {
    updateCurrentStudent((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((sub) => sub.id !== subjectId),
    }));
    showToast('과목이 삭제되었습니다.');
  };

  // Habit survey action
  const handleUpdateQuestionScore = (questionId: number, score: number) => {
    updateCurrentStudent((prev) => ({
      ...prev,
      habitQuestions: prev.habitQuestions.map((q) =>
        q.id === questionId ? { ...q, score } : q
      ),
    }));
  };

  // Target goal update
  const handleUpdateTargetGoal = (newGoal: string) => {
    updateCurrentStudent((prev) => ({
      ...prev,
      targetGoal: newGoal,
    }));
  };

  // Schedule slot toggle
  const handleToggleScheduleSlot = (slotId: string) => {
    updateCurrentStudent((prev) => {
      if (!prev.counselingAnalysis) return prev;
      return {
        ...prev,
        counselingAnalysis: {
          ...prev.counselingAnalysis,
          weeklyPlan: prev.counselingAnalysis.weeklyPlan.map((s) =>
            s.id === slotId ? { ...s, isCompleted: !s.isCompleted } : s
          ),
        },
      };
    });
  };

  // Daily routine toggle
  const handleToggleRoutine = (routineText: string) => {
    updateCurrentStudent((prev) => ({
      ...prev,
      completedRoutines: {
        ...prev.completedRoutines,
        [routineText]: !prev.completedRoutines[routineText],
      },
    }));
  };

  // Add new student
  const handleAddStudent = (newStudent: StudentProfile) => {
    setStudents((prev) => [newStudent, ...prev]);
    setSelectedStudentId(newStudent.id);
    setActiveTab('analytics');
    showToast(`새 학생 '${newStudent.name}' 등록이 완료되었습니다.`);
  };

  // Reset demo
  const handleResetDemo = () => {
    if (window.confirm('예시 데이터로 초기화하시겠습니까? (직접 수정한 데이터가 재설정됩니다)')) {
      setStudents(INITIAL_STUDENTS);
      setSelectedStudentId(INITIAL_STUDENTS[0].id);
      localStorage.removeItem(STORAGE_KEY);
      showToast('예시 학생 데이터로 초기화되었습니다.');
    }
  };

  // Print
  const handlePrint = () => {
    setActiveTab('report');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Trigger Gemini AI Counseling
  const handleRunAiCounseling = async () => {
    setIsAiLoading(true);
    showToast('AI가 학생의 성적과 공부 시간을 분석하고 있습니다...');

    const categoryScores: Record<string, number> = {};
    currentStudent.habitQuestions.forEach((q) => {
      categoryScores[q.category] = (categoryScores[q.category] || 0) + q.score;
    });

    const payload = {
      studentName: currentStudent.name,
      grade: currentStudent.grade,
      targetGoal: currentStudent.targetGoal,
      subjects: currentStudent.subjects.map((s) => ({
        name: s.name,
        currentScore: s.currentFinal,
        prevScore: s.prevScore,
        gradeRank: s.gradeRank,
        weeklyStudyHours: s.weeklyStudyHours,
        targetScore: s.targetScore,
      })),
      surveyScores: {
        concentration: Math.round(((categoryScores['집중력'] || 6) / 2)),
        planning: Math.round(((categoryScores['계획성'] || 3) / 1)),
        reviewRoutine: Math.round(((categoryScores['복습루틴'] || 3) / 1)),
        smartphoneControl: Math.round(((categoryScores['자기통제'] || 6) / 2)),
        stressControl: Math.round(((categoryScores['멘탈관리'] || 6) / 2)),
      },
    };

    try {
      const res = await fetch('/api/counseling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const result = await res.json();

      updateCurrentStudent((prev) => ({
        ...prev,
        counselingAnalysis: {
          overallSummary: result.overallSummary,
          strengths: result.strengths || [],
          weaknesses: result.weaknesses || [],
          subjectStrategies: result.subjectStrategies || [],
          studyHabitAdvice: result.studyHabitAdvice || '',
          weeklyPlan: (result.weeklyPlan || []).map((slot: any, idx: number) => ({
            id: slot.id || `plan-slot-${Date.now()}-${idx}`,
            day: slot.day || '월',
            timeSlot: slot.timeSlot || '19:00~21:00',
            subject: slot.subject || '자습',
            task: slot.task || '핵심 복습 및 오답 정리',
            durationMin: slot.durationMin || 120,
            isCompleted: false,
          })),
          dailyRoutines: result.dailyRoutines || [],
          parentNotice: result.parentNotice || '',
          generatedAt: new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      }));

      setActiveTab('counseling');
      showToast('AI 맞춤 전략 및 주간 시간표가 생성되었습니다!');
    } catch (err: any) {
      console.error('Failed to generate counseling:', err);
      showToast('AI 분석 중 오류가 발생하여 기본 추천 전략을 적용했습니다.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header */}
      <Header
        students={students}
        currentStudent={currentStudent}
        onSelectStudent={setSelectedStudentId}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetDemo={handleResetDemo}
        onPrint={handlePrint}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Student Profile Hero Banner */}
        <StudentHeroBanner
          student={currentStudent}
          onUpdateTargetGoal={handleUpdateTargetGoal}
          onRunAiCounseling={handleRunAiCounseling}
          isAiLoading={isAiLoading}
        />

        {/* Tab Views */}
        {activeTab === 'analytics' && (
          <ScoreAnalyticsTab
            subjects={currentStudent.subjects}
            onUpdateSubject={handleUpdateSubject}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {activeTab === 'habit' && (
          <HabitSurveyTab
            questions={currentStudent.habitQuestions}
            onUpdateQuestionScore={handleUpdateQuestionScore}
            onRunAiCounseling={handleRunAiCounseling}
            isAiLoading={isAiLoading}
          />
        )}

        {activeTab === 'counseling' && (
          <AiCounselingTab
            student={currentStudent}
            onRunAiCounseling={handleRunAiCounseling}
            isAiLoading={isAiLoading}
            onToggleScheduleSlot={handleToggleScheduleSlot}
            onToggleRoutine={handleToggleRoutine}
          />
        )}

        {activeTab === 'report' && (
          <ParentReportTab
            student={currentStudent}
            onPrint={handlePrint}
          />
        )}
      </main>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStudent={handleAddStudent}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in no-print">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400 no-print mt-auto">
        <p>에듀 플랜 (EduPlan) · AI 기반 중·고등학생 맞춤형 성적 상담 및 학업 컨설팅 시스템</p>
      </footer>
    </div>
  );
}
