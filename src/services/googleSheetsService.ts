import { SubjectData, StudentProfile } from '../types';
import { DEFAULT_HABIT_QUESTIONS } from '../data/initialStudents';

export interface SheetParseResult {
  spreadsheetTitle?: string;
  sheetNames?: string[];
  type: 'subjects' | 'students';
  subjects?: SubjectData[];
  students?: StudentProfile[];
  rawRows?: string[][];
  warnings?: string[];
}

export function extractSpreadsheetId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  if (!trimmed) return null;

  // Pattern 1: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Pattern 2: Raw ID alphanumeric with hyphens/underscores, usually > 20 chars
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export async function fetchGoogleSheetData(
  spreadsheetId: string,
  accessToken: string | null,
  sheetName?: string
): Promise<{ rows: string[][]; title?: string; sheetNames?: string[] }> {
  // If accessToken is available, use Google Sheets API v4
  if (accessToken) {
    try {
      // 1. Get spreadsheet metadata
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!metaRes.ok) {
        throw new Error(`Google Sheets API 응답 에러: ${metaRes.status} ${metaRes.statusText}`);
      }

      const metaData = await metaRes.json();
      const title = metaData.properties?.title || '가져온 스프레드시트';
      const sheetNames: string[] =
        metaData.sheets?.map((s: any) => s.properties?.title).filter(Boolean) || ['Sheet1'];

      const targetSheet = sheetName || sheetNames[0] || 'Sheet1';

      // 2. Fetch cell values
      const valRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
          targetSheet
        )}!A1:Z100`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!valRes.ok) {
        throw new Error(`시트 데이터 조회 에러: ${valRes.status} ${valRes.statusText}`);
      }

      const valData = await valRes.json();
      const rows: string[][] = valData.values || [];

      return { rows, title, sheetNames };
    } catch (err) {
      console.warn('Authenticated Sheets API failed, trying proxy/fallback:', err);
    }
  }

  // Fallback: Use proxy endpoint or public CSV export
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
  const res = await fetch(`/api/sheets-proxy?url=${encodeURIComponent(csvUrl)}`);

  if (!res.ok) {
    throw new Error(
      '스프레드시트를 가져올 수 없습니다. 비공개 문서인 경우 [Google 계정으로 로그인]을 진행해 주시거나, 링크 공유 설정을 [링크가 있는 모든 사용자에게 공개]로 변경해 주세요.'
    );
  }

  const csvText = await res.text();
  const rows = parseCSV(csvText);
  return { rows, title: '가져온 스프레드시트', sheetNames: ['Sheet1'] };
}

function parseCSV(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) => {
    const row: string[] = [];
    let insideQuotes = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    return row;
  });
}

// Convert parsed 2D rows into EduPlan data
export function parseSheetRowsToEduPlan(
  rows: string[][],
  currentStudentName: string
): SheetParseResult {
  if (rows.length < 2) {
    throw new Error('스프레드시트에 데이터 행이 충분하지 않습니다 (헤더 포함 최소 2줄 이상 필요).');
  }

  const header = rows[0].map((h) => h.replace(/["\s]/g, '').toLowerCase());

  // Check if this sheet is Type A (Subject list: 과목, 전학기, 중간, 기말, 등급, 시간, 목표)
  const hasSubjectCol = header.some((h) =>
    ['과목', '과목명', '교과목', '교과', 'subject'].includes(h)
  );
  const hasStudentNameCol = header.some((h) =>
    ['학생', '학생명', '이름', '성명', 'student', 'name'].includes(h)
  );

  // If it has '학생명' and multiple rows of different students: Type B
  if (hasStudentNameCol && !hasSubjectCol) {
    return parseMultiStudentSheet(rows, header);
  }

  // Default: Type A - Subject Rows for a Student
  return parseSubjectRows(rows, header);
}

function parseSubjectRows(rows: string[][], header: string[]): SheetParseResult {
  // Find column indices
  const findCol = (candidates: string[]) =>
    header.findIndex((h) => candidates.some((c) => h.includes(c)));

  const colSubject = findCol(['과목', '교과', 'subject', '과목명']);
  const colPrev = findCol(['전학기', '지난학기', '1학기', '이전', 'prev']);
  const colMid = findCol(['중간', '중간고사', 'mid']);
  const colFinal = findCol(['기말', '기말고사', '이번학기', '현재', 'final', '점수']);
  const colRank = findCol(['등급', '석차', '석차등급', '내신', 'rank', 'grade']);
  const colHours = findCol(['시간', '학습시간', '공부시간', '주당', 'hours']);
  const colTarget = findCol(['목표', '목표점수', '목표성적', 'target']);

  const subjects: SubjectData[] = [];
  const warnings: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const name = colSubject !== -1 ? row[colSubject]?.trim() : row[0]?.trim();
    if (!name || name === '평균' || name === '합계') continue;

    const parseNum = (val: string | undefined, fallback: number) => {
      if (!val) return fallback;
      const cleaned = val.replace(/[^0-9.-]/g, '');
      const num = Number(cleaned);
      return isNaN(num) ? fallback : num;
    };

    const prevScore = colPrev !== -1 ? parseNum(row[colPrev], 75) : 75;
    const currentMidterm = colMid !== -1 ? parseNum(row[colMid], prevScore) : prevScore;
    const currentFinal = colFinal !== -1 ? parseNum(row[colFinal], 80) : 80;
    
    // Auto calculate rank if missing or use parsed
    let gradeRank = colRank !== -1 ? parseNum(row[colRank], 0) : 0;
    if (gradeRank < 1 || gradeRank > 9) {
      if (currentFinal >= 95) gradeRank = 1;
      else if (currentFinal >= 88) gradeRank = 2;
      else if (currentFinal >= 80) gradeRank = 3;
      else if (currentFinal >= 70) gradeRank = 4;
      else if (currentFinal >= 60) gradeRank = 5;
      else gradeRank = 6;
    }

    const weeklyStudyHours = colHours !== -1 ? parseNum(row[colHours], 6) : 6;
    const targetScore = colTarget !== -1 ? parseNum(row[colTarget], Math.min(100, currentFinal + 8)) : Math.min(100, currentFinal + 8);

    // Determine category
    let category: SubjectData['category'] = '기타';
    if (/국어|문학|독서|화법|작문|언어/.test(name)) category = '국어';
    else if (/수학|수I|수II|미적|기하|확통/.test(name)) category = '수학';
    else if (/영어|영문|회화/.test(name)) category = '영어';
    else if (/사회|역사|지리|윤리|정치|경제|한국사/.test(name)) category = '사회';
    else if (/과학|물리|화학|생명|지구/.test(name)) category = '과학';

    subjects.push({
      id: `sheet-sub-${Date.now()}-${r}`,
      name,
      prevScore,
      currentMidterm,
      currentFinal,
      gradeRank,
      weeklyStudyHours,
      targetScore,
      category,
    });
  }

  if (subjects.length === 0) {
    throw new Error('스프레드시트에서 과목 데이터를 인식할 수 없습니다. 컬럼명에 "과목명", "기말고사", "공부시간" 등이 포함되어 있는지 확인해 주세요.');
  }

  return {
    type: 'subjects',
    subjects,
    rawRows: rows,
    warnings,
  };
}

function parseMultiStudentSheet(rows: string[][], header: string[]): SheetParseResult {
  const findCol = (candidates: string[]) =>
    header.findIndex((h) => candidates.some((c) => h.includes(c)));

  const colName = findCol(['학생', '학생명', '이름', '성명', 'student', 'name']);
  const colGrade = findCol(['학년', 'grade', '소속']);

  const students: StudentProfile[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const studentName = colName !== -1 ? row[colName]?.trim() : `학생${r}`;
    if (!studentName) continue;

    const grade = colGrade !== -1 && row[colGrade] ? row[colGrade].trim() : '고등학교 2학년';

    // Scan numeric columns for subjects
    const subjects: SubjectData[] = [];
    header.forEach((h, colIdx) => {
      if (colIdx === colName || colIdx === colGrade) return;

      const rawVal = row[colIdx];
      const score = Number(rawVal?.replace(/[^0-9.-]/g, ''));
      if (!isNaN(score) && score >= 0 && score <= 100) {
        const subName = rows[0][colIdx] || `과목${colIdx}`;
        let rank = 3;
        if (score >= 95) rank = 1;
        else if (score >= 88) rank = 2;
        else if (score >= 80) rank = 3;
        else if (score >= 70) rank = 4;
        else if (score >= 60) rank = 5;
        else rank = 6;

        subjects.push({
          id: `sub-import-${r}-${colIdx}`,
          name: subName,
          prevScore: Math.max(40, score - 3),
          currentMidterm: Math.max(40, score - 2),
          currentFinal: score,
          gradeRank: rank,
          weeklyStudyHours: 6,
          targetScore: Math.min(100, score + 7),
          category: '기타',
        });
      }
    });

    if (subjects.length > 0) {
      students.push({
        id: `student-import-${Date.now()}-${r}`,
        name: studentName,
        grade,
        schoolName: '스프레드시트 연동',
        targetGoal: '내신 성적 향상 및 목표 대학 진학',
        parentName: `${studentName} 학부모`,
        parentPhone: '010-0000-0000',
        counselorName: '이진영 수석컨설턴트',
        subjects,
        habitQuestions: DEFAULT_HABIT_QUESTIONS.map((q) => ({ ...q, score: 3 })),
        completedRoutines: {},
      });
    }
  }

  return {
    type: 'students',
    students,
    rawRows: rows,
  };
}
