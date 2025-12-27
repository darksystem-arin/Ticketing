
// ================================================================================================
// فایل ابزارها (Utils)
// این فایل شامل توابع کمکی است که در بخش‌های مختلف پروژه استفاده می‌شوند.
// ================================================================================================

/**
 * @function formatTimeAgo
 * یک مهر زمانی (timestamp) را به یک رشته زمان نسبی تبدیل می‌کند (مثلا: «۵ دقیقه پیش»).
 * @param timestamp - مهر زمانی به میلی‌ثانیه.
 * @returns {string} - رشته فرمت‌شده زمان نسبی به فارسی.
 */
export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  if (seconds < 60) {
    return `لحظاتی پیش`;
  }

  let interval = seconds / 31536000; // سال
  if (interval > 1) {
    return `${Math.floor(interval)} سال پیش`;
  }
  interval = seconds / 2592000; // ماه
  if (interval > 1) {
    return `${Math.floor(interval)} ماه پیش`;
  }
  interval = seconds / 86400; // روز
  if (interval > 1) {
    return `${Math.floor(interval)} روز پیش`;
  }
  interval = seconds / 3600; // ساعت
  if (interval > 1) {
    return `${Math.floor(interval)} ساعت پیش`;
  }
  interval = seconds / 60; // دقیقه
  if (interval > 1) {
    return `${Math.floor(interval)} دقیقه پیش`;
  }
  return `لحظاتی پیش`;
};
