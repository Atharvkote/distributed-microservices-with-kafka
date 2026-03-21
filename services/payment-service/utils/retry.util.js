import logger from "./logger.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const withRetry = async (fn, options = {}) => {
  const { retries = 3, initialDelayMs = 400, factor = 2, onRetry = null } =
    options;

  let attempt = 0;
  let delay = initialDelayMs;
  let lastErr;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;

      if (onRetry) onRetry(err, attempt + 1);
      logger.warn("Retrying operation", {
        attempt: attempt + 1,
        maxRetries: retries,
        delay,
        error: err.message,
      });
      await sleep(delay);
      delay *= factor;
      attempt += 1;
    }
  }

  throw lastErr;
};

