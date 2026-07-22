export const parseBirthday = (str: string): Date => {
  if (!str) return new Date();
  const [d, m, y] = str.split("/");
  if (d && m && y) {
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? new Date() : date;
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};
