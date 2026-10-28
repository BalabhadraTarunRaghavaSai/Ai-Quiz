import React, { useState } from 'react';
import {
  DifficultyLevel,
  Quiz,
  QuizAttempt,
  UserSettings,
} from '../types/quiz';
import {
  AnalyticsSummary,
  filterQuizAttempts,
  formatShortDate,
} from '../utils/quizAnalytics';
import { ImprovementChart } from './ImprovementChart';
import {
  FileText,
  Sparkles,
  Search,
  ArrowUpRight,
  RotateCcw,
  Eye,
} from 'lucide-react';

interface DashboardViewProps {
  analytics: AnalyticsSummary;
  attempts: QuizAttempt[];
  quizzes: Quiz[];
  settings: UserSettings;
  onStartCreateQuiz: (initialMode: 'pdf' | 'topic') => void;
  onRetakeQuiz: (quizId: string) => void;
  onReviewAttempt: (attempt: QuizAttempt) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  attempts,
  quizzes,
  settings,
  onStartCreateQuiz,
  onRetakeQuiz,
  onReviewAttempt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<
    DifficultyLevel | 'All'
  >('All');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'pdf' | 'topic'>(
    'All'
  );

  const filteredAttempts = filterQuizAttempts(attempts, {
    searchQuery,
    difficulty: difficultyFilter,
    sourceType: sourceFilter,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Action Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Academic Workspace</span>
            <span aria-hidden="true">·</span>
            <span>{settings.studentName}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.academicFocus}</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Performance Analytics & Mastery Trajectory
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Transform lecture PDFs or study topics into adaptive assessments.
            Track longitudinal accuracy gains and target conceptual weak spots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onStartCreateQuiz('pdf')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Upload PDF Notes</span>
          </button>
          <button
            type="button"
            onClick={() => onStartCreateQuiz('topic')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Generate by Topic</span>
          </button>
        </div>
      </section>

      {/* 4-Column KPI Metrics Strip (Single-container divided grid) */}
      <section
        aria-label="Key Performance Metrics"
        className="bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200"
      >
        <div className="p-5 space-y-1.5">
          <div className="text-xs font-medium text-slate-500">
            Average Quiz Accuracy
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span
              data-testid="metric-avg-score"
              className="font-mono tabular-nums text-3xl font-bold text-slate-900"
            >
              {analytics.averageScore}%
            </span>
            <span
              className={`text-xs font-mono tabular-nums font-medium ${
                analytics.averageScore >= settings.targetAccuracyPercentage
                  ? 'text-emerald-700'
                  : 'text-amber-700'
              }`}
            >
              {analytics.averageScore >= settings.targetAccuracyPercentage
                ? '● GOAL MET'
                : `▲ TARGET ${settings.targetAccuracyPercentage}%`}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Peak Score: {analytics.highestScore}% across {analytics.totalAttempts} quizzes
          </div>
        </div>

        <div className="p-5 space-y-1.5">
          <div className="text-xs font-medium text-slate-500">
            Improvement Over Time
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span
              data-testid="metric-improvement-delta"
              className="font-mono tabular-nums text-3xl font-bold text-slate-900"
            >
              {analytics.improvementDelta >= 0
                ? `+${analytics.improvementDelta}%`
                : `${analytics.improvementDelta}%`}
            </span>
            <span
              className={`text-xs font-mono tabular-nums font-medium ${
                analytics.improvementDelta >= 0
                  ? 'text-emerald-700'
                  : 'text-rose-700'
              }`}
            >
              {analytics.improvementDelta >= 0
                ? '▲ UPWARD TREND'
                : '▼ NEEDS REVIEW'}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Recent attempts vs. baseline cohort
          </div>
        </div>

        <div className="p-5 space-y-1.5">
          <div className="text-xs font-medium text-slate-500">
            Target Goal Hit Rate
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono tabular-nums text-3xl font-bold text-slate-900">
              {analytics.goalMetRate}%
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-600">
              {analytics.goalMetCount}/{analytics.totalAttempts} Sessions
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Threshold: ≥{settings.targetAccuracyPercentage}% accuracy
          </div>
        </div>

        <div className="p-5 space-y-1.5">
          <div className="text-xs font-medium text-slate-500">
            Questions Completed
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span
              data-testid="metric-total-questions"
              className="font-mono tabular-nums text-3xl font-bold text-slate-900"
            >
              {analytics.totalQuestionsAnswered}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-600">
              {analytics.totalStudyMinutes} min active
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Weekly Goal: {analytics.totalAttempts}/{settings.weeklyQuizGoal} quizzes
          </div>
        </div>
      </section>

      {/* Primary Two-Column Analytics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (8 cols): Improvement Trajectory Chart & Subtopic Diagnostics */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Score Improvement Over Time
                </h2>
                <p className="text-xs text-slate-500">
                  Chronological quiz accuracy compared against your{' '}
                  {settings.targetAccuracyPercentage}% target mastery line
                </p>
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                {analytics.totalAttempts} Recorded Sessions
              </div>
            </div>

            <ImprovementChart
              data={analytics.trendSeries}
              targetAccuracy={settings.targetAccuracyPercentage}
            />
          </div>

          {/* Subtopic Strengths & Focus Areas divided cleanly via hairline border */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-3">
                Highest Mastery Subtopics
              </h3>
              <div className="space-y-2.5">
                {analytics.strongestSubtopics.map((item) => (
                  <div
                    key={item.subtopic}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-700 truncate pr-3">
                      {item.subtopic}
                    </span>
                    <span className="font-mono tabular-nums text-emerald-700 font-medium shrink-0">
                      {item.accuracy}% ({item.total} Qs)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-3">
                Recommended Review Subtopics
              </h3>
              <div className="space-y-2.5">
                {analytics.weakestSubtopics.map((item) => (
                  <div
                    key={item.subtopic}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-700 truncate pr-3">
                      {item.subtopic}
                    </span>
                    <span className="font-mono tabular-nums text-amber-700 font-medium shrink-0">
                      {item.accuracy}% ({item.total} Qs)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Subject Mastery & Difficulty Calibration */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Subject Mastery Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Accuracy distribution by academic discipline
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {analytics.subjectMastery.map((subj) => (
                <div key={subj.subject} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900">
                      {subj.subject}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {subj.averageScore}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-sky-600 rounded-full"
                      style={{ width: `${subj.averageScore}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                    <span>
                      {subj.attemptsCount} quizzes · {subj.questionsAnswered} Qs
                    </span>
                    <span>Best: {subj.bestScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-semibold text-slate-900">
              Performance by Difficulty Tier
            </h3>
            <div className="space-y-2">
              {analytics.difficultyBreakdown.map((tier) => (
                <div
                  key={tier.difficulty}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <span className="text-slate-600">{tier.difficulty}</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="text-slate-400">
                      {tier.attemptsCount}{' '}
                      {tier.attemptsCount === 1 ? 'attempt' : 'attempts'}
                    </span>
                    <span className="font-semibold text-slate-900 w-10 text-right">
                      {tier.attemptsCount > 0 ? `${tier.averageScore}%` : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Quiz Sessions Table with Interactive Search & Filters */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Quiz Attempt History & Review Log
            </h2>
            <p className="text-xs text-slate-500">
              Inspect past responses, conceptual explanations, or retake any generated assessment
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search quiz history"
                placeholder="Search topic or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white w-48 sm:w-56"
              />
            </div>

            {/* Interactive Segmented Source Filter */}
            <div
              role="group"
              aria-label="Filter by generation source"
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
            >
              {(
                [
                  { id: 'All', label: 'All Sources' },
                  { id: 'pdf', label: 'PDF Notes' },
                  { id: 'topic', label: 'Topic Prompt' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSourceFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    sourceFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Difficulty Filter Select */}
            <select
              aria-label="Filter by difficulty level"
              value={difficultyFilter}
              onChange={(e) =>
                setDifficultyFilter(e.target.value as DifficultyLevel | 'All')
              }
              className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-600"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Exam Prep">Exam Prep</option>
            </select>
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-medium text-slate-800">
              No matching quiz attempts found
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try clearing your active search filters or generate a new quiz from your PDF lecture notes.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDifficultyFilter('All');
                setSourceFilter('All');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                  <th className="py-3 px-6">Quiz Title & Metadata</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Questions</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                  <th className="py-3 px-4 text-right">Completed</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredAttempts.map((attempt) => {
                  const hasMatchingQuiz = quizzes.some(
                    (q) => q.id === attempt.quizId
                  );
                  const metTarget =
                    attempt.scorePercentage >= settings.targetAccuracyPercentage;

                  return (
                    <tr
                      key={attempt.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-slate-900">
                          {attempt.quizTitle}
                        </div>
                        {/* Zero-Pill Metadata Discipline: Clean unboxed inline text with middle dot separators */}
                        <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                          <span>{attempt.subject}</span>
                          <span aria-hidden="true">·</span>
                          <span>{attempt.difficulty}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {attempt.sourceType === 'pdf'
                          ? 'PDF Lecture Notes'
                          : 'Topic Description'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            metTarget
                              ? 'text-emerald-700'
                              : attempt.scorePercentage >= 70
                                ? 'text-sky-700'
                                : 'text-amber-700'
                          }`}
                        >
                          {attempt.scorePercentage}%
                        </span>
                        <span className="text-slate-400 ml-1.5 text-[11px]">
                          ({metTarget ? '● Goal' : '○ Below'})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {attempt.correctCount}/{attempt.totalQuestions}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {formatDuration(attempt.durationSeconds)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {formatShortDate(attempt.completedAt)}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onReviewAttempt(attempt)}
                            aria-label={`Review ${attempt.quizTitle}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                          {hasMatchingQuiz && (
                            <button
                              type="button"
                              onClick={() => onRetakeQuiz(attempt.quizId)}
                              aria-label={`Retake ${attempt.quizTitle}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Retake</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
