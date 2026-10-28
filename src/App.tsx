import React, { useState, useEffect, useMemo } from 'react';
import {
  GenerationSource,
  Quiz,
  QuizAttempt,
  UserSettings,
} from './types/quiz';
import {
  DEFAULT_USER_SETTINGS,
  SEED_QUIZ_ATTEMPTS,
  SEED_QUIZZES,
} from './data/seedQuizzes';
import { computeAnalyticsSummary } from './utils/quizAnalytics';
import { ActiveTab, TopBar } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { QuizGeneratorView } from './components/QuizGeneratorView';
import { QuizSessionView } from './components/QuizSessionView';
import { QuizResultsView } from './components/QuizResultsView';
import { QuizLibraryView } from './components/QuizLibraryView';
import { SettingsView } from './components/SettingsView';

const STORAGE_KEYS = {
  QUIZZES: 'scholarpulse_quizzes_v1',
  ATTEMPTS: 'scholarpulse_attempts_v1',
  SETTINGS: 'scholarpulse_settings_v1',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [generatorInitialMode, setGeneratorInitialMode] =
    useState<GenerationSource>('pdf');

  // Persistent State initialized with deterministic seed data
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to seed
    }
    return SEED_QUIZZES;
  });

  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to seed
    }
    return SEED_QUIZ_ATTEMPTS;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_USER_SETTINGS;
  });

  // Active Quiz Session or Results Review State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [reviewingAttempt, setReviewingAttempt] = useState<QuizAttempt | null>(
    null
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    } catch {
      // Ignore storage quota errors
    }
  }, [quizzes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    } catch {
      // Ignore storage quota errors
    }
  }, [attempts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  const analytics = useMemo(
    () => computeAnalyticsSummary(attempts, settings.targetAccuracyPercentage),
    [attempts, settings.targetAccuracyPercentage]
  );

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveQuiz(null);
    setReviewingAttempt(null);
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  };

  const handleStartCreateQuiz = (mode: GenerationSource) => {
    setActiveQuiz(null);
    setReviewingAttempt(null);
    setGeneratorInitialMode(mode);
    setActiveTab('generate');
    window.scrollTo({ top: 0 });
  };

  const handleQuizGenerated = (newQuiz: Quiz, startImmediately: boolean) => {
    setQuizzes((prev) => [newQuiz, ...prev]);
    if (startImmediately) {
      setReviewingAttempt(null);
      setActiveQuiz(newQuiz);
    } else {
      setActiveQuiz(null);
      setReviewingAttempt(null);
      setActiveTab('library');
    }
    window.scrollTo({ top: 0 });
  };

  const handleStartExistingQuiz = (quizId: string) => {
    const found = quizzes.find((q) => q.id === quizId);
    if (found) {
      setReviewingAttempt(null);
      setActiveQuiz(found);
      window.scrollTo({ top: 0 });
    }
  };

  const handleCompleteQuiz = (attempt: QuizAttempt) => {
    setAttempts((prev) => [...prev, attempt]);
    setActiveQuiz(null);
    setReviewingAttempt(attempt);
    window.scrollTo({ top: 0 });
  };

  const handlePracticeMissedQuestions = (
    sourceQuiz: Quiz,
    missedQuestionIds: string[]
  ) => {
    const filteredQuestions = sourceQuiz.questions.filter((q) =>
      missedQuestionIds.includes(q.id)
    );
    if (filteredQuestions.length === 0) return;

    const remediationQuiz: Quiz = {
      ...sourceQuiz,
      id: `${sourceQuiz.id}-remediation-${Date.now()}`,
      title: `${sourceQuiz.title} (Missed Questions Drill)`,
      questions: filteredQuestions,
      createdAt: new Date().toISOString(),
    };

    setQuizzes((prev) => [remediationQuiz, ...prev]);
    setReviewingAttempt(null);
    setActiveQuiz(remediationQuiz);
  };

  const handleDeleteQuiz = (quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
  };

  const handleResetDemoData = () => {
    setQuizzes(SEED_QUIZZES);
    setAttempts(SEED_QUIZ_ATTEMPTS);
    setSettings(DEFAULT_USER_SETTINGS);
    setActiveQuiz(null);
    setReviewingAttempt(null);
    setActiveTab('dashboard');
  };

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings,
      analytics,
      quizzes,
      attempts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholarpulse-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onNewQuizClick={() => handleStartCreateQuiz('pdf')}
      />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8">
        {activeQuiz ? (
          <QuizSessionView
            quiz={activeQuiz}
            settings={settings}
            onCompleteQuiz={handleCompleteQuiz}
            onCancelQuiz={() => setActiveQuiz(null)}
          />
        ) : reviewingAttempt ? (
          <QuizResultsView
            attempt={reviewingAttempt}
            quiz={quizzes.find((q) => q.id === reviewingAttempt.quizId)}
            settings={settings}
            onRetakeQuiz={handleStartExistingQuiz}
            onPracticeMissedQuestions={handlePracticeMissedQuestions}
            onBackToDashboard={() => {
              setReviewingAttempt(null);
              setActiveTab('dashboard');
            }}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            analytics={analytics}
            attempts={attempts}
            quizzes={quizzes}
            settings={settings}
            onStartCreateQuiz={handleStartCreateQuiz}
            onRetakeQuiz={handleStartExistingQuiz}
            onReviewAttempt={(att) => setReviewingAttempt(att)}
          />
        ) : activeTab === 'generate' ? (
          <QuizGeneratorView
            settings={settings}
            initialMode={generatorInitialMode}
            onQuizGenerated={handleQuizGenerated}
          />
        ) : activeTab === 'library' ? (
          <QuizLibraryView
            quizzes={quizzes}
            attempts={attempts}
            onStartQuiz={handleStartExistingQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onCreateNewClick={() => handleStartCreateQuiz('pdf')}
          />
        ) : (
          <SettingsView
            settings={settings}
            onSaveSettings={setSettings}
            onResetDemoData={handleResetDemoData}
            onExportData={handleExportData}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1280px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>AiQuiz Generator Academic Assessment & Mastery Analytics</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleSelectTab('dashboard')}
              className="hover:text-slate-800 cursor-pointer"
            >
              Analytics Dashboard
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleStartCreateQuiz('pdf')}
              className="hover:text-slate-800 cursor-pointer"
            >
              PDF Quiz Generator
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleSelectTab('settings')}
              className="hover:text-slate-800 cursor-pointer"
            >
              Study Preferences
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
