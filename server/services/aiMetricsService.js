/**
 * In-Memory AI Quality and Performance Metrics Tracker
 * Tracks real generation latency, schema-valid response rate, retry rate, and throughput.
 */
class AIMetricsService {
  constructor() {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.totalRetries = 0;
    this.schemaValidFirstAttemptCount = 0;
    this.latenciesMs = [];
    this.maxLatencyHistory = 50;
    this.lastRequest = null;
    this.startTime = Date.now();
  }

  recordRequest({
    model,
    durationMs,
    retries = 0,
    schemaValid = true,
    success = true,
    tokens = {},
    mode = 'text'
  }) {
    this.totalRequests++;
    if (success) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }

    this.totalRetries += retries;

    if (schemaValid && retries === 0) {
      this.schemaValidFirstAttemptCount++;
    }

    if (typeof durationMs === 'number' && durationMs > 0) {
      this.latenciesMs.push(durationMs);
      if (this.latenciesMs.length > this.maxLatencyHistory) {
        this.latenciesMs.shift();
      }
    }

    this.lastRequest = {
      timestamp: new Date().toISOString(),
      model,
      durationMs,
      retries,
      schemaValid,
      success,
      tokens,
      mode
    };
  }

  getMetrics() {
    const total = this.totalRequests;
    const avgLatency =
      this.latenciesMs.length > 0
        ? Math.round(this.latenciesMs.reduce((a, b) => a + b, 0) / this.latenciesMs.length)
        : 0;

    const minLatency = this.latenciesMs.length > 0 ? Math.min(...this.latenciesMs) : 0;
    const maxLatency = this.latenciesMs.length > 0 ? Math.max(...this.latenciesMs) : 0;

    const schemaValidRate =
      total > 0 ? Math.round((this.schemaValidFirstAttemptCount / total) * 100) : 100;

    const retryRate =
      total > 0 ? Math.round((this.totalRetries / total) * 100) : 0;

    const uptimeSeconds = Math.round((Date.now() - this.startTime) / 1000);

    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      totalRetries: this.totalRetries,
      averageLatencyMs: avgLatency,
      minLatencyMs: minLatency,
      maxLatencyMs: maxLatency,
      schemaValidRatePercent: schemaValidRate,
      retryRatePercent: retryRate,
      recentLatenciesMs: [...this.latenciesMs].slice(-10),
      uptimeSeconds,
      lastRequest: this.lastRequest
    };
  }

  reset() {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.totalRetries = 0;
    this.schemaValidFirstAttemptCount = 0;
    this.latenciesMs = [];
    this.lastRequest = null;
    this.startTime = Date.now();
  }
}

export const aiMetrics = new AIMetricsService();
