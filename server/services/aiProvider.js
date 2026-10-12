import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiGeneratedQuizResponseSchema } from '../validators/quizValidator.js';
import { aiMetrics } from './aiMetricsService.js';

/**
 * Base AI Provider Interface
 */
export class BaseAIProvider {
  constructor(name) {
    this.name = name;
  }

  async checkHealth() {
    throw new Error('checkHealth not implemented');
  }

  async generateQuiz({ concept, subject, difficulty, questionCount, adaptiveContext, excludeQuestions, imageNotes }) {
    throw new Error('generateQuiz not implemented');
  }
}

/**
 * Clean and parse raw JSON text from model output
 */
export function extractJsonFromText(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    const emptyErr = new Error('Gemma returned an empty or unparseable response.');
    emptyErr.code = 'MALFORMED_AI_OUTPUT';
    emptyErr.status = 502;
    throw emptyErr;
  }

  // 1. Search for markdown code fences (```json ... ``` or ``` ... ```), handling thinking traces
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
  let match;
  let lastValidJson = null;

  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    const candidate = match[1].trim();
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') {
        lastValidJson = parsed;
      }
    } catch (e) {
      // ignore invalid block and check next
    }
  }

  if (lastValidJson) {
    return lastValidJson;
  }

  // 2. Direct parse
  let cleaned = rawText.trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // 3. Fallback heuristic: find outermost { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleaned.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (innerErr) {
        // continue
      }
    }
    const parseErr = new Error(`Failed to parse AI output as JSON: ${err.message}`);
    parseErr.code = 'MALFORMED_AI_OUTPUT';
    parseErr.status = 502;
    throw parseErr;
  }
}

export function normalizeQuestions(rawParsed, context = {}) {
  let quizData = rawParsed;
  if (Array.isArray(rawParsed)) {
    quizData = {
      concept: context.concept,
      subject: context.subject,
      difficulty: context.difficulty,
      questions: rawParsed
    };
  } else if (quizData && !Array.isArray(quizData.questions)) {
    if (Array.isArray(quizData.data)) {
      quizData.questions = quizData.data;
    } else if (Array.isArray(quizData.items)) {
      quizData.questions = quizData.items;
    }
  }

  if (!quizData || !Array.isArray(quizData.questions)) return quizData;

  quizData.concept = quizData.concept || context.concept;
  quizData.subject = quizData.subject || context.subject;
  quizData.difficulty = quizData.difficulty || context.difficulty;

  const letterMap = { A: 0, B: 1, C: 2, D: 3, a: 0, b: 1, c: 2, d: 3 };

  quizData.questions.forEach((q, idx) => {
    if (!q.id) q.id = `q_${idx + 1}`;
    if (!q.difficulty) q.difficulty = context.difficulty || 'Intermediate';
    if (!q.subtopic) q.subtopic = 'Core Concept';
    if (!Array.isArray(q.options) || q.options.length !== 4) return;

    // If correctAnswer is letter notation like "A", "B)", etc.
    const trimmed = String(q.correctAnswer || '').trim();
    const cleanLetter = trimmed.replace(/[\)\.\:]/g, '').trim();

    if (letterMap[cleanLetter] !== undefined) {
      q.correctAnswer = q.options[letterMap[cleanLetter]];
    } else {
      const match = q.options.find(opt => opt.trim().toLowerCase() === trimmed.toLowerCase());
      if (match) q.correctAnswer = match;
    }
  });

  return quizData;
}

/**
 * Generate the educator prompt for multiple-choice questions
 * Enforces schema constraints, adaptive remediation directives, and duplicate prevention
 */
export function buildEducatorPrompt({
  concept,
  subject,
  difficulty,
  questionCount,
  adaptiveContext,
  excludeQuestions = [],
  hasImage = false
}) {
  let adaptiveDirective = '';
  if (adaptiveContext) {
    const weakList = Array.isArray(adaptiveContext.weakTopics) && adaptiveContext.weakTopics.length > 0
      ? adaptiveContext.weakTopics.join(', ')
      : null;

    let missedDetails = '';
    if (Array.isArray(adaptiveContext.missedQuestions) && adaptiveContext.missedQuestions.length > 0) {
      missedDetails = '\nLEARNER MISTAKES TO REMEDIATE:\n' + adaptiveContext.missedQuestions.map((mq, idx) => {
        return `  ${idx + 1}. Struggled with: "${mq.question}"\n     Selected: "${mq.userAnswer || 'None'}" (Incorrect) | Correct: "${mq.correctAnswer || 'N/A'}"`;
      }).join('\n');
    }

    if (weakList || missedDetails) {
      adaptiveDirective = `\n\n🎯 TARGETED ADAPTIVE REMEDIATION:
The student previously struggled with: ${weakList || 'core principles'}.${missedDetails}
PEDAGOGICAL REQUIREMENTS:
1. Synthesize targeted follow-up questions directly addressing these exact conceptual misconceptions.
2. Formulate explanations that explicitly deconstruct the trap option the student chose, explain why it fails, and teach the proper mental model.
3. Advance student understanding while remaining at ${difficulty} level.`;
    }
  }

  let duplicatePrevention = '';
  if (Array.isArray(excludeQuestions) && excludeQuestions.length > 0) {
    duplicatePrevention = `\n\n🚫 DUPLICATE AVOIDANCE:
The student has already answered these questions recently. DO NOT repeat or closely rephrase them:
${excludeQuestions.slice(0, 10).map((q) => `- "${q}"`).join('\n')}
Generate entirely distinct and novel questions.`;
  }

  let imageDirective = '';
  if (hasImage) {
    imageDirective = `\n\n📷 STUDY NOTES / DIAGRAM UNDERSTANDING:
The user has attached an image containing study notes, diagrams, or a cheat-sheet.
Extract key principles, architectural components, code snippets, or definitions shown in the image and synthesize the questions strictly based on the content in the notes. If any part of the notes is handwritten or diagrammatic, formulate questions that verify comprehension of those concepts.`;
  }

  return `Generate exactly ${questionCount} multiple-choice questions on "${concept}" (${subject || 'Computer Science'}) at ${difficulty} level.${imageDirective}${adaptiveDirective}${duplicatePrevention}

Return a single JSON object with this exact structure:
{
  "concept": "${concept}",
  "subject": "${subject || 'Computer Science'}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["First option", "Second option", "Third option", "Fourth option"],
      "correctAnswer": "First option",
      "explanation": "Clear 1-2 sentence explanation of why this answer is correct and why alternative options are incorrect.",
      "difficulty": "${difficulty}",
      "subtopic": "Concise Subtopic Name"
    }
  ]
}

STRICT CONSTRAINTS:
1. Root MUST be a JSON object with "concept", "subject", "difficulty", and "questions".
2. Exactly ${questionCount} questions.
3. Every question MUST have exactly 4 distinct plausible options (no duplicate options).
4. Exactly 1 correct answer. "correctAnswer" MUST character-match one of the 4 options.
5. All ${questionCount} questions must be distinct (no duplicate questions in the array).
6. "explanation" must provide meaningful pedagogical reasoning (at least 15 characters).
7. "subtopic" must be a concise topic label (2-4 words).
8. Output raw JSON only without markdown commentary.`;
}

/**
 * Gemini / Gemma Provider for Google Gemini API
 */
export class GeminiProvider extends BaseAIProvider {
  constructor() {
    super('GeminiProvider');
    this.apiKey = process.env.GEMINI_API_KEY || '';
    let rawModel = (process.env.GEMINI_MODEL || 'gemma-4-26b-a4b-it').trim();
    if (rawModel.toLowerCase() === 'gemma-4' || rawModel.toLowerCase() === 'gemma 4') {
      rawModel = 'gemma-4-26b-a4b-it';
    }
    this.modelName = rawModel;
    this.client = null;

    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey);
    }
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async checkHealth() {
    if (!this.isConfigured()) {
      return {
        provider: 'gemini',
        model: this.modelName,
        isAvailable: false,
        hasKey: false,
        message: 'GEMINI_API_KEY is not configured in environment.'
      };
    }

    let lastErr = null;
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        thinkingConfig: { thinkingLevel: 'MINIMAL' }
      }
    });

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const ping = await model.generateContent('Hi');
        const text = ping.response?.text();
        return {
          provider: 'gemini',
          model: this.modelName,
          isAvailable: true,
          hasKey: true,
          message: `Connected to ${this.modelName}. Response verified.`,
          metrics: aiMetrics.getMetrics()
        };
      } catch (err) {
        lastErr = err;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    return {
      provider: 'gemini',
      model: this.modelName,
      isAvailable: false,
      hasKey: true,
      message: `API check failed for model ${this.modelName}: ${lastErr?.message}`,
      metrics: aiMetrics.getMetrics()
    };
  }

  async generateQuiz({
    concept,
    subject,
    difficulty,
    questionCount,
    adaptiveContext,
    excludeQuestions = [],
    imageNotes = null
  }) {
    if (!this.isConfigured()) {
      const err = new Error('GEMINI_API_KEY is missing. Please set it in .env or choose Sample Demo Mode.');
      err.code = 'MISSING_API_KEY';
      err.status = 401;
      throw err;
    }

    const totalStart = Date.now();
    const hasImage = Boolean(imageNotes && imageNotes.data);
    const mode = hasImage ? 'image-notes' : (adaptiveContext ? 'adaptive' : 'standard');

    console.log(`[Perf] Start generating quiz: "${concept}" | Subject: "${subject}" | Level: ${difficulty} | Count: ${questionCount} | Mode: ${mode} | Model: ${this.modelName}`);

    const prompt = buildEducatorPrompt({
      concept,
      subject,
      difficulty,
      questionCount,
      adaptiveContext,
      excludeQuestions,
      hasImage
    });

    const maxAttempts = 2;
    let lastError = null;
    let retriesCount = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const attemptStart = Date.now();
      try {
        console.log(`[Perf] AI call attempt ${attempt}/${maxAttempts} dispatched to ${this.modelName}...`);

        const model = this.client.getGenerativeModel({
          model: this.modelName,
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 2500,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingLevel: 'MINIMAL' }
          }
        });

        const apiCallStart = Date.now();
        let contents;

        if (hasImage) {
          const imagePart = {
            inlineData: {
              data: imageNotes.data,
              mimeType: imageNotes.mimeType || 'image/png'
            }
          };
          contents = [prompt, imagePart];
        } else {
          contents = prompt;
        }

        const result = await model.generateContent(contents);
        const response = await result.response;
        const apiCallDuration = Date.now() - apiCallStart;

        const usage = response.usageMetadata || {};
        console.log(`[Perf] AI response received in ${apiCallDuration}ms | Usage: promptTokens=${usage.promptTokenCount || 'N/A'}, candidateTokens=${usage.candidatesTokenCount || 'N/A'}, thoughtsTokens=${usage.thoughtsTokenCount || 0}, totalTokens=${usage.totalTokenCount || 'N/A'}`);

        const parseStart = Date.now();
        const rawText = response.text();
        const parsedJson = extractJsonFromText(rawText);
        const normalized = normalizeQuestions(parsedJson, { concept, subject, difficulty });
        const parseDuration = Date.now() - parseStart;

        // Validate schema with Zod (validates questions, distinct options, duplicate questions)
        const validateStart = Date.now();
        const validated = aiGeneratedQuizResponseSchema.safeParse(normalized);
        const validateDuration = Date.now() - validateStart;

        if (!validated.success) {
          console.error('[Perf] Validation errors on AI output:', validated.error.format());
          const firstIssue = (validated.error.issues || validated.error.errors || [])[0]?.message || 'Invalid format';
          const parseErr = new Error(`AI generated response did not match schema: ${firstIssue}`);
          parseErr.code = 'MALFORMED_AI_OUTPUT';
          parseErr.status = 502;
          throw parseErr;
        }

        const totalDuration = Date.now() - totalStart;
        console.log(`[Perf] Total quiz generation completed in ${totalDuration}ms (Attempts: ${attempt})`);

        // Record successful AI quality & performance metrics
        aiMetrics.recordRequest({
          model: this.modelName,
          durationMs: totalDuration,
          retries: retriesCount,
          schemaValid: true,
          success: true,
          tokens: usage,
          mode
        });

        return {
          concept: validated.data.concept || concept,
          subject: validated.data.subject || subject,
          difficulty: validated.data.difficulty || difficulty,
          questionCount: validated.data.questions.length,
          isSample: false,
          provider: `gemini (${this.modelName})`,
          mode,
          questions: validated.data.questions,
          perf: {
            totalDurationMs: totalDuration,
            apiDurationMs: apiCallDuration,
            parseDurationMs: parseDuration,
            validateDurationMs: validateDuration,
            attempts: attempt,
            usage
          }
        };
      } catch (error) {
        lastError = error;
        retriesCount++;
        const attemptDuration = Date.now() - attemptStart;
        console.warn(`[Perf] Attempt ${attempt} failed after ${attemptDuration}ms with model ${this.modelName}:`, error.message);

        if (error.status === 401) {
          aiMetrics.recordRequest({
            model: this.modelName,
            durationMs: Date.now() - totalStart,
            retries: retriesCount,
            schemaValid: false,
            success: false,
            mode
          });
          throw error;
        }

        if (attempt < maxAttempts) {
          console.log(`[Perf] Retrying generation in 1000ms...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    // Record failure in metrics
    aiMetrics.recordRequest({
      model: this.modelName,
      durationMs: Date.now() - totalStart,
      retries: retriesCount,
      schemaValid: false,
      success: false,
      mode
    });

    console.error(`[Perf] Gemini generation failed with model ${this.modelName}:`, lastError.message);
    if (lastError.code) throw lastError;

    const aiError = new Error(`AI Quiz Generation failed with model "${this.modelName}": ${lastError.message}`);
    aiError.code = 'AI_GENERATION_FAILED';
    aiError.status = 502;
    aiError.original = lastError.message;
    throw aiError;
  }
}

/**
 * Local Open-Weight Model Provider (e.g. Gemma 2 via Ollama, vLLM, LM Studio)
 */
export class LocalOpenWeightProvider extends BaseAIProvider {
  constructor() {
    super('LocalOpenWeightProvider');
    this.baseUrl = (process.env.LOCAL_AI_BASE_URL || 'http://localhost:11434/v1').replace(/\/+$/, '');
    this.modelName = process.env.LOCAL_AI_MODEL || 'gemma2:9b';
    this.apiKey = process.env.LOCAL_AI_API_KEY || 'ollama';
  }

  isConfigured() {
    return Boolean(this.baseUrl);
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        return {
          provider: 'local-open-weight',
          model: this.modelName,
          isAvailable: true,
          hasKey: true,
          message: `Connected to local endpoint at ${this.baseUrl} with model ${this.modelName}`,
          metrics: aiMetrics.getMetrics()
        };
      }
      return {
        provider: 'local-open-weight',
        model: this.modelName,
        isAvailable: false,
        hasKey: true,
        message: `Local endpoint returned HTTP ${res.status}`,
        metrics: aiMetrics.getMetrics()
      };
    } catch (err) {
      return {
        provider: 'local-open-weight',
        model: this.modelName,
        isAvailable: false,
        hasKey: false,
        message: `Cannot connect to local endpoint at ${this.baseUrl}: ${err.message}`,
        metrics: aiMetrics.getMetrics()
      };
    }
  }

  async generateQuiz({ concept, subject, difficulty, questionCount, adaptiveContext, excludeQuestions }) {
    const prompt = buildEducatorPrompt({ concept, subject, difficulty, questionCount, adaptiveContext, excludeQuestions });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: 'You are an educational quiz generator. Return only raw JSON adhering strictly to the requested schema.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Local AI returned HTTP ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      const parsedJson = extractJsonFromText(content);
      const normalized = normalizeQuestions(parsedJson);
      const validated = aiGeneratedQuizResponseSchema.safeParse(normalized);

      if (!validated.success) {
        const firstIssue = (validated.error.issues || validated.error.errors || [])[0]?.message || 'Invalid format';
        const parseErr = new Error(`Local model output did not match schema: ${firstIssue}`);
        parseErr.code = 'MALFORMED_AI_OUTPUT';
        parseErr.status = 502;
        throw parseErr;
      }

      return {
        concept: validated.data.concept || concept,
        subject: validated.data.subject || subject,
        difficulty: validated.data.difficulty || difficulty,
        questionCount: validated.data.questions.length,
        isSample: false,
        provider: `local (${this.modelName})`,
        questions: validated.data.questions
      };
    } catch (err) {
      console.error(`Local model generation failed:`, err.message);
      const aiError = new Error(`Local Open-Weight AI generation failed: ${err.message}`);
      aiError.code = 'LOCAL_AI_FAILED';
      aiError.status = 502;
      throw aiError;
    }
  }
}

/**
 * AI Provider Factory
 */
export function getActiveAIProvider() {
  const providerType = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  if (providerType === 'local' || providerType === 'ollama') {
    return new LocalOpenWeightProvider();
  }

  return new GeminiProvider();
}
