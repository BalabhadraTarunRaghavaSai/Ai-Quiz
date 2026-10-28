import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeAnalyticsSummary,
  filterQuizAttempts,
  gradeQuizSubmission,
  lockSelectedAnswer,
  validateGenerationRequest,
} from './quizAnalytics';
import { Quiz, QuizAttempt } from '../types/quiz';

const mockQuiz: Quiz = {
  id: 'quiz-test-1',
  title: 'Cellular Energetics & ATP',
  subject: 'Molecular Biology',
  difficulty: 'Intermediate',
  sourceType: 'pdf',
  sourceName: 'Bio_Lecture_04.pdf',
  extractedTopics: ['Glycolysis', 'Krebs Cycle', 'Oxidative Phosphorylation'],
  createdAt: '2026-10-20T10:00:00.000Z',
  estimatedMinutes: 8,
  questions: [
    {
      id: 'q1',
      question: 'Where does the citric acid cycle take place in eukaryotes?',
      options: ['Cytosol', 'Mitochondrial matrix', 'Thylakoid lumen', 'Nucleolus'],
      correctAnswerIndex: 1,
      explanation: 'Enzymes of the citric acid cycle are localized in the mitochondrial matrix.',
      subtopic: 'Krebs Cycle',
    },
    {
      id: 'q2',
      question: 'What is the net ATP yield directly from glycolysis per glucose molecule?',
      options: ['2 ATP', '4 ATP', '32 ATP', '36 ATP'],
      correctAnswerIndex: 0,
      explanation: 'Glycolysis invests 2 ATP and generates 4 ATP, yielding a net gain of 2 ATP.',
      subtopic: 'Glycolysis',
    },
    {
      id: 'q3',
      question: 'Which complex in the electron transport chain directly reduces molecular oxygen?',
      options: ['Complex I', 'Complex II', 'Complex III', 'Complex IV (Cytochrome c oxidase)'],
      correctAnswerIndex: 3,
      explanation: 'Complex IV transfers electrons from cytochrome c to O2, forming H2O.',
      subtopic: 'Oxidative Phosphorylation',
    },
    {
      id: 'q4',
      question: 'Which enzyme is the primary allosteric pacemaker of glycolysis?',
      options: ['Hexokinase', 'Phosphofructokinase-1 (PFK-1)', 'Enolase', 'Pyruvate kinase'],
      correctAnswerIndex: 1,
      explanation: 'PFK-1 catalyzes the committed step of glycolysis and is regulated by ATP and AMP.',
      subtopic: 'Glycolysis',
    },
  ],
};

test('gradeQuizSubmission computes accurate score, duration, and subtopic breakdown', () => {
  const attempt = gradeQuizSubmission(
    mockQuiz,
    { q1: 1, q2: 0, q3: 2, q4: 1 }, // q1, q2, q4 correct (3/4 = 75%)
    { q1: 15, q2: 20, q3: 25, q4: 30 },
    { q3: true },
    '2026-10-25T14:00:00.000Z'
  );

  assert.equal(attempt.correctCount, 3);
  assert.equal(attempt.totalQuestions, 4);
  assert.equal(attempt.scorePercentage, 75);
  assert.equal(attempt.durationSeconds, 90);
  assert.deepEqual(attempt.subtopicScores['Glycolysis'], { correct: 2, total: 2 });
  assert.deepEqual(attempt.subtopicScores['Oxidative Phosphorylation'], {
    correct: 0,
    total: 1,
  });
});

test('computeAnalyticsSummary calculates positive improvement delta over time', () => {
  const attempts: QuizAttempt[] = [
    {
      id: 'a1',
      quizId: 'q1',
      quizTitle: 'Bio Foundations 1',
      subject: 'Molecular Biology',
      difficulty: 'Beginner',
      sourceType: 'pdf',
      scorePercentage: 60,
      correctCount: 3,
      totalQuestions: 5,
      durationSeconds: 180,
      completedAt: '2026-10-01T10:00:00.000Z',
      responses: [],
      subtopicScores: { Glycolysis: { correct: 1, total: 3 } },
    },
    {
      id: 'a2',
      quizId: 'q2',
      quizTitle: 'Bio Foundations 2',
      subject: 'Molecular Biology',
      difficulty: 'Intermediate',
      sourceType: 'topic',
      scorePercentage: 70,
      correctCount: 7,
      totalQuestions: 10,
      durationSeconds: 300,
      completedAt: '2026-10-10T10:00:00.000Z',
      responses: [],
      subtopicScores: { Glycolysis: { correct: 3, total: 4 } },
    },
    {
      id: 'a3',
      quizId: 'q3',
      quizTitle: 'Bio Advanced 3',
      subject: 'Molecular Biology',
      difficulty: 'Advanced',
      sourceType: 'pdf',
      scorePercentage: 85,
      correctCount: 17,
      totalQuestions: 20,
      durationSeconds: 600,
      completedAt: '2026-10-18T10:00:00.000Z',
      responses: [],
      subtopicScores: { 'Krebs Cycle': { correct: 5, total: 5 } },
    },
    {
      id: 'a4',
      quizId: 'q4',
      quizTitle: 'Bio Exam Prep 4',
      subject: 'Molecular Biology',
      difficulty: 'Exam Prep',
      sourceType: 'pdf',
      scorePercentage: 95,
      correctCount: 19,
      totalQuestions: 20,
      durationSeconds: 540,
      completedAt: '2026-10-26T10:00:00.000Z',
      responses: [],
      subtopicScores: { 'Krebs Cycle': { correct: 5, total: 5 } },
    },
  ];

  const summary = computeAnalyticsSummary(attempts, 80);
  assert.equal(summary.totalAttempts, 4);
  assert.equal(summary.averageScore, 78); // (60+70+85+95)/4 = 77.5 -> 78
  assert.equal(summary.highestScore, 95);
  // Early 2 avg = (60+70)/2 = 65; Recent 2 avg = (85+95)/2 = 90 -> delta = +25
  assert.equal(summary.improvementDelta, 25);
  assert.equal(summary.goalMetCount, 2);
  assert.equal(summary.goalMetRate, 50);
  assert.equal(summary.trendSeries.length, 4);
  assert.equal(summary.strongestSubtopics[0].subtopic, 'Krebs Cycle');
  assert.equal(summary.strongestSubtopics[0].accuracy, 100);
});

test('filterQuizAttempts filters by search query, difficulty, and sourceType', () => {
  const attempts: QuizAttempt[] = [
    {
      id: 'a1',
      quizId: 'q1',
      quizTitle: 'Macroeconomics Monetary Policy',
      subject: 'Economics',
      difficulty: 'Intermediate',
      sourceType: 'topic',
      scorePercentage: 80,
      correctCount: 8,
      totalQuestions: 10,
      durationSeconds: 200,
      completedAt: '2026-10-20T10:00:00.000Z',
      responses: [],
      subtopicScores: {},
    },
    {
      id: 'a2',
      quizId: 'q2',
      quizTitle: 'Operating Systems Virtual Memory',
      subject: 'Computer Science',
      difficulty: 'Advanced',
      sourceType: 'pdf',
      scorePercentage: 90,
      correctCount: 9,
      totalQuestions: 10,
      durationSeconds: 250,
      completedAt: '2026-10-24T10:00:00.000Z',
      responses: [],
      subtopicScores: {},
    },
  ];

  const filteredByPdf = filterQuizAttempts(attempts, { sourceType: 'pdf' });
  assert.equal(filteredByPdf.length, 1);
  assert.equal(filteredByPdf[0].id, 'a2');

  const filteredBySearch = filterQuizAttempts(attempts, { searchQuery: 'monetary' });
  assert.equal(filteredBySearch.length, 1);
  assert.equal(filteredBySearch[0].id, 'a1');
});

test('validateGenerationRequest enforces required topic or PDF input', () => {
  assert.equal(
    validateGenerationRequest({ mode: 'topic', topicText: '  ', questionCount: 5 })
      .valid,
    false
  );
  assert.equal(
    validateGenerationRequest({
      mode: 'topic',
      topicText: 'Quantum Mechanics Wavefunctions',
      questionCount: 5,
    }).valid,
    true
  );
  assert.equal(
    validateGenerationRequest({ mode: 'pdf', questionCount: 5 }).valid,
    false
  );
});

test('lockSelectedAnswer prevents changing an option once selected', () => {
  let answers: Record<string, number | null> = {};
  answers = lockSelectedAnswer(answers, 'q1', 2);
  assert.equal(answers['q1'], 2);

  // Attempting to change q1 to option 0 must not alter the locked choice
  answers = lockSelectedAnswer(answers, 'q1', 0);
  assert.equal(answers['q1'], 2);

  // Selecting an answer for a different question q2 still works
  answers = lockSelectedAnswer(answers, 'q2', 3);
  assert.equal(answers['q2'], 3);
});

