import assert from 'assert';
import { aiGeneratedQuizResponseSchema, singleQuestionSchema, generateQuizSchema } from './server/validators/quizValidator.js';
import { extractJsonFromText, normalizeQuestions } from './server/services/aiProvider.js';

const BASE_URL = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('🧪 Starting ConceptQuiz AI Advanced Verification Test Suite...\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
    }
  }

  // --- SUITE 1: Zod Validation & Duplicate Prevention ---
  console.log('--- 1. Schema Validation & Duplicate Prevention ---');

  await test('Reject questions with duplicate options', () => {
    const invalidQ = {
      id: 'q1',
      question: 'What is a closure in JavaScript?',
      options: ['Option A', 'Option A', 'Option B', 'Option C'], // Duplicate!
      correctAnswer: 'Option A',
      explanation: 'A closure is a function bundled with its lexical environment.',
      difficulty: 'Intermediate',
      subtopic: 'Closures'
    };

    const res = singleQuestionSchema.safeParse(invalidQ);
    assert.strictEqual(res.success, false, 'Should fail validation due to duplicate options');
    const msg = res.error.issues[0]?.message;
    assert.ok(msg.includes('distinct') || msg.includes('duplicate'), `Expected distinct error, got: ${msg}`);
  });

  await test('Reject questions where correctAnswer is not in options', () => {
    const invalidQ = {
      id: 'q2',
      question: 'What does the useState hook return?',
      options: ['State only', 'Setter only', 'State and setter pair', 'Reducer dispatch'],
      correctAnswer: 'Non-existent answer', // Not in options!
      explanation: 'useState returns a tuple with state and setter function.',
      difficulty: 'Intermediate',
      subtopic: 'Hooks'
    };

    const res = singleQuestionSchema.safeParse(invalidQ);
    assert.strictEqual(res.success, false, 'Should fail validation when correctAnswer is not in options');
  });

  await test('Reject quiz with duplicate questions', () => {
    const duplicateQuiz = {
      concept: 'JavaScript Closures',
      subject: 'Programming Languages',
      difficulty: 'Intermediate',
      questions: [
        {
          id: 'q1',
          question: 'What is lexical scoping in JavaScript?',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: 'Option 1',
          explanation: 'Lexical scoping means variables are resolved based on position in source code.',
          difficulty: 'Intermediate',
          subtopic: 'Scope'
        },
        {
          id: 'q2',
          question: 'What is lexical scoping in JavaScript?', // Duplicate question stem!
          options: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
          correctAnswer: 'Choice 1',
          explanation: 'Lexical scoping means variables are resolved based on position in source code.',
          difficulty: 'Intermediate',
          subtopic: 'Scope'
        }
      ]
    };

    const res = aiGeneratedQuizResponseSchema.safeParse(duplicateQuiz);
    assert.strictEqual(res.success, false, 'Should reject quiz with duplicate question stems');
    const msg = res.error.issues[0]?.message;
    assert.ok(msg.includes('Duplicate questions detected'), `Expected duplicate questions error, got: ${msg}`);
  });

  await test('Extract and parse JSON from markdown code fences and raw output', () => {
    const rawFenced = '```json\n{"concept":"Test","difficulty":"Beginner","questions":[]}\n```';
    const parsed = extractJsonFromText(rawFenced);
    assert.strictEqual(parsed.concept, 'Test');

    const rawWithCommentary = 'Here is the quiz:\n```\n{"concept":"Fenced No Tag"}\n```\nHope you like it!';
    const parsed2 = extractJsonFromText(rawWithCommentary);
    assert.strictEqual(parsed2.concept, 'Fenced No Tag');
  });

  // --- SUITE 2: Adaptive Question Generation ---
  console.log('\n--- 2. Adaptive Question Generation ---');

  await test('Generate quiz with adaptiveContext (weak topics & missed questions)', async () => {
    const adaptivePayload = {
      concept: 'JavaScript Closures',
      subject: 'Programming Languages',
      difficulty: 'Intermediate',
      questionCount: 5,
      useSampleFallback: true, // Use verified sample fallback to test end-to-end routing without consuming API tokens
      adaptiveContext: {
        weakTopics: ['Lexical Scoping', 'Memory Leaks'],
        missedQuestions: [
          {
            question: 'What happens to outer variables in a closure?',
            userAnswer: 'They are garbage collected immediately',
            correctAnswer: 'They are retained in the heap'
          }
        ]
      },
      excludeQuestions: ['What is lexical scoping in JavaScript?']
    };

    const res = await fetch(`${BASE_URL}/quizzes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adaptivePayload)
    });

    assert.strictEqual(res.status, 201);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.quizId, 'Quiz ID must be returned');
    assert.strictEqual(json.data.questions.length, 5);

    // Anti-cheat verification
    json.data.questions.forEach((q) => {
      assert.strictEqual(q.correctAnswer, undefined, 'correctAnswer must be hidden from client');
      assert.strictEqual(q.explanation, undefined, 'explanation must be hidden from client');
      assert.strictEqual(q.options.length, 4, 'Must have 4 options');
    });
  });

  // --- SUITE 3: Multimodal Image Notes Validation ---
  console.log('\n--- 3. Multimodal Image Notes Validation ---');

  await test('Validate imageNotes payload structure', () => {
    const validImagePayload = {
      concept: 'Study Notes on Trees',
      difficulty: 'Intermediate',
      questionCount: 5,
      imageNotes: {
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        mimeType: 'image/png'
      }
    };

    const parseRes = generateQuizSchema.safeParse(validImagePayload);
    assert.strictEqual(parseRes.success, true, 'Valid imageNotes payload should succeed');

    const invalidMimePayload = {
      concept: 'Study Notes on Trees',
      difficulty: 'Intermediate',
      questionCount: 5,
      imageNotes: {
        data: 'somebase64data',
        mimeType: 'application/pdf' // Invalid mimeType
      }
    };
    const invalidRes = generateQuizSchema.safeParse(invalidMimePayload);
    assert.strictEqual(invalidRes.success, false, 'Invalid mimeType should be rejected');
  });

  // --- SUITE 4: API Failures & Error Handling ---
  console.log('\n--- 4. API Failures & Error Handling ---');

  await test('POST /api/quizzes/generate rejects invalid difficulty with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL}/quizzes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'Algorithms',
        difficulty: 'Mastery', // Invalid
        questionCount: 5
      })
    });

    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(
      json.error.message.includes('Beginner') &&
      json.error.message.includes('Intermediate') &&
      json.error.message.includes('Advanced'),
      `Expected enum error message, got: ${json.error.message}`
    );
  });

  await test('POST /api/quizzes/generate rejects invalid question count with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL}/quizzes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: 'Algorithms',
        difficulty: 'Intermediate',
        questionCount: 7 // Must be 5, 10, or 15
      })
    });

    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.message.includes('Question count must be 5, 10, or 15'));
  });

  await test('POST /api/quizzes/submit rejects non-existent or expired session with HTTP 404', async () => {
    const res = await fetch(`${BASE_URL}/quizzes/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId: 'non-existent-session-id-12345',
        answers: { q1: 'Option A' }
      })
    });

    assert.strictEqual(res.status, 404);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.message.includes('expired or not found'));
  });

  await test('POST /api/quizzes/submit rejects missing quizId with HTTP 400', async () => {
    const res = await fetch(`${BASE_URL}/quizzes/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: { q1: 'Option A' }
      })
    });

    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  // --- SUITE 5: Metrics & Authoritative Backend Statistics ---
  console.log('\n--- 5. Measurable Metrics & Authoritative Backend Stats ---');

  await test('GET /api/metrics returns real AI quality and performance tracking', async () => {
    const res = await fetch(`${BASE_URL}/metrics`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.schemaValidRatePercent !== undefined, 'Must include schemaValidRatePercent');
    assert.ok(json.data.retryRatePercent !== undefined, 'Must include retryRatePercent');
    assert.ok(json.data.averageLatencyMs !== undefined, 'Must include averageLatencyMs');
  });

  await test('GET /api/quizzes/stats returns authoritative backend quiz statistics', async () => {
    const res = await fetch(`${BASE_URL}/quizzes/stats`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.quizzesGenerated !== undefined, 'Must include quizzesGenerated');
    assert.ok(json.data.quizzesGraded !== undefined, 'Must include quizzesGraded');
    assert.ok(json.data.overallAccuracyPercent !== undefined, 'Must include overallAccuracyPercent');
  });

  // --- SUITE 6: Regression Tests & Live Gemma Generation ---
  console.log('\n--- 6. Regression Tests & Live Gemma 4 Generation ---');

  await test('REGRESSION: Handle previously failing payload with adaptiveContext: null and imageNotes: null', async () => {
    const failingPayload = {
      concept: 'React Hooks',
      subject: 'Web Development',
      difficulty: 'Intermediate',
      questionCount: 5,
      useSampleFallback: true,
      adaptiveContext: null,
      excludeQuestions: [],
      imageNotes: null
    };

    const res = await fetch(`${BASE_URL}/quizzes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(failingPayload)
    });

    assert.strictEqual(res.status, 201, `Expected HTTP 201, got ${res.status}`);
    const json = await res.json();
    assert.strictEqual(json.success, true, 'Request must succeed with null adaptiveContext/imageNotes');
    assert.ok(json.data.quizId, 'Valid quizId must be returned');
    assert.strictEqual(json.data.questions.length, 5);
  });

  await test('REGRESSION: Ensure invalid nested types inside adaptiveContext are still rejected with HTTP 400', async () => {
    const invalidNested = {
      concept: 'React Hooks',
      subject: 'Web Development',
      difficulty: 'Intermediate',
      questionCount: 5,
      adaptiveContext: {
        weakTopics: [12345] // Invalid: numbers not allowed
      }
    };

    const res = await fetch(`${BASE_URL}/quizzes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidNested)
    });

    assert.strictEqual(res.status, 400, 'Zod must still reject invalid nested types');
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.ok(json.error.message.includes('expected string') || json.error.message.includes('string'));
  });

  await test('LIVE GEMMA 4 GENERATION: Real question-generation request without mocks', async () => {
    console.log('    ⏳ Dispatching live request to gemma-4-26b-a4b-it (this takes ~15-18s)...');
    const livePayload = {
      concept: 'Database Indexing',
      subject: 'Database Systems',
      difficulty: 'Intermediate',
      questionCount: 5,
      useSampleFallback: false
    };

    const startTime = Date.now();
    const res = await fetch(`${BASE_URL}/quizzes/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(livePayload)
    });

    const elapsed = Date.now() - startTime;
    assert.strictEqual(res.status, 201, `Expected HTTP 201 from live Gemma 4, got ${res.status}`);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.isSample, false, 'Must be genuine live AI response, not sample');
    assert.ok(json.data.provider.includes('gemma-4'), `Provider must specify Gemma 4, got ${json.data.provider}`);
    assert.strictEqual(json.data.questions.length, 5, 'Must generate exactly 5 questions');

    // Anti-cheat verification on live response
    json.data.questions.forEach((q) => {
      assert.strictEqual(q.correctAnswer, undefined, 'Anti-cheat: correctAnswer must never be sent to client');
      assert.strictEqual(q.explanation, undefined, 'Anti-cheat: explanation must never be sent to client');
      assert.strictEqual(q.options.length, 4, 'Each question must have 4 options');
    });

    console.log(`    ⚡ Live Gemma 4 generated 5 questions in ${(elapsed / 1000).toFixed(2)}s | Tokens: ${json.data.perf?.usage?.totalTokenCount || 'N/A'}`);
  });

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed}/${total} TESTS PASSED!`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite();
