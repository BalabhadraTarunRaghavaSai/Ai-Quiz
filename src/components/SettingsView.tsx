import React, { useState } from 'react';
import { DifficultyLevel, UserSettings } from '../types/quiz';
import { CheckCircle2, RotateCcw, Download } from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onSaveSettings: (updated: UserSettings) => void;
  onResetDemoData: () => void;
  onExportData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDemoData,
  onExportData,
}) => {
  const [formState, setFormState] = useState<UserSettings>(settings);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formState);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <section className="pb-6 border-b border-slate-200 space-y-1.5">
        <div className="text-xs text-slate-500">
          Workspace Preferences & Calibration
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
          Learning & Assessment Settings
        </h1>
        <p className="text-sm text-slate-600">
          Customize default quiz generation parameters, pacing timers, instant explanation behavior, and mastery target thresholds.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Student Profile & Mastery Targets */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              1. Student Profile & Mastery Goals
            </h2>
            <p className="text-xs text-slate-500">
              Personalize your workspace header and the target accuracy line on your Dashboard improvement chart
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="settings-student-name"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Student Name
              </label>
              <input
                id="settings-student-name"
                type="text"
                required
                value={formState.studentName}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    studentName: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="settings-academic-focus"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Primary Academic Focus / Major
              </label>
              <input
                id="settings-academic-focus"
                type="text"
                required
                value={formState.academicFocus}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    academicFocus: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label
                  htmlFor="settings-target-accuracy"
                  className="font-semibold text-slate-800"
                >
                  Target Accuracy Goal: {formState.targetAccuracyPercentage}%
                </label>
                <span className="font-mono tabular-nums text-emerald-700">
                  Dashboard Goal Line
                </span>
              </div>
              <input
                id="settings-target-accuracy"
                type="range"
                min={60}
                max={100}
                step={5}
                value={formState.targetAccuracyPercentage}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    targetAccuracyPercentage: Number(e.target.value),
                  }))
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label
                  htmlFor="settings-weekly-goal"
                  className="font-semibold text-slate-800"
                >
                  Weekly Quiz Target: {formState.weeklyQuizGoal} quizzes/week
                </label>
                <span className="font-mono tabular-nums text-slate-500">
                  Study Cadence
                </span>
              </div>
              <input
                id="settings-weekly-goal"
                type="range"
                min={1}
                max={15}
                step={1}
                value={formState.weeklyQuizGoal}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    weeklyQuizGoal: Number(e.target.value),
                  }))
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Default Quiz Generator Parameters */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              2. Default Quiz Generation & Session Preferences
            </h2>
            <p className="text-xs text-slate-500">
              Pre-populate your preferred difficulty tier, question count, and feedback mode when creating new quizzes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="settings-default-difficulty"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Default Difficulty Level
              </label>
              <select
                id="settings-default-difficulty"
                value={formState.defaultDifficulty}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    defaultDifficulty: e.target.value as DifficultyLevel,
                  }))
                }
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
              >
                <option value="Beginner">Beginner (Foundational Recall)</option>
                <option value="Intermediate">
                  Intermediate (Conceptual Application)
                </option>
                <option value="Advanced">Advanced (Analytical Synthesis)</option>
                <option value="Exam Prep">Exam Prep (Midterm Simulation)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="settings-default-count"
                className="block text-xs font-semibold text-slate-800 mb-1.5"
              >
                Default Question Count ({formState.defaultQuestionCount} questions)
              </label>
              <input
                id="settings-default-count"
                type="number"
                min={3}
                max={12}
                value={formState.defaultQuestionCount}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    defaultQuestionCount: Math.max(
                      3,
                      Math.min(12, Number(e.target.value) || 5)
                    ),
                  }))
                }
                className="w-full px-3.5 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.instantFeedback}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    instantFeedback: e.target.checked,
                  }))
                }
                className="mt-0.5 accent-sky-600 rounded"
              />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Show Instant Conceptual Explanations During Quiz
                </div>
                <div className="text-xs text-slate-500">
                  Immediately reveal whether an answer choice is correct along with the rationale as soon as you select an option.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.timerEnabled}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    timerEnabled: e.target.checked,
                  }))
                }
                className="mt-0.5 accent-sky-600 rounded"
              />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Enable Pacing Target Timer ({formState.secondsPerQuestion}s per question)
                </div>
                <div className="text-xs text-slate-500">
                  Display a target duration benchmark alongside elapsed time during active quiz sessions.
                </div>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {savedNotice && (
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Preferences saved and applied across workspace</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </section>
      </form>

      {/* Section 3: Data Management & Export */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-display text-base font-bold text-slate-900">
            Study History & Data Portability
          </h2>
          <p className="text-xs text-slate-500">
            Export your complete quiz analytics history as JSON or restore the default demonstration dataset.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onExportData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics JSON</span>
          </button>

          <button
            type="button"
            onClick={onResetDemoData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Default Demo Data</span>
          </button>
        </div>
      </section>
    </div>
  );
};
