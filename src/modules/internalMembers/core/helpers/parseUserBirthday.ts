export const parseUserBirthday = (str: string | Date | undefined): Date => {
  if (!str) return new Date();
  if (str instanceof Date) return isNaN(str.getTime()) ? new Date() : str;
  const [d, m, y] = String(str).split("/");
  if (d && m && y) {
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? new Date() : date;
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};
