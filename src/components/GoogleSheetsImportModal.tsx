import React, { useState, useEffect } from 'react';
import { SubjectData, StudentProfile } from '../types';
import {
  extractSpreadsheetId,
  fetchGoogleSheetData,
  parseSheetRowsToEduPlan,
  SheetParseResult,
} from '../services/googleSheetsService';
import { googleSignIn, initAuth, logout } from '../services/firebaseAuth';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  X,
  Link,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  LogOut,
  HelpCircle,
  Table,
} from 'lucide-react';

interface GoogleSheetsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentProfile;
  onApplySubjects: (subjects: SubjectData[]) => void;
  onAddNewStudent: (newStudent: StudentProfile) => void;
}

export const GoogleSheetsImportModal: React.FC<GoogleSheetsImportModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onApplySubjects,
  onAddNewStudent,
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<SheetParseResult | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>('');

  useEffect(() => {
    // Listen for Firebase Auth state
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      setErrorMsg(null);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      setErrorMsg('Google 계정 로그인에 실패했습니다. 팝업 차단 여부를 확인해 주세요.');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  const handleLoadSheet = async (overrideUrl?: string, overrideSheetName?: string) => {
    const targetUrl = overrideUrl || sheetUrl;
    setErrorMsg(null);

    const spreadsheetId = extractSpreadsheetId(targetUrl);
    if (!spreadsheetId) {
      setErrorMsg('유효한 Google 스프레드시트 링크나 ID를 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setParseResult(null);

    try {
      const data = await fetchGoogleSheetData(spreadsheetId, accessToken, overrideSheetName);
      setSpreadsheetTitle(data.title || '가져온 스프레드시트');
      setAvailableSheets(data.sheetNames || ['Sheet1']);
      if (!selectedSheet && data.sheetNames && data.sheetNames.length > 0) {
        setSelectedSheet(data.sheetNames[0]);
      }

      const parsed = parseSheetRowsToEduPlan(data.rows, currentStudent.name);
      setParseResult(parsed);
    } catch (err: any) {
      console.error('Sheet load error:', err);
      setErrorMsg(
        err.message ||
          '스프레드시트를 불러오는 중 오류가 발생했습니다. 권한 설정 또는 시트 형식을 확인해 주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Preset demo spreadsheet loader for instant testing
  const handleLoadDemoSheet = () => {
    const demoSubjects: SubjectData[] = [
      {
        id: `sheet-demo-1`,
        name: '국어',
        prevScore: 82,
        currentMidterm: 86,
        currentFinal: 88,
        gradeRank: 2,
        weeklyStudyHours: 5,
        targetScore: 92,
        category: '국어',
      },
      {
        id: `sheet-demo-2`,
        name: '수학',
        prevScore: 74,
        currentMidterm: 78,
        currentFinal: 80,
        gradeRank: 3,
        weeklyStudyHours: 11,
        targetScore: 90,
        category: '수학',
      },
      {
        id: `sheet-demo-3`,
        name: '영어',
        prevScore: 79,
        currentMidterm: 82,
        currentFinal: 85,
        gradeRank: 3,
        weeklyStudyHours: 7,
        targetScore: 90,
        category: '영어',
      },
      {
        id: `sheet-demo-4`,
        name: '한국사',
        prevScore: 85,
        currentMidterm: 90,
        currentFinal: 92,
        gradeRank: 1,
        weeklyStudyHours: 3,
        targetScore: 95,
        category: '사회',
      },
      {
        id: `sheet-demo-5`,
        name: '통합사회',
        prevScore: 80,
        currentMidterm: 84,
        currentFinal: 86,
        gradeRank: 2,
        weeklyStudyHours: 4,
        targetScore: 90,
        category: '사회',
      },
      {
        id: `sheet-demo-6`,
        name: '통합과학',
        prevScore: 71,
        currentMidterm: 75,
        currentFinal: 79,
        gradeRank: 4,
        weeklyStudyHours: 6,
        targetScore: 88,
        category: '과학',
      },
    ];

    setSheetUrl('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
    setSpreadsheetTitle('2026학년도 1학기 내신 성적 및 학습시간 관리대장 (샘플)');
    setAvailableSheets(['성적데이터', '학습시간분석']);
    setSelectedSheet('성적데이터');
    setParseResult({
      type: 'subjects',
      subjects: demoSubjects,
    });
    setErrorMsg(null);
  };

  // Apply to current student
  const handleApplyToCurrent = () => {
    if (parseResult?.subjects && parseResult.subjects.length > 0) {
      onApplySubjects(parseResult.subjects);
      onClose();
    }
  };

  // Register as new student
  const handleCreateNewStudentFromSheet = (studentData?: StudentProfile) => {
    if (studentData) {
      onAddNewStudent(studentData);
      onClose();
      return;
    }

    if (parseResult?.subjects && parseResult.subjects.length > 0) {
      const newSt: StudentProfile = {
        ...currentStudent,
        id: `student-sheet-${Date.now()}`,
        name: `${spreadsheetTitle.slice(0, 8)} 학생`,
        subjects: parseResult.subjects,
        counselingAnalysis: undefined,
      };
      onAddNewStudent(newSt);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Google 스프레드시트 데이터 연동
              </h3>
              <p className="text-xs text-slate-500">
                스프레드시트 링크를 입력하면 과목별 성적, 등급, 학습시간을 자동으로 분석하여 차트에 반영합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Google Auth Status Banner */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                {user ? (
                  <span className="font-semibold text-slate-800">
                    Google 계정 연결됨: <span className="text-indigo-600">{user.email}</span>
                  </span>
                ) : (
                  <span className="text-slate-600">
                    비공개 문서 조회는 Google 로그인이 필요하며, 공개 문서는 링크만으로 즉시 조회 가능합니다.
                  </span>
                )}
              </div>
            </div>

            {user ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-md font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <span>Google 계정 로그인</span>
              </button>
            )}
          </div>

          {/* Link Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-indigo-600" />
                <span>Google 스프레드시트 링크 입력</span>
              </label>

              {/* Sample test button */}
              <button
                type="button"
                onClick={handleLoadDemoSheet}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline inline-flex items-center gap-1 text-xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>예시 성적표 서식으로 즉시 테스트</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
              />
              <button
                onClick={() => handleLoadSheet()}
                disabled={isLoading || !sheetUrl.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50 shrink-0"
              >
                {isLoading ? '불러오는 중...' : '데이터 가져오기'}
              </button>
            </div>

            <div className="flex items-start gap-1 text-[11px] text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
              <span>
                권장 시트 열 제목: <strong>과목명, 전학기, 중간고사, 기말고사, 내신등급, 주당공부시간, 목표점수</strong> (순서 무관 자동 인식)
              </span>
            </div>
          </div>

          {/* Sheet Tab Picker (if multiple sheets found) */}
          {availableSheets.length > 1 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="font-semibold text-slate-700">시트 탭 선택:</span>
              <select
                aria-label="스프레드시트 탭 선택"
                value={selectedSheet}
                onChange={(e) => {
                  setSelectedSheet(e.target.value);
                  handleLoadSheet(sheetUrl, e.target.value);
                }}
                className="border border-slate-200 rounded px-2 py-1 bg-white text-xs font-medium"
              >
                {availableSheets.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parseResult && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-emerald-600" />
                  <span>인식된 데이터 미리보기: {spreadsheetTitle}</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  {parseResult.type === 'subjects'
                    ? `${parseResult.subjects?.length}개 과목 인식 완료`
                    : `${parseResult.students?.length}명 학생 데이터 인식 완료`}
                </span>
              </div>

              {/* Case 1: Subject list for single student */}
              {parseResult.type === 'subjects' && parseResult.subjects && (
                <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-48">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                      <tr>
                        <th className="py-2 px-3">과목명</th>
                        <th className="py-2 px-3 text-right">전학기</th>
                        <th className="py-2 px-3 text-right">중간고사</th>
                        <th className="py-2 px-3 text-right">기말고사</th>
                        <th className="py-2 px-3 text-center">내신 등급</th>
                        <th className="py-2 px-3 text-right">주당 학습시간</th>
                        <th className="py-2 px-3 text-right">목표 점수</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parseResult.subjects.map((sub, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-900">{sub.name}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{sub.prevScore}점</td>
                          <td className="py-2 px-3 text-right tabular-nums">{sub.currentMidterm}점</td>
                          <td className="py-2 px-3 text-right font-bold text-indigo-700 tabular-nums">
                            {sub.currentFinal}점
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-slate-800">
                            {sub.gradeRank}등급
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums">{sub.weeklyStudyHours}시간</td>
                          <td className="py-2 px-3 text-right font-medium text-emerald-700 tabular-nums">
                            {sub.targetScore}점
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Case 2: Multi-student roster */}
              {parseResult.type === 'students' && parseResult.students && (
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-500">
                    스프레드시트에 여러 학생 명단이 감지되었습니다. 등록할 학생을 선택해 주세요.
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    {parseResult.students.map((st, i) => (
                      <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <strong className="text-slate-900">{st.name}</strong>{' '}
                          <span className="text-slate-500">({st.grade})</span>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            과목: {st.subjects.map((s) => `${s.name}(${s.currentFinal}점)`).join(', ')}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCreateNewStudentFromSheet(st)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                        >
                          이 학생으로 등록
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {currentStudent ? (
              <span>현재 선택된 학생: <strong>{currentStudent.name}</strong> ({currentStudent.grade})</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-xs transition-colors"
            >
              닫기
            </button>

            {parseResult?.type === 'subjects' && (
              <>
                <button
                  onClick={() => handleCreateNewStudentFromSheet()}
                  className="px-3.5 py-2 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-semibold text-xs transition-colors"
                >
                  새 학생으로 등록
                </button>
                <button
                  onClick={handleApplyToCurrent}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>현재 학생({currentStudent.name}) 성적표에 적용</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
