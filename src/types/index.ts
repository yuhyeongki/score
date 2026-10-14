export interface SubjectData {
  id: string;
  name: string;
  prevScore: number;       // 이전 학기 평균/기말
  currentMidterm: number;  // 이번 학기 중간
  currentFinal: number;    // 이번 학기 기말
  gradeRank: number;       // 내신 석차등급 (1~9등급)
  weeklyStudyHours: number;// 주당 자기주도 학습 시간
  targetScore: number;     // 목표 점수
  category: '국어' | '수학' | '영어' | '사회' | '과학' | '기타';
}

export interface HabitQuestion {
  id: number;
  text: string;
  category: '집중력' | '자기통제' | '계획성' | '복습루틴' | '오답관리' | '멘탈관리';
  score: number; // 1 ~ 5
}

export interface WeeklyScheduleSlot {
  id: string;
  day: '월' | '화' | '수' | '목' | '금' | '토' | '일';
  timeSlot: string;
  subject: string;
  task: string;
  durationMin: number;
  isCompleted?: boolean;
}

export interface SubjectStrategy {
  subject: string;
  diagnosis: string;
  actionPlan: string;
  recommendedWeeklyHours: number;
  focusTopic: string;
}

export interface CounselingAnalysis {
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  subjectStrategies: SubjectStrategy[];
  studyHabitAdvice: string;
  weeklyPlan: WeeklyScheduleSlot[];
  dailyRoutines: string[];
  parentNotice: string;
  generatedAt?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  schoolName: string;
  targetGoal: string;
  parentName: string;
  parentPhone: string;
  counselorName: string;
  subjects: SubjectData[];
  habitQuestions: HabitQuestion[];
  counselingAnalysis?: CounselingAnalysis;
  completedRoutines: Record<string, boolean>;
}
