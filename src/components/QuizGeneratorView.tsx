import React, { useState, useRef } from 'react';
import {
  DifficultyLevel,
  GenerationSource,
  Quiz,
  UserSettings,
} from '../types/quiz';
import { validateGenerationRequest } from '../utils/quizAnalytics';
import {
  FileUp,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  BookOpen,
} from 'lucide-react';

interface QuizGeneratorViewProps {
  settings: UserSettings;
  initialMode?: GenerationSource;
  onQuizGenerated: (quiz: Quiz, startImmediately: boolean) => void;
}

const DIFFICULTY_DESCRIPTIONS: Record<
  DifficultyLevel,
  { tagline: string; detail: string }
> = {
  Beginner: {
    tagline: 'Foundational Recall',
    detail:
      'Core definitions, primary terminology, and direct conceptual identification.',
  },
  Intermediate: {
    tagline: 'Conceptual Application',
    detail:
      'Cause-and-effect relationships, process mechanisms, and standard problem solving.',
  },
  Advanced: {
    tagline: 'Analytical Synthesis',
    detail:
      'Multi-step reasoning, quantitative trade-offs, and subtle misconception traps.',
  },
  'Exam Prep': {
    tagline: 'Rigorous Midterm / Final Simulation',
    detail:
      'High-difficulty scenario questions integrating multiple lecture themes under exam conditions.',
  },
};

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({
  settings,
  initialMode = 'pdf',
  onQuizGenerated,
}) => {
  const [mode, setMode] = useState<GenerationSource>(initialMode);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    settings.defaultDifficulty
  );
  const [questionCount, setQuestionCount] = useState<number>(
    settings.defaultQuestionCount
  );
  const [focusAreas, setFocusAreas] = useState<string>('');

  // PDF Mode State
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfFileSize, setPdfFileSize] = useState<string>('');
  const [pdfTextContent, setPdfTextContent] = useState<string>('');
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Topic Mode State
  const [topicText, setTopicText] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');

  // Status State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setPdfFileName(file.name);
    setPdfFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    // Read base64 for Gemini multimodal PDF API
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64Clean = result.includes(',') ? result.split(',')[1] : result;
      setPdfBase64(base64Clean);
    };
    reader.readAsDataURL(file);

    // Also attempt lightweight ASCII text extraction from PDF bytes for preview & fallback
    try {
      const arrayBuf = await file.arrayBuffer();
      const rawStr = new TextDecoder('latin1').decode(
        new Uint8Array(arrayBuf).slice(0, 120000)
      );
      const readableChunks =
        rawStr
          .match(/\(([A-Za-z0-9 ,.;:?!'"-]{4,})\)/g)
          ?.map((m) => m.slice(1, -1))
          .join(' ') || '';

      setPdfTextContent(
        readableChunks.length > 40
          ? readableChunks.slice(0, 3500)
          : `Uploaded PDF document: ${file.name} (${(file.size / 1024).toFixed(1)} KB).`
      );
    } catch {
      setPdfTextContent(`Uploaded PDF document: ${file.name}`);
    }
  };

  const handleGenerate = async (startImmediately: boolean) => {
    setErrorMessage(null);

    const validation = validateGenerationRequest({
      mode,
      topicText,
      pdfFileName,
      pdfContent: pdfTextContent || pdfBase64,
      questionCount,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please complete required fields.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          topic: topicText.trim(),
          subject: subjectName.trim(),
          focusAreas: focusAreas.trim(),
          pdfFileName,
          pdfText: pdfTextContent,
          pdfBase64: pdfBase64 || undefined,
          difficulty,
          questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation request failed (${response.status})`);
      }

      const data = await response.json();
      if (!data.quiz || !Array.isArray(data.quiz.questions)) {
        throw new Error('Invalid quiz format received from server');
      }

      onQuizGenerated(data.quiz, startImmediately);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Unable to generate quiz right now. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="pb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs text-slate-500">
            AI Assessment Studio · Gemini 3.8 Flash
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Generate Custom Study Quiz
          </h1>
          <p className="text-sm text-slate-600">
            Upload your lecture notes in PDF format or describe a specific study topic with tailored difficulty calibration.
          </p>
        </div>

        {/* Mode Switcher Segmented Control */}
        <div
          role="group"
          aria-label="Quiz Generation Source Mode"
          className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg self-start md:self-auto"
        >
          <button
            type="button"
            onClick={() => {
              setMode('pdf');
              setErrorMessage(null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'pdf'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Upload PDF Notes</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('topic');
              setErrorMessage(null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'topic'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Describe Topic</span>
          </button>
        </div>
      </section>

      {/* Main 2-Zone Generator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Zone (7 cols): Source Content Input (PDF Upload or Topic Description) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          {mode === 'pdf' ? (
            <>
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  1. Upload PDF Lecture Notes
                </h2>
                <p className="text-xs text-slate-500">
                  Upload any course PDF handout, textbook chapter, or slide deck export. Gemini parses definitions, formulas, and mechanisms directly from your file.
                </p>
              </div>

              {/* PDF Dropzone & File Input */}
              <div className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-6 text-center transition-colors bg-slate-50/60">
                <input
                  ref={fileInputRef}
                  id="pdf-upload-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mx-auto w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                  <FileUp className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-block px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer transition-colors"
                >
                  Choose PDF File from Computer
                </button>
                <p className="text-xs text-slate-500 mt-2">
                  Supports standard `.pdf` lecture notes and syllabus handouts up to 15 MB
                </p>

                {pdfFileName && (
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-left bg-white px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <div
                          data-testid="loaded-pdf-filename"
                          className="text-xs font-semibold text-slate-900 truncate"
                        >
                          {pdfFileName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {pdfFileSize} · Ready for concept extraction
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFileName('');
                        setPdfFileSize('');
                        setPdfTextContent('');
                        setPdfBase64('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-xs font-medium text-slate-500 hover:text-rose-600 ml-3 shrink-0 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Extracted Note Preview / Editable Excerpt */}
              {pdfTextContent && (
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <label
                    htmlFor="pdf-extracted-preview"
                    className="block text-xs font-semibold text-slate-800"
                  >
                    Extracted PDF Note Content (Editable Preview)
                  </label>
                  <textarea
                    id="pdf-extracted-preview"
                    rows={5}
                    value={pdfTextContent}
                    onChange={(e) => setPdfTextContent(e.target.value)}
                    className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-sky-600 focus:bg-white leading-relaxed"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  1. Describe Your Study Topic & Concepts
                </h2>
                <p className="text-xs text-slate-500">
                  Specify any academic topic, theorem, historical period, or technical syllabus item and Gemini will synthesize calibrated questions.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="topic-input"
                    className="block text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    Topic or Concept Description *
                  </label>
                  <input
                    id="topic-input"
                    type="text"
                    placeholder="e.g., Binary Search Trees, AVL Rotations & Time Complexity"
                    value={topicText}
                    onChange={(e) => {
                      setTopicText(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject-input"
                    className="block text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    Academic Subject / Course Name (Optional)
                  </label>
                  <input
                    id="subject-input"
                    type="text"
                    placeholder="e.g., Data Structures & Algorithms, Operating Systems, Computer Networks"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* Optional Specific Learning Focus */}
          <div className="pt-4 border-t border-slate-200">
            <label
              htmlFor="focus-areas-input"
              className="block text-xs font-semibold text-slate-800 mb-1.5"
            >
              Specific Subtopics or Exam Focus Instructions (Optional)
            </label>
            <textarea
              id="focus-areas-input"
              rows={2}
              placeholder="e.g., Emphasize Big-O time/space complexity, tree balancing rotations, and recursion edge cases..."
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Right Zone (5 cols): Difficulty Level Calibration & Generation Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>2. Calibrate Difficulty & Length</span>
            </h2>
            <p className="text-xs text-slate-500">
              Adjust cognitive complexity to match your current mastery stage
            </p>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2.5" role="radiogroup" aria-label="Difficulty Level">
            <div className="text-xs font-semibold text-slate-800">
              Select Difficulty Level
            </div>
            {(
              ['Beginner', 'Intermediate', 'Advanced', 'Exam Prep'] as DifficultyLevel[]
            ).map((level) => {
              const isSelected = difficulty === level;
              const info = DIFFICULTY_DESCRIPTIONS[level];
              return (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setDifficulty(level)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/60'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{level}</span>
                    <span className="text-slate-500">{info.tagline}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {info.detail}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Question Count Slider with Label, Numeric Value, and Unit */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="question-count-slider"
                className="font-semibold text-slate-800"
              >
                Number of Questions: {questionCount} questions
              </label>
              <span className="font-mono tabular-nums text-slate-500">
                ~{Math.max(3, Math.round(questionCount * 1.2))} min session
              </span>
            </div>
            <input
              id="question-count-slider"
              type="range"
              min={3}
              max={12}
              step={1}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400">
              <span>3 Qs (Quick Check)</span>
              <span>6 Qs (Standard)</span>
              <span>12 Qs (Deep Drill)</span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerate(true)}
              className="w-full py-3 px-4 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing {difficulty} Quiz with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Generate & Start {questionCount}-Question Quiz ({difficulty})
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerate(false)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Generate & Save to Quiz Library</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
