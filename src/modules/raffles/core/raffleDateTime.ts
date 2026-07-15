const ARGENTINA_OFFSET = "-03:00";

const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

/** Normalize admin/app deadline values to a UTC instant (ms). */
export const deadlineToInstant = (
  value: Date | string | null | undefined,
): number | null => {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  if (DATETIME_LOCAL_PATTERN.test(raw)) {
    const normalized = raw.length === 16 ? `${raw}:00` : raw;
    const ms = new Date(`${normalized}${ARGENTINA_OFFSET}`).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
};

export const isDeadlinePassed = (
  value: Date | string | null | undefined,
  nowMs = Date.now(),
): boolean => {
  const deadlineMs = deadlineToInstant(value);
  if (deadlineMs == null) {
    return false;
  }
  return nowMs >= deadlineMs;
};

export const serializeRaffleDateTime = (
  value: Date | string | null | undefined,
): string | null => {
  const ms = deadlineToInstant(value);
  if (ms == null) {
    return null;
  }
  return new Date(ms).toISOString();
};

export const parseAdminDateTime = (
  value: unknown,
  fieldLabel: string,
): Date => {
  const raw = String(value ?? "").trim();
  if (!raw) {
    throw new Error(`${fieldLabel} es obligatoria`);
  }

  let date: Date;
  if (DATETIME_LOCAL_PATTERN.test(raw)) {
    const normalized = raw.length === 16 ? `${raw}:00` : raw;
    date = new Date(`${normalized}${ARGENTINA_OFFSET}`);
  } else {
    date = value instanceof Date ? value : new Date(raw);
  }

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldLabel} inválida`);
  }

  return date;
};
