export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Exam Prep';

export type GenerationSource = 'pdf' | 'topic';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subtopic: string;
  cognitiveLevel?: 'Recall' | 'Application' | 'Analysis';
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  difficulty: DifficultyLevel;
  sourceType: GenerationSource;
  sourceName: string; // e.g. "Cellular_Bio_Lecture_04.pdf" or "Topic: Macroeconomic Policy"
  extractedTopics: string[];
  questions: QuizQuestion[];
  createdAt: string; // ISO date
  estimatedMinutes: number;
}

export interface QuestionResponse {
  questionId: string;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  flaggedForReview?: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  difficulty: DifficultyLevel;
  sourceType: GenerationSource;
  scorePercentage: number;
  correctCount: number;
  totalQuestions: number;
  durationSeconds: number;
  completedAt: string; // ISO date
  responses: QuestionResponse[];
  subtopicScores: Record<string, { correct: number; total: number }>;
}

export interface UserSettings {
  studentName: string;
  academicFocus: string;
  defaultDifficulty: DifficultyLevel;
  defaultQuestionCount: number;
  timerEnabled: boolean;
  secondsPerQuestion: number;
  instantFeedback: boolean;
  targetAccuracyPercentage: number;
  weeklyQuizGoal: number;
}

export interface SamplePdfDocument {
  id: string;
  fileName: string;
  subject: string;
  pageCount: number;
  fileSizeLabel: string;
  summary: string;
  extractedText: string;
  suggestedDifficulty: DifficultyLevel;
}
