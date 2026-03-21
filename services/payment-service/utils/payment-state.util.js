import { AppError } from "./app-error.js";

const transitions = {
  CREATED: ["PENDING", "FAILED"],
  PENDING: ["SUCCESS", "FAILED"],
  SUCCESS: [],
  FAILED: [],
};

export const assertTransition = (from, to) => {
  if (from === to) return true;
  const allowed = transitions[from] || [];
  if (!allowed.includes(to)) {
    throw new AppError(
      `Invalid payment status transition: ${from} -> ${to}`,
      409,
      "INVALID_STATUS_TRANSITION"
    );
  }
  return true;
};

