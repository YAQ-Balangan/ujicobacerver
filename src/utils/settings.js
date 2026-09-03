export const normalizeSettingKey = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

export const isSettingEnabled = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return ["ON", "TRUE", "AKTIF", "ACTIVE", "YA", "1"].includes(
    String(value).trim().toUpperCase(),
  );
};

export const findSetting = (settings, key) => {
  const normalizedKey = normalizeSettingKey(key);
  return (Array.isArray(settings) ? settings : []).find(
    (setting) => normalizeSettingKey(setting?.kunci) === normalizedKey,
  );
};
