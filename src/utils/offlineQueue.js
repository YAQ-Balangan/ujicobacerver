const LEGACY_QUEUE_KEY = "tadbira_offline_nilai";

export const getOfflineQueueKey = (username) =>
  `tadbira_offline_nilai_${encodeURIComponent(String(username || "anonymous"))}`;

const parseQueue = (rawValue) => {
  if (!rawValue) return [];
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed];
  } catch (error) {
    console.warn("Antrean offline rusak, diabaikan:", error);
    return [];
  }
};

export const readOfflineQueue = (username) => {
  const key = getOfflineQueueKey(username);
  const scopedQueue = parseQueue(localStorage.getItem(key));

  // Migrate only records belonging to this account from the pre-scoped queue.
  const legacyQueue = parseQueue(localStorage.getItem(LEGACY_QUEUE_KEY)).filter(
    (item) => String(item?.username || "") === String(username || ""),
  );
  if (legacyQueue.length === 0) return scopedQueue;

  const merged = [...scopedQueue];
  legacyQueue.forEach((item) => {
    const submissionId = item.submission_id || item.id;
    if (!merged.some((queued) => (queued.submission_id || queued.id) === submissionId)) {
      merged.push(item);
    }
  });
  localStorage.setItem(key, JSON.stringify(merged));
  return merged;
};

export const writeOfflineQueue = (username, queue) => {
  localStorage.setItem(getOfflineQueueKey(username), JSON.stringify(queue));
};

export const enqueueOfflineSubmission = (username, submission) => {
  const queue = readOfflineQueue(username);
  const submissionId = submission.submission_id || submission.id;
  const nextQueue = [
    ...queue.filter((item) => (item.submission_id || item.id) !== submissionId),
    { ...submission, queued_at: submission.queued_at || new Date().toISOString() },
  ];
  writeOfflineQueue(username, nextQueue);
  return nextQueue;
};

export const removeLegacyOfflineQueue = (username) => {
  if (!username) {
    localStorage.removeItem(LEGACY_QUEUE_KEY);
    return;
  }
  const remaining = parseQueue(localStorage.getItem(LEGACY_QUEUE_KEY)).filter(
    (item) => String(item?.username || "") !== String(username),
  );
  if (remaining.length > 0) {
    localStorage.setItem(LEGACY_QUEUE_KEY, JSON.stringify(remaining));
  } else {
    localStorage.removeItem(LEGACY_QUEUE_KEY);
  }
};

export const createStableSubmissionId = (username, examId) => {
  const input = `${String(username || "").trim().toLowerCase()}:${String(examId || "").trim()}`;
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
