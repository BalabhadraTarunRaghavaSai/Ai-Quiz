import React from 'react';
import { Quiz, QuizAttempt, UserSettings } from '../types/quiz';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface QuizResultsViewProps {
  attempt: QuizAttempt;
  quiz?: Quiz;
  settings: UserSettings;
  onRetakeQuiz: (quizId: string) => void;
  onPracticeMissedQuestions: (quiz: Quiz, missedQuestionIds: string[]) => void;
  onBackToDashboard: () => void;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  attempt,
  quiz,
  settings,
  onRetakeQuiz,
  onPracticeMissedQuestions,
  onBackToDashboard,
}) => {
  const metGoal = attempt.scorePercentage >= settings.targetAccuracyPercentage;
  const missedResponses = attempt.responses.filter((r) => !r.isCorrect);
  const missedIds = missedResponses.map((r) => r.questionId);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header Summary Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Assessment Complete</span>
              <span aria-hidden="true">·</span>
              <span>{attempt.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{attempt.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>
                {attempt.sourceType === 'pdf'
                  ? 'PDF Lecture Notes'
                  : 'Topic Description'}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              {attempt.quizTitle}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Analytics Dashboard</span>
            </button>

            {quiz && missedIds.length > 0 && (
              <button
                type="button"
                onClick={() => onPracticeMissedQuestions(quiz, missedIds)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Practice {missedIds.length} Missed Questions</span>
              </button>
            )}

            {quiz && (
              <button
                type="button"
                onClick={() => onRetakeQuiz(quiz.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Full Quiz</span>
              </button>
            )}
          </div>
        </div>

        {/* 4-Column Score Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="text-xs text-slate-500">Final Score Accuracy</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                data-testid="result-score-percentage"
                className="font-mono tabular-nums text-3xl font-bold text-slate-900"
              >
                {attempt.scorePercentage}%
              </span>
              <span
                className={`text-xs font-mono font-semibold ${
                  metGoal ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {metGoal
                  ? `● MET ${settings.targetAccuracyPercentage}% GOAL`
                  : `○ TARGET ${settings.targetAccuracyPercentage}%`}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Correct Responses</div>
            <div className="font-mono tabular-nums text-3xl font-bold text-slate-900 mt-1">
              {attempt.correctCount} / {attempt.totalQuestions}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Total Study Time</div>
            <div className="font-mono tabular-nums text-3xl font-bold text-slate-900 mt-1">
              {formatDuration(attempt.durationSeconds)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Avg. Pace per Question</div>
            <div className="font-mono tabular-nums text-3xl font-bold text-slate-900 mt-1">
              {Math.round(
                attempt.durationSeconds / Math.max(1, attempt.totalQuestions)
              )}
              s
            </div>
          </div>
        </div>

        {/* Subtopic Accuracy Breakdown */}
        {Object.keys(attempt.subtopicScores || {}).length > 0 && (
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h2 className="text-xs font-semibold text-slate-900">
              Subtopic Performance Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-1">
              {Object.entries(attempt.subtopicScores).map(([sub, stat]) => {
                const pct = Math.round((stat.correct / stat.total) * 100);
                return (
                  <div
                    key={sub}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate pr-2">
                        {sub}
                      </span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 80
                            ? 'bg-emerald-600'
                            : pct >= 60
                              ? 'bg-sky-600'
                              : 'bg-amber-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-500">
                      {stat.correct} of {stat.total} correct
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Detailed Question-by-Question Review */}
      {quiz && quiz.questions.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          <div className="p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Question-by-Question Conceptual Review
            </h2>
            <p className="text-xs text-slate-500">
              Compare your selected responses against the solution key and study explanations
            </p>
          </div>

          {quiz.questions.map((q, idx) => {
            const resp = attempt.responses.find((r) => r.questionId === q.id);
            const selectedIdx = resp ? resp.selectedOptionIndex : null;
            const isCorrect = selectedIdx === q.correctAnswerIndex;

            return (
              <div key={q.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono tabular-nums font-semibold text-slate-800">
                        Question {idx + 1}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{q.subtopic}</span>
                      {resp && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {resp.timeSpentSeconds}s spent
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      {q.question}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                      isCorrect ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>
                          {selectedIdx === null ? 'Unanswered' : 'Incorrect'}
                        </span>
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isUserChoice = selectedIdx === optIdx;
                    const isRightAnswer = q.correctAnswerIndex === optIdx;

                    let style = 'border-slate-200 bg-white text-slate-600';
                    if (isRightAnswer) {
                      style =
                        'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium';
                    } else if (isUserChoice && !isRightAnswer) {
                      style =
                        'border-rose-400 bg-rose-50/70 text-rose-950 font-medium';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border flex items-start justify-between gap-2 ${style}`}
                      >
                        <span>
                          <strong className="font-mono mr-2">
                            {String.fromCharCode(65 + optIdx)}.
                          </strong>
                          {opt}
                        </span>
                        {isRightAnswer && (
                          <span className="text-[11px] font-mono text-emerald-700 shrink-0">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isUserChoice && !isRightAnswer && (
                          <span className="text-[11px] font-mono text-rose-700 shrink-0">
                            ✗ Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Explanation: </strong>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};
