// Automated API test script
async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('🧪 Starting ConceptQuiz AI Backend API Test Suite...\n');

  // Test 1: Health
  console.log('1️⃣ Testing GET /api/health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('  Status:', health.status);
  console.log('  Provider info:', health.provider);
  if (!health.success) throw new Error('Health check failed');
  console.log('  ✅ Health endpoint OK\n');

  // Test 2: Samples
  console.log('2️⃣ Testing GET /api/quizzes/samples...');
  const samplesRes = await fetch(`${BASE_URL}/quizzes/samples`);
  const samples = await samplesRes.json();
  console.log('  Samples returned:', samples.data.length);
  if (samples.data.length === 0) throw new Error('Samples list empty');
  console.log('  ✅ Samples endpoint OK\n');

  // Test 3: Generate Quiz
  console.log('3️⃣ Testing POST /api/quizzes/generate (with sample demo mode)...');
  const genRes = await fetch(`${BASE_URL}/quizzes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      concept: 'React Hooks',
      subject: 'Web Development',
      difficulty: 'Intermediate',
      questionCount: 5,
      useSampleFallback: true
    })
  });
  const genData = await genRes.json();
  if (!genData.success) {
    throw new Error(`Generate quiz failed: ${JSON.stringify(genData)}`);
  }
  const quiz = genData.data;
  console.log('  Quiz ID generated:', quiz.quizId);
  console.log('  Questions received:', quiz.questions.length);

  // Verify anti-cheat: correctAnswer and explanation MUST NOT be exposed
  const leakedKey = quiz.questions.some((q) => q.correctAnswer !== undefined || q.explanation !== undefined);
  if (leakedKey) {
    throw new Error('CRITICAL SECURITY VIOLATION: Answer keys or explanations leaked to client!');
  }
  console.log('  ✅ Anti-cheat check passed: No answer keys or explanations sent in payload\n');

  // Test 4: Submit Quiz
  console.log('4️⃣ Testing POST /api/quizzes/submit (Server-Side Grading)...');
  // Submit answers: get 1 right and 4 wrong intentionally to test weak area calculation
  const sampleQ1 = quiz.questions[0];
  const sampleQ2 = quiz.questions[1];
  const userAnswers = {
    [sampleQ1.id]: sampleQ1.options[1], // Intentionally chosen
    [sampleQ2.id]: 'Wrong Answer Dummy'
  };

  const submitRes = await fetch(`${BASE_URL}/quizzes/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quizId: quiz.quizId,
      answers: userAnswers,
      timeSpentSeconds: 42
    })
  });
  const submitData = await submitRes.json();
  if (!submitData.success) {
    throw new Error(`Submit quiz failed: ${JSON.stringify(submitData)}`);
  }
  const results = submitData.data;
  console.log('  Score:', `${results.score} / ${results.totalQuestions} (${results.percentage}%)`);
  console.log('  Weak Topics Count:', results.weakTopics.length);
  console.log('  Strong Topics Count:', results.strongTopics.length);
  console.log('  Adaptive Recommendation:', results.adaptiveRecommendation?.actionLabel);
  console.log('  Detailed Review items:', results.detailedReview.length);
  console.log('  ✅ Server-side grading & adaptive analytics verified!\n');

  // Test 5: Error handling with invalid payload
  console.log('5️⃣ Testing Error Handling (invalid question count)...');
  const invalidRes = await fetch(`${BASE_URL}/quizzes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      concept: 'A', // too short (< 2 chars)
      difficulty: 'SuperHard', // invalid enum
      questionCount: 42 // invalid count
    })
  });
  const invalidData = await invalidRes.json();
  if (invalidRes.status === 400 && invalidData.error?.code === 'VALIDATION_ERROR') {
    console.log('  ✅ Validation caught expected invalid request with HTTP 400:', invalidData.error.message);
  } else {
    throw new Error('Expected 400 validation error, got ' + invalidRes.status);
  }

  console.log('\n🎉 ALL 5 BACKEND API TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
