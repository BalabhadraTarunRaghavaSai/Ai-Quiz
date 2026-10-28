import React, { useState } from 'react';
import { DifficultyLevel, Quiz, QuizAttempt } from '../types/quiz';
import { formatShortDate } from '../utils/quizAnalytics';
import { Play, Plus, Search, Trash2 } from 'lucide-react';

interface QuizLibraryViewProps {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  onStartQuiz: (quizId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
  onCreateNewClick: () => void;
}

export const QuizLibraryView: React.FC<QuizLibraryViewProps> = ({
  quizzes,
  attempts,
  onStartQuiz,
  onDeleteQuiz,
  onCreateNewClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<
    DifficultyLevel | 'All'
  >('All');

  const filteredQuizzes = quizzes.filter((q) => {
    if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(term) ||
        q.subject.toLowerCase().includes(term) ||
        q.sourceName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs text-slate-500">
            Saved Assessments · {quizzes.length} Quizzes Available
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Study Quiz Library
          </h1>
          <p className="text-sm text-slate-600">
            Launch any saved PDF note assessment or topic-based practice set to measure retention over time.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNewClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Quiz</span>
        </button>
      </section>

      {/* Filters Bar */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            aria-label="Search quiz library"
            placeholder="Search library by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 w-64"
          />
        </div>

        <div
          role="group"
          aria-label="Filter library by difficulty"
          className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
        >
          {(
            ['All', 'Beginner', 'Intermediate', 'Advanced', 'Exam Prep'] as const
          ).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficultyFilter(level)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                difficultyFilter === level
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </section>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-800">
            No quizzes match your current filter
          </p>
          <p className="text-xs text-slate-500">
            Clear your search query or generate a new quiz from your PDF notes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
            const bestScore =
              quizAttempts.length > 0
                ? Math.max(...quizAttempts.map((a) => a.scorePercentage))
                : null;

            return (
              <article
                key={quiz.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  {/* Zero-Pill Metadata Discipline: Unboxed inline text with separators */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span>{quiz.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span>{quiz.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {quiz.questions.length} Qs
                    </span>
                  </div>

                  <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">
                    {quiz.title}
                  </h2>

                  <div className="text-xs text-slate-600 truncate">
                    Source: {quiz.sourceName}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="text-[11px] font-medium text-slate-500">
                      Covered Subtopics:
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {quiz.extractedTopics.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                    <span>
                      {quizAttempts.length}{' '}
                      {quizAttempts.length === 1 ? 'attempt' : 'attempts'}
                    </span>
                    <span>
                      {bestScore !== null
                        ? `Best: ${bestScore}%`
                        : `Added ${formatShortDate(quiz.createdAt)}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Start ${quiz.title}`}
                      onClick={() => onStartQuiz(quiz.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Quiz</span>
                    </button>

                    {quizzes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteQuiz(quiz.id)}
                        aria-label={`Delete ${quiz.title}`}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
