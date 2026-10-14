import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { DEFAULT_HABIT_QUESTIONS } from '../data/initialStudents';
import { X, UserPlus } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (newStudent: StudentProfile) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('고등학교 2학년');
  const [schoolName, setSchoolName] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStudent: StudentProfile = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      grade,
      schoolName: schoolName.trim() || '중앙고등학교',
      targetGoal: targetGoal.trim() || '내신 2등급 진입 및 목표 대학 합격',
      parentName: parentName.trim() || `${name} 학부모`,
      parentPhone: parentPhone.trim() || '010-0000-0000',
      counselorName: '이진영 수석컨설턴트',
      subjects: [
        {
          id: `sub-${Date.now()}-1`,
          name: '국어',
          prevScore: 80,
          currentMidterm: 82,
          currentFinal: 84,
          gradeRank: 3,
          weeklyStudyHours: 5,
          targetScore: 90,
          category: '국어',
        },
        {
          id: `sub-${Date.now()}-2`,
          name: '수학',
          prevScore: 72,
          currentMidterm: 70,
          currentFinal: 75,
          gradeRank: 4,
          weeklyStudyHours: 10,
          targetScore: 88,
          category: '수학',
        },
        {
          id: `sub-${Date.now()}-3`,
          name: '영어',
          prevScore: 78,
          currentMidterm: 80,
          currentFinal: 82,
          gradeRank: 3,
          weeklyStudyHours: 6,
          targetScore: 90,
          category: '영어',
        },
        {
          id: `sub-${Date.now()}-4`,
          name: '탐구1',
          prevScore: 75,
          currentMidterm: 78,
          currentFinal: 80,
          gradeRank: 3,
          weeklyStudyHours: 4,
          targetScore: 88,
          category: '사회',
        },
      ],
      habitQuestions: DEFAULT_HABIT_QUESTIONS.map((q) => ({
        ...q,
        score: 3,
      })),
      completedRoutines: {},
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">새 상담 학생 등록</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">학생 이름 *</label>
            <input
              type="text"
              required
              placeholder="예: 최유진"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">학년 단계</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="중학교 1학년">중학교 1학년</option>
                <option value="중학교 2학년">중학교 2학년</option>
                <option value="중학교 3학년">중학교 3학년</option>
                <option value="고등학교 1학년">고등학교 1학년</option>
                <option value="고등학교 2학년">고등학교 2학년</option>
                <option value="고등학교 3학년">고등학교 3학년</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">소속 학교</label>
              <input
                type="text"
                placeholder="예: 명문고등학교"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">상담 목표 및 진로 희망</label>
            <input
              type="text"
              placeholder="예: 자연계열 상위권 진학, 내신 2등급 진입"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">학부모 성함</label>
              <input
                type="text"
                placeholder="예: 최현우"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">학부모 연락처</label>
              <input
                type="text"
                placeholder="예: 010-1234-5678"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
