import { StudentProfile, CounselingAnalysis } from '../types';

export function generateClientHeuristicCounseling(student: StudentProfile): CounselingAnalysis {
  const subjects = student.subjects;
  const survey = student.habitQuestions;

  const categoryScores: Record<string, number> = {};
  survey.forEach((q) => {
    categoryScores[q.category] = (categoryScores[q.category] || 0) + q.score;
  });

  const concentration = categoryScores['집중력'] || 7;
  const selfControl = categoryScores['자기통제'] || 5;
  const reviewRoutine = categoryScores['복습루틴'] || 3;
  const noteTaking = categoryScores['오답관리'] || 5;

  const subjectStrategies = subjects.map((sub) => {
    const diff = sub.currentFinal - sub.prevScore;
    let diagnosis = '';
    let actionPlan = '';
    let recommendedHours = sub.weeklyStudyHours;
    let focusTopic = '기본 개념 및 빈출 기출 유형';

    if (sub.weeklyStudyHours >= 9 && sub.currentFinal < 78) {
      diagnosis = `주당 ${sub.weeklyStudyHours}시간을 투자하고 있으나 점수가 ${sub.currentFinal}점에 정체되어 공부 방법(단순 양치기 또는 해설지 의존)의 전환이 시급합니다.`;
      actionPlan = '문제 수를 절반으로 줄이고, 틀린 문항에 대해 해설지 없이 3단계 자가 분석 노트를 작성하세요.';
      recommendedHours = Math.max(7, sub.weeklyStudyHours - 1);
      focusTopic = '틀린 문제 원인 역추적 및 개념 단권화 노트 작성';
    } else if (sub.weeklyStudyHours < 4 && sub.currentFinal < 80) {
      diagnosis = `현재 주당 ${sub.weeklyStudyHours}시간으로 절대적인 학습 투입량이 부족하여 점수 도약에 한계가 발생하고 있습니다.`;
      actionPlan = `주당 최소 ${sub.weeklyStudyHours + 3}시간 이상의 고정적인 자습 슬롯을 확보하여 일일 15문제 루틴을 유지하세요.`;
      recommendedHours = sub.weeklyStudyHours + 3;
      focusTopic = '교과서 핵심 개념 정리 및 필수 예제 3회 반복';
    } else if (sub.currentFinal >= 90) {
      diagnosis = `현재 ${sub.currentFinal}점으로 최상위권 안정세를 유지하고 있으며 학습 효율성이 매우 뛰어납니다.`;
      actionPlan = '현재 페이스를 유지하되 내신 1등급 변별력을 가르는 킬러 문항 및 서술형 감점 요소 점검에 집중하세요.';
      recommendedHours = Math.max(4, sub.weeklyStudyHours);
      focusTopic = '고난도 킬러 문항 타임어택 및 서술형 배점 방어';
    } else {
      diagnosis = `이전 학기 대비 ${diff >= 0 ? '+' : ''}${diff}점 변화를 보이고 있으며, 체계적인 복습 루틴이 뒷받침되면 추가 성장이 유망합니다.`;
      actionPlan = '주 2회 취약 단원 개념 복습과 주 1회 실전 모의 테스트를 통해 실전 감각을 높이세요.';
      recommendedHours = Math.max(5, sub.weeklyStudyHours + 1);
      focusTopic = '단원별 오답 누적 복습 및 실전 시간 배분 훈련';
    }

    return {
      subject: sub.name,
      diagnosis,
      actionPlan,
      recommendedWeeklyHours: recommendedHours,
      focusTopic,
    };
  });

  const lowHabits: string[] = [];
  if (selfControl <= 5) lowHabits.push('스마트폰 및 미디어 절제');
  if (reviewRoutine <= 3) lowHabits.push('당일 복습 및 오답 정리');
  if (concentration <= 6) lowHabits.push('자습 몰입도 유지');

  const habitAdvice =
    lowHabits.length > 0
      ? `학습 습관 진단 결과 특히 [${lowHabits.join(', ')}] 영역의 개선이 시급합니다. '공부 시작 전 스마트폰 거실 보관', '취침 전 15분 복습'과 같은 작은 행동 루틴부터 정착시키는 것이 핵심입니다.`
      : '전반적인 자기주도 학습 습관이 안정적입니다. 정해진 주간 계획을 꾸준히 이행하면 목표 달성이 충분히 가능합니다.';

  const bestSub = subjects.reduce((prev, curr) => (curr.currentFinal > prev.currentFinal ? curr : prev));

  return {
    overallSummary: `${student.name} 학생은 목표(${student.targetGoal})를 향한 성취 의지가 분명하며, 과목별로 공부 시간 대비 성과 편차가 존재합니다. 특히 시간 투입 대비 효율이 저조한 과목의 학습법을 재설계하고 습관적 약점을 보완하면 다음 시험에서 가시적인 등급 상승을 기대할 수 있습니다.`,
    strengths: [
      `${bestSub.name} 과목에서 높은 성취도와 자신감을 유지하고 있음`,
      '자기주도 학습에 대한 기본 의지와 목표 설정이 뚜렷함',
    ],
    weaknesses: [
      '투입 시간 대비 효율성이 떨어지는 과목의 비효율적 공부 습관(문제만 풀고 복습 생략)',
      lowHabits[0] || '주간 단위 학습 누적 점검 부재',
    ],
    subjectStrategies,
    studyHabitAdvice: habitAdvice,
    weeklyPlan: [
      {
        id: `plan-${Date.now()}-1`,
        day: '월',
        timeSlot: '19:00~21:00',
        subject: subjects[0]?.name || '국어',
        task: '핵심 개념 복습 및 대표 유형 15문항 풀이 (오답 즉시 정리)',
        durationMin: 120,
        isCompleted: false,
      },
      {
        id: `plan-${Date.now()}-2`,
        day: '화',
        timeSlot: '19:00~21:30',
        subject: subjects[1]?.name || '수학',
        task: '취약 단원 개념서 예제 재풀이 및 서술형 풀이과정 쓰기',
        durationMin: 150,
        isCompleted: false,
      },
      {
        id: `plan-${Date.now()}-3`,
        day: '수',
        timeSlot: '19:00~21:00',
        subject: subjects[2]?.name || '영어',
        task: '빈출 어휘 40개 암기 및 주요 문법 구문 독해 4지문 분석',
        durationMin: 120,
        isCompleted: false,
      },
      {
        id: `plan-${Date.now()}-4`,
        day: '목',
        timeSlot: '19:00~21:00',
        subject: subjects[3]?.name || '탐구',
        task: '교과서 및 개념서 정리 노트 작성, 기출 단원 평가 풀이',
        durationMin: 120,
        isCompleted: false,
      },
      {
        id: `plan-${Date.now()}-5`,
        day: '금',
        timeSlot: '19:00~21:30',
        subject: '취약과목 클리닉',
        task: '주간 오답 문항 재확인 및 유사 유형 변형 문제 집중 공략',
        durationMin: 150,
        isCompleted: false,
      },
      {
        id: `plan-${Date.now()}-6`,
        day: '토',
        timeSlot: '14:00~17:30',
        subject: '실전 모의 훈련',
        task: '타이머 설정 후 실전 시간 배분 모의 테스트 및 심층 피드백',
        durationMin: 210,
        isCompleted: false,
      },
      {
        id: `plan-${Date.now()}-7`,
        day: '일',
        timeSlot: '15:00~17:00',
        subject: '주간 총평 & 플래닝',
        task: '주간 미진한 분량 보충 및 차주 일일 학습 목표 수립',
        durationMin: 120,
        isCompleted: false,
      },
    ],
    dailyRoutines: [
      '공부 시작 전 3분: 당일 완료할 3가지 핵심 목표 우선순위 작성',
      '자습 중 스마트폰은 가방에 보관하고 50분 집중 / 10분 휴식 준수',
      '취침 전 20분: 오늘 푼 문제 중 틀린 3문항 해설 없이 눈으로 복기',
    ],
    parentNotice: `[에듀 플랜 성적 상담 알림]\n안녕하세요, ${student.parentName} 학부모님. 이번 학기 ${student.name} 학생의 성적 분석 및 학습 컨설팅 결과 안내드립니다.\n\n${student.name} 학생은 높은 학습 의지를 가지고 있으며, 현재 과목별 공부 효율성을 개선하면 다음 시험에서 눈에 띄는 등급 향상이 예상됩니다.\n가정에서도 정해진 주간 계획을 차분히 완주할 수 있도록 따뜻한 칭찬과 격려 부탁드립니다.\n상세한 분석표 및 주간 계획표는 리포트를 통해 확인하실 수 있습니다. 감사합니다.`,
    generatedAt: new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}
