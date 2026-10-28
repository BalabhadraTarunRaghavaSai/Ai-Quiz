import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Exam Prep';

interface GenerateQuizRequestBody {
  mode: 'pdf' | 'topic';
  topic?: string;
  subject?: string;
  focusAreas?: string;
  pdfFileName?: string;
  pdfText?: string;
  pdfBase64?: string;
  difficulty: DifficultyLevel;
  questionCount: number;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please ensure your Gemini API key is set in the environment.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  app.post('/api/quiz/generate', async (req, res) => {
    try {
      const body = req.body as GenerateQuizRequestBody;
      const count = Math.min(15, Math.max(3, Number(body.questionCount) || 5));
      const difficulty: DifficultyLevel = body.difficulty || 'Intermediate';

      const ai = getGeminiClient();

      const difficultyGuidance: Record<DifficultyLevel, string> = {
        Beginner:
          'Focus on foundational definitions, core facts, direct recall, and clear introductory understanding of the exact topic.',
        Intermediate:
          'Focus on conceptual relationships, cause-and-effect mechanisms, and practical application strictly within the given topic.',
        Advanced:
          'Focus on multi-step analysis, specific mechanisms, quantitative/analytical reasoning, and distinguishing subtle misconceptions strictly within the given topic.',
        'Exam Prep':
          'Simulate rigorous university exam questions requiring deep synthesis, scenario-based problem solving, and high-precision distractors strictly within the given topic.',
      };

      const systemInstruction = `You are an expert university professor and assessment author.
CRITICAL RULES:
1. Every single question, option, and explanation MUST be 100% genuine, factually accurate, and strictly within the boundaries of the user's given topic or uploaded PDF notes.
2. NEVER include questions outside of the provided topic or PDF content.
3. NEVER write vague, generic, or meta-template questions (such as "Which statement best explains the primary mechanism governing core principles"). Every question must ask about real, concrete facts, terminology, formulas, mechanisms, events, or concepts specific to the topic.
4. Provide 4 distinct, specific answer choices per question with exactly one unambiguously correct answer (correctAnswerIndex: 0, 1, 2, or 3).`;

      const promptParts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      if (body.mode === 'pdf') {
        if (body.pdfBase64) {
          promptParts.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: body.pdfBase64,
            },
          });
        }
        promptParts.push({
          text: `Generate a genuine ${count}-question multiple-choice quiz based STRICTLY and EXCLUSIVELY on the uploaded PDF lecture notes (${body.pdfFileName || 'Lecture Notes.pdf'}).
${body.pdfText ? `\nExtracted PDF Note Content:\n${body.pdfText}\n` : ''}
${body.focusAreas ? `\nAdditional Focus Instructions Within This Material: ${body.focusAreas}\n` : ''}
Target Difficulty Level: ${difficulty} — ${difficultyGuidance[difficulty]}

Requirements:
1. Write ${count} genuine, specific multiple-choice questions that test real facts, concepts, and mechanisms found directly in these notes and nowhere outside of them.
2. Each question must have 4 concrete options and a 0-based correctAnswerIndex (0, 1, 2, or 3).
3. Provide a clear, educational explanation citing the specific concept from the notes.
4. Assign a specific subtopic from the notes and cognitiveLevel ('Recall', 'Application', or 'Analysis') to each question.`,
        });
      } else {
        const cleanTopic = (body.topic || '').trim();
        promptParts.push({
          text: `Generate a genuine ${count}-question multiple-choice quiz based STRICTLY and EXCLUSIVELY on the following topic:
Given Topic: "${cleanTopic}"
${body.subject ? `Academic Subject / Course Context: "${body.subject.trim()}"` : ''}
${body.focusAreas ? `Specific Subtopics / Focus Instructions: "${body.focusAreas.trim()}"` : ''}
Target Difficulty Level: ${difficulty} — ${difficultyGuidance[difficulty]}

Requirements:
1. Write ${count} genuine, domain-specific multiple-choice questions that are 100% about "${cleanTopic}" and do NOT wander outside of this topic.
2. Ask concrete, real-world academic questions with specific terminology, examples, or calculations appropriate for "${cleanTopic}" at the ${difficulty} level.
3. Each question must have 4 realistic options and a 0-based correctAnswerIndex (0, 1, 2, or 3).
4. Provide a thorough, accurate explanation for why the correct option is right and why the distractors are incorrect.
5. Assign a specific subtopic of "${cleanTopic}" and cognitiveLevel ('Recall', 'Application', or 'Analysis') to each question.`,
        });
      }

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Concise academic title for the generated quiz based on the topic',
          },
          subject: {
            type: Type.STRING,
            description: 'Academic discipline or subject category',
          },
          extractedTopics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of 3 to 5 specific subtopics from the given topic covered in the quiz',
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswerIndex: {
                  type: Type.INTEGER,
                  description: '0-based index (0, 1, 2, or 3) of the correct option',
                },
                explanation: { type: Type.STRING },
                subtopic: { type: Type.STRING },
                cognitiveLevel: {
                  type: Type.STRING,
                  description: 'Recall, Application, or Analysis',
                },
              },
              required: [
                'question',
                'options',
                'correctAnswerIndex',
                'explanation',
                'subtopic',
              ],
            },
          },
        },
        required: ['title', 'subject', 'extractedTopics', 'questions'],
      };

      // Try models in order of reliability & low latency so transient 503 spikes on one model never degrade question quality
      const candidateModels: Array<{
        model: string;
        thinkingLevel: ThinkingLevel;
      }> = [
        { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
        { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
        { model: 'gemini-flash-latest', thinkingLevel: ThinkingLevel.LOW },
      ];

      let rawText: string | undefined;
      let usedModel = 'gemini-3.1-flash-lite';
      let lastError: unknown = null;

      for (const candidate of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: candidate.model,
            contents: { parts: promptParts },
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: candidate.thinkingLevel },
              responseMimeType: 'application/json',
              responseSchema,
            },
          });

          if (response.text && response.text.trim().length > 0) {
            rawText = response.text.trim();
            usedModel = candidate.model;
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(
            `Model ${candidate.model} failed, trying next model...`,
            err instanceof Error ? err.message : err
          );
        }
      }

      if (!rawText) {
        throw (
          lastError ||
          new Error('All Gemini models failed to generate quiz questions.')
        );
      }

      const parsed = JSON.parse(rawText);
      const generatedQuiz = {
        id: `quiz-${Date.now()}`,
        title:
          parsed.title ||
          body.topic ||
          body.pdfFileName?.replace(/\.pdf$/i, '') ||
          'Custom Study Quiz',
        subject: parsed.subject || body.subject || 'Academic Study',
        difficulty,
        sourceType: body.mode,
        sourceName:
          body.mode === 'pdf'
            ? body.pdfFileName || 'Uploaded_Notes.pdf'
            : `Topic: ${body.topic}`,
        extractedTopics:
          Array.isArray(parsed.extractedTopics) &&
          parsed.extractedTopics.length > 0
            ? parsed.extractedTopics
            : [body.topic || 'Core Topic'],
        questions: (parsed.questions || []).map((q: any, idx: number) => ({
          id: `q-${Date.now()}-${idx + 1}`,
          question: q.question,
          options:
            Array.isArray(q.options) && q.options.length >= 2
              ? q.options.slice(0, 4)
              : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex:
            typeof q.correctAnswerIndex === 'number' &&
            q.correctAnswerIndex >= 0 &&
            q.correctAnswerIndex < 4
              ? q.correctAnswerIndex
              : 0,
          explanation:
            q.explanation || 'Review the corresponding concept in your study notes.',
          subtopic: q.subtopic || body.topic || 'Core Concept',
          cognitiveLevel:
            q.cognitiveLevel === 'Recall' ||
            q.cognitiveLevel === 'Application' ||
            q.cognitiveLevel === 'Analysis'
              ? q.cognitiveLevel
              : 'Application',
        })),
        createdAt: new Date().toISOString(),
        estimatedMinutes: Math.max(
          3,
          Math.round(((parsed.questions || []).length || count) * 1.2)
        ),
      };

      res.json({ quiz: generatedQuiz, provider: usedModel });
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      res.status(500).json({
        error:
          error?.message ||
          'Failed to generate quiz from Gemini API. Please try again.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarPulse server running on http://localhost:${PORT}`);
  });
}

startServer();
