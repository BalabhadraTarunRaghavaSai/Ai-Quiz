import {
  DifficultyLevel,
  QuestionResponse,
  Quiz,
  QuizAttempt,
  QuizQuestion,
} from '../types/quiz';

export interface TrendDataPoint {
  attemptId: string;
  dateLabel: string;
  fullDate: string;
  quizTitle: string;
  subject: string;
  difficulty: DifficultyLevel;
  scorePercentage: number;
  rollingAverage: number;
}

export interface SubjectMastery {
  subject: string;
  attemptsCount: number;
  averageScore: number;
  bestScore: number;
  questionsAnswered: number;
  trendDelta: number;
}

export interface DifficultyStat {
  difficulty: DifficultyLevel;
  attemptsCount: number;
  averageScore: number;
}

export interface AnalyticsSummary {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  improvementDelta: number;
  totalQuestionsAnswered: number;
  totalStudyMinutes: number;
  goalMetCount: number;
  goalMetRate: number;
  trendSeries: TrendDataPoint[];
  subjectMastery: SubjectMastery[];
  difficultyBreakdown: DifficultyStat[];
  weakestSubtopics: { subtopic: string; accuracy: number; total: number }[];
  strongestSubtopics: { subtopic: string; accuracy: number; total: number }[];
}

/**
 * Evaluates a user's selected answers against a Quiz and produces a QuizAttempt record.
 */
export function gradeQuizSubmission(
  quiz: Quiz,
  selectedAnswers: Record<string, number | null>,
  questionTimes: Record<string, number>,
  flaggedQuestions: Record<string, boolean>,
  completedAtIso: string = new Date().toISOString()
): QuizAttempt {
  const responses: QuestionResponse[] = [];
  const subtopicScores: Record<string, { correct: number; total: number }> = {};
  let correctCount = 0;
  let totalDuration = 0;

  for (const q of quiz.questions) {
    const selected =
      selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : null;
    const isCorrect = selected !== null && selected === q.correctAnswerIndex;
    const timeSpent = Math.max(1, Math.round(questionTimes[q.id] ?? 18));

    if (isCorrect) {
      correctCount += 1;
    }
    totalDuration += timeSpent;

    const subtopicKey = q.subtopic?.trim() || quiz.subject;
    if (!subtopicScores[subtopicKey]) {
      subtopicScores[subtopicKey] = { correct: 0, total: 0 };
    }
    subtopicScores[subtopicKey].total += 1;
    if (isCorrect) {
      subtopicScores[subtopicKey].correct += 1;
    }

    responses.push({
      questionId: q.id,
      selectedOptionIndex: selected,
      isCorrect,
      timeSpentSeconds: timeSpent,
      flaggedForReview: Boolean(flaggedQuestions[q.id]),
    });
  }

  const totalQuestions = Math.max(1, quiz.questions.length);
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  return {
    id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    subject: quiz.subject,
    difficulty: quiz.difficulty,
    sourceType: quiz.sourceType,
    scorePercentage,
    correctCount,
    totalQuestions,
    durationSeconds: totalDuration,
    completedAt: completedAtIso,
    responses,
    subtopicScores,
  };
}

/**
 * Formats an ISO date string into a concise short label like "Oct 14"
 */
export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Computes comprehensive analytics and improvement trajectory from quiz attempts.
 */
export function computeAnalyticsSummary(
  attempts: QuizAttempt[],
  targetAccuracyPercentage: number = 80
): AnalyticsSummary {
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      improvementDelta: 0,
      totalQuestionsAnswered: 0,
      totalStudyMinutes: 0,
      goalMetCount: 0,
      goalMetRate: 0,
      trendSeries: [],
      subjectMastery: [],
      difficultyBreakdown: [
        { difficulty: 'Beginner', attemptsCount: 0, averageScore: 0 },
        { difficulty: 'Intermediate', attemptsCount: 0, averageScore: 0 },
        { difficulty: 'Advanced', attemptsCount: 0, averageScore: 0 },
        { difficulty: 'Exam Prep', attemptsCount: 0, averageScore: 0 },
      ],
      weakestSubtopics: [],
      strongestSubtopics: [],
    };
  }

  // Sort chronologically (oldest -> newest) for trajectory calculation
  const chronological = [...attempts].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const totalAttempts = chronological.length;
  const sumScores = chronological.reduce((acc, a) => acc + a.scorePercentage, 0);
  const averageScore = Math.round(sumScores / totalAttempts);
  const highestScore = Math.max(...chronological.map((a) => a.scorePercentage));
  const totalQuestionsAnswered = chronological.reduce(
    (acc, a) => acc + a.totalQuestions,
    0
  );
  const totalSeconds = chronological.reduce(
    (acc, a) => acc + a.durationSeconds,
    0
  );
  const totalStudyMinutes = Math.max(1, Math.round(totalSeconds / 60));

  const goalMetCount = chronological.filter(
    (a) => a.scorePercentage >= targetAccuracyPercentage
  ).length;
  const goalMetRate = Math.round((goalMetCount / totalAttempts) * 100);

  // Improvement delta: compare average of second half (or latest 3) vs first half (or earliest 3)
  let improvementDelta = 0;
  if (totalAttempts >= 2) {
    const windowSize = Math.max(1, Math.min(3, Math.floor(totalAttempts / 2)));
    const earlySlice = chronological.slice(0, windowSize);
    const recentSlice = chronological.slice(totalAttempts - windowSize);
    const earlyAvg =
      earlySlice.reduce((s, a) => s + a.scorePercentage, 0) / earlySlice.length;
    const recentAvg =
      recentSlice.reduce((s, a) => s + a.scorePercentage, 0) / recentSlice.length;
    improvementDelta = Math.round(recentAvg - earlyAvg);
  }

  // Build trendSeries with 3-attempt rolling average
  const trendSeries: TrendDataPoint[] = chronological.map((attempt, idx) => {
    const startIdx = Math.max(0, idx - 2);
    const windowSlice = chronological.slice(startIdx, idx + 1);
    const rollingAverage = Math.round(
      windowSlice.reduce((s, a) => s + a.scorePercentage, 0) / windowSlice.length
    );

    return {
      attemptId: attempt.id,
      dateLabel: formatShortDate(attempt.completedAt),
      fullDate: attempt.completedAt,
      quizTitle: attempt.quizTitle,
      subject: attempt.subject,
      difficulty: attempt.difficulty,
      scorePercentage: attempt.scorePercentage,
      rollingAverage,
    };
  });

  // Group by subject
  const subjectMap = new Map<string, QuizAttempt[]>();
  for (const att of chronological) {
    const list = subjectMap.get(att.subject) ?? [];
    list.push(att);
    subjectMap.set(att.subject, list);
  }

  const subjectMastery: SubjectMastery[] = Array.from(subjectMap.entries())
    .map(([subject, list]) => {
      const avg = Math.round(
        list.reduce((s, a) => s + a.scorePercentage, 0) / list.length
      );
      const best = Math.max(...list.map((a) => a.scorePercentage));
      const questionsAnswered = list.reduce((s, a) => s + a.totalQuestions, 0);
      const trendDelta =
        list.length >= 2
          ? list[list.length - 1].scorePercentage - list[0].scorePercentage
          : 0;

      return {
        subject,
        attemptsCount: list.length,
        averageScore: avg,
        bestScore: best,
        questionsAnswered,
        trendDelta,
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore);

  // Difficulty breakdown
  const difficulties: DifficultyLevel[] = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Exam Prep',
  ];
  const difficultyBreakdown: DifficultyStat[] = difficulties.map((diff) => {
    const matching = chronological.filter((a) => a.difficulty === diff);
    const avg =
      matching.length > 0
        ? Math.round(
            matching.reduce((s, a) => s + a.scorePercentage, 0) / matching.length
          )
        : 0;
    return {
      difficulty: diff,
      attemptsCount: matching.length,
      averageScore: avg,
    };
  });

  // Subtopic aggregation
  const subtopicTotals = new Map<string, { correct: number; total: number }>();
  for (const att of chronological) {
    if (!att.subtopicScores) continue;
    for (const [sub, stats] of Object.entries(att.subtopicScores)) {
      const existing = subtopicTotals.get(sub) ?? { correct: 0, total: 0 };
      existing.correct += stats.correct;
      existing.total += stats.total;
      subtopicTotals.set(sub, existing);
    }
  }

  const allSubtopics = Array.from(subtopicTotals.entries())
    .filter(([, s]) => s.total > 0)
    .map(([subtopic, s]) => ({
      subtopic,
      accuracy: Math.round((s.correct / s.total) * 100),
      total: s.total,
    }));

  const strongestSubtopics = [...allSubtopics]
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)
    .slice(0, 4);

  const weakestSubtopics = [...allSubtopics]
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
    .slice(0, 4);

  return {
    totalAttempts,
    averageScore,
    highestScore,
    improvementDelta,
    totalQuestionsAnswered,
    totalStudyMinutes,
    goalMetCount,
    goalMetRate,
    trendSeries,
    subjectMastery,
    difficultyBreakdown,
    weakestSubtopics,
    strongestSubtopics,
  };
}

/**
 * Filters quiz attempts by search query, difficulty, and source type (newest first).
 */
export function filterQuizAttempts(
  attempts: QuizAttempt[],
  options: {
    searchQuery?: string;
    difficulty?: DifficultyLevel | 'All';
    sourceType?: 'All' | 'pdf' | 'topic';
  }
): QuizAttempt[] {
  const q = (options.searchQuery ?? '').trim().toLowerCase();
  const diff = options.difficulty ?? 'All';
  const src = options.sourceType ?? 'All';

  return [...attempts]
    .filter((att) => {
      if (diff !== 'All' && att.difficulty !== diff) return false;
      if (src !== 'All' && att.sourceType !== src) return false;
      if (q) {
        const matchesTitle = att.quizTitle.toLowerCase().includes(q);
        const matchesSubject = att.subject.toLowerCase().includes(q);
        return matchesTitle || matchesSubject;
      }
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
}

/**
 * Validates quiz generation inputs before sending to backend.
 */
export function validateGenerationRequest(input: {
  mode: 'pdf' | 'topic';
  topicText?: string;
  pdfFileName?: string;
  pdfContent?: string;
  questionCount: number;
}): { valid: boolean; error?: string } {
  if (input.questionCount < 3 || input.questionCount > 20) {
    return {
      valid: false,
      error: 'Question count must be between 3 and 20 questions.',
    };
  }

  if (input.mode === 'topic') {
    const cleanTopic = (input.topicText ?? '').trim();
    if (cleanTopic.length < 3) {
      return {
        valid: false,
        error: 'Please enter a specific study topic or concept description (at least 3 characters).',
      };
    }
    return { valid: true };
  }

  if (input.mode === 'pdf') {
    if (!input.pdfFileName || !input.pdfContent) {
      return {
        valid: false,
        error: 'Please upload a PDF file from your computer before generating.',
      };
    }
    return { valid: true };
  }

  return { valid: false, error: 'Invalid generation mode.' };
}

/**
 * Records a user's selected option for a question only if no option has been selected yet.
 * Prevents changing an answer once selected.
 */
export function lockSelectedAnswer(
  currentAnswers: Record<string, number | null>,
  questionId: string,
  optionIdx: number
): Record<string, number | null> {
  if (
    currentAnswers[questionId] !== undefined &&
    currentAnswers[questionId] !== null
  ) {
    return currentAnswers;
  }
  return {
    ...currentAnswers,
    [questionId]: optionIdx,
  };
}

