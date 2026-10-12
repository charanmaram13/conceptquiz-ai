import { z } from 'zod';

export const adaptiveContextSchema = z.object({
  weakTopics: z.array(z.string().min(1)).optional().default([]),
  missedQuestions: z.array(z.object({
    question: z.string().min(5),
    userAnswer: z.string().nullable().optional(),
    correctAnswer: z.string().optional()
  })).optional().default([])
});

export const imageNotesSchema = z.object({
  data: z.string().min(10, { message: 'Image data is required as base64 string' }),
  mimeType: z.string().regex(/^image\/(png|jpeg|jpg|webp|gif)$/, {
    message: 'Image mimeType must be image/png, image/jpeg, or image/webp'
  })
});

export const generateQuizSchema = z.object({
  concept: z
    .string()
    .min(2, { message: 'Concept must be at least 2 characters long' })
    .max(120, { message: 'Concept cannot exceed 120 characters' })
    .trim(),
  subject: z
    .string()
    .min(2, { message: 'Subject must be at least 2 characters long' })
    .max(80)
    .default('Computer Science'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    errorMap: () => ({ message: 'Difficulty must be Beginner, Intermediate, or Advanced' })
  }),
  questionCount: z.coerce
    .number()
    .int()
    .refine((val) => [5, 10, 15].includes(val), {
      message: 'Question count must be 5, 10, or 15'
    })
    .default(5),
  useSampleFallback: z.boolean().optional().default(false),
  adaptiveContext: adaptiveContextSchema.nullable().optional(),
  excludeQuestions: z.array(z.string()).nullable().optional().default([]),
  imageNotes: imageNotesSchema.nullable().optional()
});

export const singleQuestionSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  question: z.string().min(10, { message: 'Question text must be at least 10 characters' }),
  options: z
    .array(z.string().min(1, { message: 'Option text cannot be empty' }))
    .length(4, { message: 'Exactly 4 options are required' })
    .refine((items) => new Set(items.map((opt) => opt.trim().toLowerCase())).size === 4, {
      message: 'All 4 options must be distinct and non-duplicate'
    }),
  correctAnswer: z.string().min(1, { message: 'Correct answer cannot be empty' }),
  explanation: z
    .string()
    .min(15, { message: 'Explanation must provide substantial reasoning (15+ chars)' }),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  subtopic: z.string().min(2, { message: 'Subtopic tag is required' }).default('Core Concept')
}).refine((data) => data.options.includes(data.correctAnswer), {
  message: 'Correct answer must be one of the four options provided',
  path: ['correctAnswer']
});

export const aiGeneratedQuizResponseSchema = z.object({
  concept: z.string(),
  subject: z.string().optional(),
  difficulty: z.string(),
  questions: z
    .array(singleQuestionSchema)
    .min(1, { message: 'Quiz must contain at least 1 question' })
    .refine((questions) => {
      // Ensure all question stems within the generated quiz are distinct (no duplicates)
      const stems = questions.map((q) => q.question.trim().toLowerCase());
      return new Set(stems).size === questions.length;
    }, {
      message: 'Duplicate questions detected. Each question stem in the quiz must be unique.'
    })
});

export const submitQuizSchema = z.object({
  quizId: z.string().min(5, { message: 'Valid quizId is required' }),
  answers: z.record(z.string(), z.string()).default({}),
  timeSpentSeconds: z.number().int().nonnegative().optional().default(0)
});
