// Live 3-run generation benchmark for ConceptQuiz AI
async function runBenchmark() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('🚀 Running 3-iteration live AI generation benchmark on Gemma 4...\n');

  const topics = [
    { concept: 'React Hooks', subject: 'Web Development', difficulty: 'Intermediate' },
    { concept: 'Data Structures and Algorithms', subject: 'Computer Science', difficulty: 'Intermediate' },
    { concept: 'Operating Systems', subject: 'Operating Systems', difficulty: 'Intermediate' }
  ];

  const results = [];

  for (let i = 0; i < 3; i++) {
    const topic = topics[i];
    console.log(`================================================================`);
    console.log(`▶ Run ${i + 1}/3: Testing concept "${topic.concept}"...`);
    console.log(`================================================================`);

    const t0 = Date.now();
    try {
      const res = await fetch(`${BASE_URL}/quizzes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: topic.concept,
          subject: topic.subject,
          difficulty: topic.difficulty,
          questionCount: 5,
          useSampleFallback: false
        })
      });

      const totalDuration = Date.now() - t0;
      const json = await res.json();

      if (!res.ok || !json.success) {
        console.error(`❌ Run ${i + 1} failed with status ${res.status}:`, json.error?.message);
        results.push({
          run: i + 1,
          concept: topic.concept,
          success: false,
          status: res.status,
          durationMs: totalDuration,
          error: json.error?.message || 'Unknown error'
        });
        continue;
      }

      const data = json.data;
      const perf = data.perf || {};
      const usage = perf.usage || {};

      console.log(`✅ Run ${i + 1} Succeeded in ${totalDuration} ms (${(totalDuration / 1000).toFixed(2)} s)`);
      console.log(`   - Model: ${data.provider}`);
      console.log(`   - Questions Generated: ${data.questions?.length}`);
      console.log(`   - API Duration: ${perf.apiDurationMs} ms`);
      console.log(`   - Parse Duration: ${perf.parseDurationMs} ms`);
      console.log(`   - Retry Count / Attempts: ${perf.attempts || 1}`);
      console.log(`   - Tokens: Prompt: ${usage.promptTokenCount || 'N/A'}, Candidate: ${usage.candidatesTokenCount || 'N/A'}, Thoughts: ${usage.thoughtsTokenCount || 0}, Total: ${usage.totalTokenCount || 'N/A'}`);

      // Verify anti-cheat: no answer keys sent
      const leaked = data.questions.some((q) => q.correctAnswer !== undefined || q.explanation !== undefined);
      console.log(`   - Anti-cheat verified: ${leaked ? 'FAILED (LEAKED!)' : 'PASSED (Protected)'}`);

      results.push({
        run: i + 1,
        concept: topic.concept,
        success: true,
        durationMs: totalDuration,
        apiDurationMs: perf.apiDurationMs,
        attempts: perf.attempts || 1,
        promptTokens: usage.promptTokenCount,
        candidateTokens: usage.candidatesTokenCount,
        thoughtsTokens: usage.thoughtsTokenCount || 0,
        totalTokens: usage.totalTokenCount
      });
    } catch (err) {
      const totalDuration = Date.now() - t0;
      console.error(`❌ Run ${i + 1} exception:`, err.message);
      results.push({
        run: i + 1,
        concept: topic.concept,
        success: false,
        durationMs: totalDuration,
        error: err.message
      });
    }

    // Brief pause between benchmark requests
    if (i < 2) {
      console.log('Pausing 2 seconds before next run...\n');
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log('\n================================================================');
  console.log('📊 BENCHMARK SUMMARY REPORT');
  console.log('================================================================');
  console.table(results.map((r) => ({
    'Run': r.run,
    'Concept': r.concept,
    'Status': r.success ? '✅ Success' : '❌ Failed',
    'Duration (s)': (r.durationMs / 1000).toFixed(2) + 's',
    'API Time (s)': r.apiDurationMs ? (r.apiDurationMs / 1000).toFixed(2) + 's' : 'N/A',
    'Attempts': r.attempts || 1,
    'Candidate Tokens': r.candidateTokens || 'N/A',
    'Thoughts Tokens': r.thoughtsTokens ?? 'N/A',
    'Total Tokens': r.totalTokens || 'N/A'
  })));

  const successfulRuns = results.filter((r) => r.success);
  if (successfulRuns.length > 0) {
    const avgDuration = successfulRuns.reduce((sum, r) => sum + r.durationMs, 0) / successfulRuns.length;
    console.log(`\nAverage Duration for Successful Runs: ${(avgDuration / 1000).toFixed(2)} seconds (${Math.round(avgDuration)} ms)`);
    console.log(`Total Retries across all runs: ${results.reduce((sum, r) => sum + ((r.attempts || 1) - 1), 0)}`);
  }
}

runBenchmark().catch(console.error);
