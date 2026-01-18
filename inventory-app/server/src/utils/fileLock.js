import fs from "fs";
import path from "path";

const locks = new Map();

export async function acquireLock(filePath) {
  const normalized = path.resolve(filePath);
  while (locks.get(normalized)) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  locks.set(normalized, true);
}

export async function releaseLock(filePath) {
  const normalized = path.resolve(filePath);
  locks.delete(normalized);
}
