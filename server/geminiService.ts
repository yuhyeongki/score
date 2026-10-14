import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface StudentCounselingRequest {
  studentName: string;
  grade: string;
  targetGoal: string;
  subjects: Array<{
    name: string;
    currentScore: number;
    prevScore: number;
    gradeRank: number;
    weeklyStudyHours: number;
    targetScore: number;
  }>;
  surveyScores: {
    concentration: number;
    planning: number;
    reviewRoutine: number;
    smartphoneControl: number;
    stressControl: number;
  };
}

export async function generateCounselingReport(data: StudentCounselingRequest) {
  const ai = getAiClient();

  const prompt = `
당신은 대한민국 중·고등학교 입시 및 학습 코칭 최고 전문가입니다.
다음 학생의 성적 데이터, 과목별 주간 공부 시간, 학습 습관 진단 점수를 바탕으로 심층 성적 향상 컨설팅과 주간 실천 계획표를 수립해 주세요.

[학생 프로필]
- 이름: ${data.studentName}
- 학년: ${data.grade}
- 목표: ${data.targetGoal}

[과목별 성적 및 주당 공부 시간]
${data.subjects
  .map(
    (s) =>
      `- ${s.name}: 현재 ${s.currentScore}점 (${s.gradeRank}등급), 지난학기 ${s.prevScore}점, 목표 ${s.targetScore}점, 주당 공부시간: ${s.weeklyStudyHours}시간`
  )
  .join('\n')}

[학습 습관 진단 결과 (5점 만점)]
- 집중력: ${data.surveyScores.concentration}점
- 계획성/시간관리: ${data.surveyScores.planning}점
- 복습 및 오답노트: ${data.surveyScores.reviewRoutine}점
- 스마트폰/유혹 조절: ${data.surveyScores.smartphoneControl}점
- 시험 멘탈/스트레스 조절: ${data.surveyScores.stressControl}점

다음 JSON 형식으로만 엄격하게 응답해 주세요 (마크다운 백틱 없이 순수 JSON만 반환):
{
  "overallSummary": "학생의 현재 성적과 공부 시간의 상관관계 및 총평 (3~4문장)",
  "strengths": ["강점 요인 1", "강점 요인 2"],
  "weaknesses": ["개선이 시급한 요인 1", "개선이 시급한 요인 2"],
  "subjectStrategies": [
    {
      "subject": "과목명",
      "diagnosis": "공부 시간 대비 점수 효율성 진단 (시간은 많이 쓰는데 점수가 안 나오는지, 시간이 부족한지 등)",
      "actionPlan": "성적 향상을 위한 구체적인 공부법 (개념서 회독, 기출 분석, 오답노트 등)",
      "recommendedWeeklyHours": 8,
      "focusTopic": "가장 집중해야 할 핵심 단원 또는 문제 유형"
    }
  ],
  "studyHabitAdvice": "학습 습관 진단 점수에 기반한 생활 습관 및 시간관리 개선 조언 (3~4문장)",
  "weeklyPlan": [
    {
      "day": "월요일",
      "timeSlot": "저녁 7:00 ~ 9:00",
      "subject": "수학",
      "task": "수학 취약 단원 개념 복습 및 대표 유형 15제 풀이",
      "durationMin": 120
    },
    {
      "day": "화요일",
      "timeSlot": "저녁 7:00 ~ 9:00",
      "subject": "영어",
      "task": "수능/내신 빈출 어휘 50개 암기 및 독해 구문 분석 3지문",
      "durationMin": 120
    },
    {
      "day": "수요일",
      "timeSlot": "저녁 7:00 ~ 9:00",
      "subject": "국어",
      "task": "비문학 제재별 독해 훈련 및 문학 필수 작품 정리",
      "durationMin": 120
    },
    {
      "day": "목요일",
      "timeSlot": "저녁 7:00 ~ 9:00",
      "subject": "탐구(사회/과학)",
      "task": "교과서 핵심 도표 정리 및 단원별 기출문제 풀이",
      "durationMin": 120
    },
    {
      "day": "금요일",
      "timeSlot": "저녁 7:00 ~ 9:00",
      "subject": "수학",
      "task": "주간 오답노트 정리 및 취약 유형 유사 변형문제 풀이",
      "durationMin": 120
    },
    {
      "day": "토요일",
      "timeSlot": "오후 2:00 ~ 6:00",
      "subject": "취약과목 집중",
      "task": "실전 모의고사 1회 풀이 및 오답 심층 분석",
      "durationMin": 240
    },
    {
      "day": "일요일",
      "timeSlot": "오후 3:00 ~ 5:00",
      "subject": "주간 총정리",
      "task": "차주 학습 계획 수립 및 미진한 학습 보충 클리닉",
      "durationMin": 120
    }
  ],
  "dailyRoutines": [
    "매일 취침 전 20분: 당일 배운 과목 백지 복습 또는 목차 리콜",
    "공부 시작 전 스마트폰 방해금지 모드 및 물리적 분리 보관",
    "오답 발생 시 해설지 바로 보지 않고 5분간 스스로 조건 재확인하기"
  ],
  "parentNotice": "학부모님께 전달할 정중하고 구체적인 상담 알림 메시지 (학생의 강점 칭찬, 이번 학기 집중 지원 포인트, 가정에서의 따뜻한 격려 당부 포함)"
}
`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent pedagogical fallback:', err);
    }
  }

  // Smart heuristic pedagogical fallback
  return generateHeuristicReport(data);
}

function generateHeuristicReport(data: StudentCounselingRequest) {
  // Find subjects with efficiency gap
  const subjectAnalysis = data.subjects.map((sub) => {
    const scoreDiff = sub.currentScore - sub.prevScore;
    let diagnosis = '';
    let actionPlan = '';
    let recommendedHours = sub.weeklyStudyHours;
    let focusTopic = '기본 개념 및 빈출 기출 유형';

    if (sub.weeklyStudyHours >= 8 && sub.currentScore < 75) {
      diagnosis = `주당 ${sub.weeklyStudyHours}시간을 투자하고 있으나 점수가 ${sub.currentScore}점에 머물러 공부 방법(단순 암기 또는 해설지 위주 의존)의 전환이 시급합니다.`;
      actionPlan = '문제 양치기보다는 개념 원리 이해와 오답에 대한 원인 분석(풀이 과정 역추적) 위주로 학습 패턴을 개편해야 합니다.';
      recommendedHours = Math.max(7, sub.weeklyStudyHours - 1);
      focusTopic = '틀린 문제 원인 분석 및 개념 단권화 노트 작성';
    } else if (sub.weeklyStudyHours < 4 && sub.currentScore < 80) {
      diagnosis = `현재 주당 ${sub.weeklyStudyHours}시간으로 절대적인 학습 투입량이 부족하여 점수 도약에 한계가 발생하고 있습니다.`;
      actionPlan = `주당 최소 ${sub.weeklyStudyHours + 3}시간 이상의 고정적인 자습 슬롯을 확보하여 기본 예제와 단원 테스트를 꾸준히 누적해야 합니다.`;
      recommendedHours = sub.weeklyStudyHours + 3;
      focusTopic = '교과서 핵심 개념 정리 및 일일 15문제 꾸준한 풀이';
    } else if (sub.currentScore >= 90) {
      diagnosis = `현재 ${sub.currentScore}점으로 최상위권 안정세를 유지하고 있으며 학습 효율성이 매우 뛰어납니다.`;
      actionPlan = '현재의 학습 리듬을 유지하되, 내신 1등급 변별력을 가르는 킬러 문항 및 서술형 배점 방어 훈련을 병행하세요.';
      recommendedHours = Math.max(4, sub.weeklyStudyHours);
      focusTopic = '고난도 킬러 문항 및 서술형 감점 요소 점검';
    } else {
      diagnosis = `이전 대비 ${scoreDiff >= 0 ? '+' : ''}${scoreDiff}점 변화를 보이고 있으며, 체계적인 복습 루틴이 뒷받침되면 추가 성장이 유망합니다.`;
      actionPlan = '주 2회 취약 단원 개념 복습과 주 1회 실전 모의 테스트를 통해 실전 감각과 정확도를 높이세요.';
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

  const lowHabitAreas: string[] = [];
  if (data.surveyScores.smartphoneControl <= 3) lowHabitAreas.push('스마트폰 및 미디어 사용 조절');
  if (data.surveyScores.reviewRoutine <= 3) lowHabitAreas.push('당일 복습 및 오답노트 작성 주기');
  if (data.surveyScores.planning <= 3) lowHabitAreas.push('일일 학습 분량 계획 및 피드백');
  if (data.surveyScores.concentration <= 3) lowHabitAreas.push('자습 시간 몰입도 및 집중 지속 시간');
  if (data.surveyScores.stressControl <= 3) lowHabitAreas.push('시험 전 긴장도 완화 및 마인드 컨트롤');

  const habitAdvice = lowHabitAreas.length > 0
    ? `학습 습관 진단 결과 특히 [${lowHabitAreas.join(', ')}] 영역의 개선이 시급합니다. 큰 목표보다는 '공부 전 스마트폰 거실 보관', '취침 전 15분 복습'과 같은 작은 루틴부터 정착시키는 것이 성적 반등의 열쇠입니다.`
    : '전반적인 자기주도 학습 습관이 안정적으로 형성되어 있습니다. 정해진 계획을 꾸준히 이행하고 컨디션 관리에 유의하면 목표 달성이 충분히 가능합니다.';

  return {
    overallSummary: `${data.studentName} 학생은 목표(${data.targetGoal})를 향한 성취 의지가 분명하며, 과목별로 공부 시간 대비 성과 편차가 존재합니다. 특히 시간 투입 대비 효율이 저조한 과목의 학습법을 재설계하고, 습관적 약점을 보완하면 다음 시험에서 가시적인 등급 상승을 기대할 수 있습니다.`,
    strengths: [
      `${data.subjects.reduce((prev, curr) => curr.currentScore > prev.currentScore ? curr : prev).name} 과목에서 강한 경쟁력과 자신감 보유`,
      '자기주도 학습에 대한 기본 의지와 목표 설정이 뚜렷함',
    ],
    weaknesses: [
      '투입 시간 대비 효율성이 떨어지는 과목의 비효율적 공부 습관(문제만 풀고 복습 생략)',
      lowHabitAreas[0] || '주간 단위 학습 누적 점검 부재',
    ],
    subjectStrategies: subjectAnalysis,
    studyHabitAdvice: habitAdvice,
    weeklyPlan: [
      {
        day: '월요일',
        timeSlot: '19:00 ~ 21:00',
        subject: data.subjects[0]?.name || '국어',
        task: '핵심 개념 복습 및 대표 유형 15문항 풀이 (오답 즉시 정리)',
        durationMin: 120,
      },
      {
        day: '화요일',
        timeSlot: '19:00 ~ 21:30',
        subject: data.subjects[1]?.name || '수학',
        task: '취약 단원 개념서 예제 재풀이 및 서술형 풀이과정 쓰기',
        durationMin: 150,
      },
      {
        day: '수요일',
        timeSlot: '19:00 ~ 21:00',
        subject: data.subjects[2]?.name || '영어',
        task: '빈출 어휘 40개 암기 및 주요 문법 구문 독해 4지문 분석',
        durationMin: 120,
      },
      {
        day: '목요일',
        timeSlot: '19:00 ~ 21:00',
        subject: data.subjects[3]?.name || '탐구',
        task: '교과서 및 개념서 정리 노트 작성, 기출 단원 평가 풀이',
        durationMin: 120,
      },
      {
        day: '금요일',
        timeSlot: '19:00 ~ 21:30',
        subject: '수학/취약과목 클리닉',
        task: '주간 오답 문항 재확인 및 유사 유형 변형 문제 집중 공략',
        durationMin: 150,
      },
      {
        day: '토요일',
        timeSlot: '14:00 ~ 17:30',
        subject: '실전 모의 훈련 & 심화',
        task: '타이머 설정 후 실전 시간 배분 모의 테스트 및 심층 피드백',
        durationMin: 210,
      },
      {
        day: '일요일',
        timeSlot: '15:00 ~ 17:00',
        subject: '주간 총평 및 다음주 플래닝',
        task: '주간 미진한 분량 보충 및 차주 일일 학습 목표 수립',
        durationMin: 120,
      },
    ],
    dailyRoutines: [
      '공부 시작 전 3분: 당일 완료할 3가지 핵심 목표 우선순위 작성',
      '자습 중 스마트폰은 가방에 보관하고 50분 집중 / 10분 휴식 준수',
      '취침 전 20분: 오늘 푼 문제 중 틀린 3문항 해설 없이 눈으로 복기',
    ],
    parentNotice: `[에듀 플랜 성적 상담 알림]\n안녕하세요, ${data.studentName} 학생 학부모님. 이번 학기 성적 분석 및 학습 컨설팅 결과 안내드립니다.\n\n${data.studentName} 학생은 높은 학습 의지를 가지고 있으며, 현재 과목별 공부 효율성을 개선하면 다음 시험에서 눈에 띄는 등급 향상이 예상됩니다.\n가정에서도 정해진 주간 계획을 차분히 완주할 수 있도록 따뜻한 칭찬과 격려 부탁드립니다.\n상세한 분석표 및 주간 계획표는 리포트를 통해 확인하실 수 있습니다. 감사합니다.`,
  };
}
