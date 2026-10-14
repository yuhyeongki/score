import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { Printer, Copy, Check, MessageSquare, Send, Award, Calendar, Phone, User, FileText } from 'lucide-react';

interface ParentReportTabProps {
  student: StudentProfile;
  onPrint: () => void;
}

export const ParentReportTab: React.FC<ParentReportTabProps> = ({ student, onPrint }) => {
  const [copied, setCopied] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);
  const [customNoticeText, setCustomNoticeText] = useState(
    student.counselingAnalysis?.parentNotice ||
      `[에듀 플랜 성적 상담 안내]\n\n${student.parentName} 학부모님, 안녕하십니까.\n이번 학기 ${student.name} 학생의 성적 분석 및 맞춤형 학습 상담 결과를 안내드립니다.\n\n${student.name} 학생의 과목별 성적 및 주당 학습 시간 분석표와 주간 실천 계획표가 수립되었습니다.\n가정에서도 학생이 세운 계획을 잘 지켜나갈 수 있도록 따뜻한 칭찬과 격려 부탁드립니다.\n감사합니다.`
  );
  const [noticeChannel, setNoticeChannel] = useState<'sms' | 'chat'>('sms');

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(customNoticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateSend = () => {
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 4000);
  };

  const avgFinal = Math.round(
    student.subjects.reduce((sum, s) => sum + s.currentFinal, 0) / (student.subjects.length || 1)
  );
  const avgPrev = Math.round(
    student.subjects.reduce((sum, s) => sum + s.prevScore, 0) / (student.subjects.length || 1)
  );
  const avgDiff = avgFinal - avgPrev;
  const totalWeeklyHours = student.subjects.reduce((sum, s) => sum + s.weeklyStudyHours, 0);

  return (
    <div className="space-y-6">
      
      {/* 1. Parent Notification Sender Tool (No-Print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>학부모 상담 알림 발송 센터</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              상담 내용과 주요 성취 사항을 학부모님께 문자(SMS/카카오톡) 또는 Google Chat 메시지로 즉시 전송합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNoticeChannel('sms')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                noticeChannel === 'sms'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              알림톡 / 문자 양식
            </button>
            <button
              onClick={() => setNoticeChannel('chat')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                noticeChannel === 'chat'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Google Chat / 메신저 양식
            </button>
          </div>
        </div>

        {/* Recipient Details & Message Input */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <strong>수신 학부모:</strong> {student.parentName} 님
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <strong>연락처:</strong> {student.parentPhone}
            </span>
            <span className="text-slate-400">
              (학생: {student.name} · {student.grade})
            </span>
          </div>

          <textarea
            aria-label="학부모 알림 메시지 내용"
            rows={5}
            value={customNoticeText}
            onChange={(e) => setCustomNoticeText(e.target.value)}
            className="w-full text-xs sm:text-sm text-slate-800 bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            placeholder="학부모님께 전달할 상담 메시지 내용..."
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-500">
              ※ 메시지 수정 후 복사하거나 발송을 기록할 수 있습니다.
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyNotice}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>메시지 복사</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSimulateSend}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{noticeChannel === 'sms' ? '알림톡 발송 완료' : 'Google Chat 전송'}</span>
              </button>
            </div>
          </div>

          {sentNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                학부모({student.parentName} 님 / {student.parentPhone})께 상담 알림이 정상적으로 전송/기록되었습니다.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Official Printable Report Card (Printable via window.print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs print-card">
        
        {/* Printable Card Actions (Top bar inside card, hidden on print) */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 no-print">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              정밀 상담 리포트 카드 (인쇄 / PDF 서식)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              공식 학부모 상담 통지표 양식입니다. 아래 인쇄 버튼을 누르면 용지 여백에 맞춘 정밀 인쇄 및 PDF 저장이 가능합니다.
            </p>
          </div>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>이 리포트 인쇄 / PDF 저장</span>
          </button>
        </div>

        {/* Printable Document Body Starts */}
        <div className="space-y-6 text-slate-900">
          
          {/* Header of the Official Report */}
          <div className="text-center border-b-2 border-slate-800 pb-5">
            <span className="text-xs tracking-widest text-slate-500 font-semibold uppercase">
              EduPlan Academic Consulting Report
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-1">
              개인 맞춤형 학업 성취도 및 성적 향상 컨설팅 통지표
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              발행일자: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} · 상담기관: 에듀 플랜 학습코칭센터
            </p>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-slate-300 rounded-md p-3 bg-slate-50/50">
            <div>
              <span className="text-slate-500 block">학생 성명</span>
              <strong className="text-slate-900 text-sm">{student.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">소속 학교 / 학년</span>
              <span className="font-semibold text-slate-800">{student.schoolName} ({student.grade})</span>
            </div>
            <div>
              <span className="text-slate-500 block">학부모 성함</span>
              <span className="font-semibold text-slate-800">{student.parentName} 님</span>
            </div>
            <div>
              <span className="text-slate-500 block">담당 컨설턴트</span>
              <span className="font-semibold text-indigo-700">{student.counselorName}</span>
            </div>
          </div>

          {/* Goal Roadmap */}
          <div className="text-xs bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-md flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>설정 목표: </strong>{student.targetGoal}
            </span>
          </div>

          {/* Section: Academic Score Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2 border-l-3 border-indigo-600 pl-2">
              1. 교과목별 학업 성취도 및 내신 등급 현황
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="py-2 px-3">과목명</th>
                    <th className="py-2 px-3 text-right">전학기 점수</th>
                    <th className="py-2 px-3 text-right">이번 중간</th>
                    <th className="py-2 px-3 text-right">이번 기말</th>
                    <th className="py-2 px-3 text-center">내신 등급</th>
                    <th className="py-2 px-3 text-right">주당 학습시간</th>
                    <th className="py-2 px-3 text-right">차기 목표점수</th>
                    <th className="py-2 px-3 text-center">전학기 대비</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {student.subjects.map((sub) => {
                    const diff = sub.currentFinal - sub.prevScore;
                    return (
                      <tr key={sub.id}>
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
                        <td className="py-2 px-3 text-center font-semibold text-xs tabular-nums">
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Summary row */}
                  <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                    <td className="py-2 px-3">평균 / 합계</td>
                    <td className="py-2 px-3 text-right tabular-nums">{avgPrev}점</td>
                    <td className="py-2 px-3 text-right tabular-nums">-</td>
                    <td className="py-2 px-3 text-right text-indigo-700 tabular-nums">{avgFinal}점</td>
                    <td className="py-2 px-3 text-center">-</td>
                    <td className="py-2 px-3 text-right tabular-nums">{totalWeeklyHours}시간</td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {Math.round(student.subjects.reduce((sum, s) => sum + s.targetScore, 0) / student.subjects.length)}점
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums">
                      {avgDiff > 0 ? `+${avgDiff}` : avgDiff}점
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Counseling Diagnosis */}
          {student.counselingAnalysis && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 border-l-3 border-indigo-600 pl-2">
                  2. 전문 상담 종합 평가 소견 (AI 입시 분석)
                </h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs leading-relaxed text-slate-800">
                  {student.counselingAnalysis.overallSummary}
                </div>
              </div>

              {/* Subject action plans */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 border-l-3 border-indigo-600 pl-2">
                  3. 주요 과목별 핵심 성적 도약 전략
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {student.counselingAnalysis.subjectStrategies.slice(0, 4).map((strat, i) => (
                    <div key={i} className="border border-slate-200 rounded-md p-2.5 text-xs bg-white">
                      <div className="font-bold text-indigo-800 mb-1">
                        {strat.subject} (권장: 주 {strat.recommendedWeeklyHours}시간)
                      </div>
                      <p className="text-[11px] text-slate-700 leading-normal">
                        {strat.actionPlan}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice for parents */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 border-l-3 border-indigo-600 pl-2">
                  4. 가정 내 연계 지도 권장 사항 (학부모 지도 가이드)
                </h4>
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md text-xs leading-relaxed text-amber-950">
                  <p className="mb-1">
                    • 학생이 수립한 <strong>주간 시간표와 일일 실천 루틴</strong>이 흔들림 없이 정착되도록 자율성을 존중해 주시기 바랍니다.
                  </p>
                  <p className="mb-1">
                    • 자습 시간 동안에는 스마트폰 및 미디어 기기를 학습 공간과 물리적으로 분리할 수 있도록 가정 내 협조를 부탁드립니다.
                  </p>
                  <p>
                    • 틀린 문제에 대해 즉각적인 질책보다는 오답을 정리하는 메타인지 과정을 칭찬해 주실 때 학습 동기가 극대화됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Official Seal / Signature Area */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span>에듀 플랜 학습코칭센터 대표 / 상담 수석컨설턴트</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-800">{student.counselorName}</span>
              <div className="w-12 h-12 rounded-full border-2 border-rose-600 text-rose-600 flex items-center justify-center font-bold text-[10px] transform rotate-12">
                (인증인)
              </div>
            </div>
          </div>

        </div>
        {/* Printable Document Body Ends */}

      </div>

    </div>
  );
};
