import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, UserSettings } from '../types/quiz';
import {
   gradeQuizSubmission,
  lockSelectedAnswer,
} from '../utils/quizAnalytics';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

interface QuizSessionViewProps {
  quiz: Quiz;
  settings: UserSettings;
  onCompleteQuiz: (attempt: QuizAttempt) => void;
  onCancelQuiz: () => void;
}

export const QuizSessionView: React.FC<QuizSessionViewProps> = ({
  quiz,
  settings,
  onCompleteQuiz,
  onCancelQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number | null>
  >({});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<
    Record<string, boolean>
  >({});
  const [revealedQuestions, setRevealedQuestions] = useState<
    Record<string, boolean>
  >({});
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const totalTimeLimit =
    settings.timerEnabled ? totalQuestions * settings.secondsPerQuestion : 0;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (currentQuestion) {
        setQuestionTimes((prev) => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
        }));
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentQuestion]);

  const handleSelectOption = (optionIdx: number) => {
    if (!currentQuestion) return;
    if (
      selectedAnswers[currentQuestion.id] !== undefined &&
      selectedAnswers[currentQuestion.id] !== null
    ) {
      return;
    }

    setSelectedAnswers((prev) =>
      lockSelectedAnswer(prev, currentQuestion.id, optionIdx)
    );

    if (settings.instantFeedback) {
      setRevealedQuestions((prev) => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
    }
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleFinish = () => {
    const attempt = gradeQuizSubmission(
      quiz,
      selectedAnswers,
      questionTimes,
      flaggedQuestions
    );
    onCompleteQuiz(attempt);
  };

  const answeredCount = Object.values(selectedAnswers).filter(
    (v) => v !== null && v !== undefined
  ).length;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isRevealed = Boolean(
    currentQuestion && revealedQuestions[currentQuestion.id]
  );
  const currentSelected = currentQuestion
    ? selectedAnswers[currentQuestion.id] ?? null
    : null;

  return (
    <div className="space-y-6">
      {/* Top Session Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{quiz.subject}</span>
            <span aria-hidden="true">·</span>
            <span>{quiz.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span>{quiz.sourceName}</span>
          </div>
          <h1 className="font-display text-xl font-bold text-slate-900">
            {quiz.title}
          </h1>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {formatTimer(elapsedSeconds)}
              {totalTimeLimit > 0 ? ` / ${formatTimer(totalTimeLimit)}` : ''}
            </span>
          </div>

          <button
            type="button"
            onClick={onCancelQuiz}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Exit Session
          </button>
        </div>
      </section>

      {/* Progress Bar & Question Navigator */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 font-mono tabular-nums">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="font-mono tabular-nums text-slate-500">
            {answeredCount} of {totalQuestions} Answered (
            {Math.round((answeredCount / totalQuestions) * 100)}%)
          </span>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-600 transition-transform duration-200 origin-left"
            style={{
              transform: `scaleX(${(currentIndex + 1) / totalQuestions})`,
            }}
          />
        </div>

        <div
          role="navigation"
          aria-label="Question Navigator"
          className="flex flex-wrap items-center gap-2 pt-1"
        >
          {quiz.questions.map((q, idx) => {
            const isAnswered =
              selectedAnswers[q.id] !== undefined &&
              selectedAnswers[q.id] !== null;
            const isCurrent = idx === currentIndex;
            const isFlagged = Boolean(flaggedQuestions[q.id]);

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to Question ${idx + 1}${
                  isAnswered ? ' (Answered)' : ''
                }${isFlagged ? ' (Flagged)' : ''}`}
                className={`w-8 h-8 rounded-lg text-xs font-mono tabular-nums font-semibold transition-colors cursor-pointer flex items-center justify-center border ${
                  isCurrent
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : isFlagged
                      ? 'border-amber-400 bg-amber-50 text-amber-800'
                      : isAnswered
                        ? 'border-sky-200 bg-sky-50 text-sky-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Question Card */}
      {currentQuestion && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Subtopic: {currentQuestion.subtopic}</span>
                {currentQuestion.cognitiveLevel && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Cognitive Tier: {currentQuestion.cognitiveLevel}</span>
                  </>
                )}
              </div>
              <h2
                data-testid="active-question-stem"
                className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug"
              >
                {currentQuestion.question}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleToggleFlag}
              aria-pressed={Boolean(flaggedQuestions[currentQuestion.id])}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors shrink-0 cursor-pointer ${
                flaggedQuestions[currentQuestion.id]
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>
                {flaggedQuestions[currentQuestion.id] ? 'Flagged' : 'Flag Review'}
              </span>
            </button>
          </div>

          {/* Options List */}
          <div
            role="radiogroup"
            aria-label={`Answer choices for Question ${currentIndex + 1}`}
            className="space-y-3"
          >
            {currentQuestion.options.map((optionText, optIdx) => {
              const optionLetter = String.fromCharCode(65 + optIdx);
              const isSelected = currentSelected === optIdx;
              const isQuestionLocked = currentSelected !== null;
              const isCorrectOption =
                optIdx === currentQuestion.correctAnswerIndex;

              let borderStyle = isQuestionLocked
                ? 'border-slate-200 bg-slate-50/50 text-slate-500'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800';
              if (isRevealed) {
                if (isCorrectOption) {
                  borderStyle =
                    'border-emerald-600 bg-emerald-50/70 text-emerald-950';
                } else if (isSelected && !isCorrectOption) {
                  borderStyle = 'border-rose-500 bg-rose-50/70 text-rose-950';
                }
              } else if (isSelected) {
                borderStyle = 'border-sky-600 bg-sky-50/70 text-slate-900';
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isQuestionLocked}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                    isQuestionLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                  } ${borderStyle}`}
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`w-6 h-6 rounded-md text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="text-sm leading-relaxed">{optionText}</span>
                  </div>

                  {isRevealed && isCorrectOption && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct</span>
                    </span>
                  )}
                  {isRevealed && isSelected && !isCorrectOption && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 shrink-0">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Feedback Explanation Box */}
          {currentSelected !== null && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              {!isRevealed ? (
                <button
                  type="button"
                  onClick={() =>
                    setRevealedQuestions((prev) => ({
                      ...prev,
                      [currentQuestion.id]: true,
                    }))
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Check Answer & View Conceptual Explanation</span>
                </button>
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-900">
                    {currentSelected === currentQuestion.correctAnswerIndex
                      ? '● Correct Answer — Conceptual Rationale'
                      : `▲ Review Needed — Option ${String.fromCharCode(
                          65 + currentQuestion.correctAnswerIndex
                        )} is Correct`}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer Navigation Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            <div className="flex items-center gap-3">
              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Submit Quiz ({answeredCount}/{totalQuestions})
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
