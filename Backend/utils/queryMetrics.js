async function timeQuery(label, queryFactory, slowThresholdMs = 150) {
  const start = Date.now();
  const result = await queryFactory();
  const durationMs = Date.now() - start;

  if (process.env.LOG_QUERY_TIMINGS === "true" || durationMs >= slowThresholdMs) {
    console.log(`[query:${label}] ${durationMs}ms`);
  }

  return result;
}

module.exports = { timeQuery };
