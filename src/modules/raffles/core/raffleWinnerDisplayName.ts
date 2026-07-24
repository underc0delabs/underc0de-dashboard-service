type WinnerUserFields = {
  name?: string | null;
  lastname?: string | null;
  username?: string | null;
};

export const formatWinnerDisplayName = (user: WinnerUserFields): string => {
  const name = user.name?.trim() ?? "";
  const lastname = user.lastname?.trim() ?? "";
  const username = user.username?.trim() ?? "";
  const fullName = [name, lastname].filter(Boolean).join(" ");

  if (fullName && username) {
    return `${fullName} (${username})`;
  }
  if (fullName) {
    return fullName;
  }
  if (username) {
    return username;
  }
  return "Participante";
};
