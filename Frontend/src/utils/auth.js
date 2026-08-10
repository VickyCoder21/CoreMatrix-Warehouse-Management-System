export const isAuthenticated = () => {
  return sessionStorage.getItem("isAuthenticated") === "true";
};

export const getToken = () => {
  return sessionStorage.getItem("token") || "";
};

export const getCurrentUser = () => ({
  username: sessionStorage.getItem("username") || "",
  employeecode: sessionStorage.getItem("employeecode") || "",
  employeename: sessionStorage.getItem("employeename") || "",
});

export const setAuthenticatedUser = (user, screenDetails = [], token = "") => {
  sessionStorage.setItem("isAuthenticated", "true");
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("username", user.USERNAME || "");
  sessionStorage.setItem("employeecode", user.EMPLOYEECODE || "");
  sessionStorage.setItem("employeename", user.EMPLOYEENAME || "");
  sessionStorage.setItem(
    "allowedScreens",
    JSON.stringify((screenDetails || []).map((s) => s.SCREENID).filter(Boolean))
  );
};

export const getAllowedScreens = () => {
  try {
    return JSON.parse(sessionStorage.getItem("allowedScreens") || "[]");
  } catch {
    return [];
  }
};


export const hasScreenAccess = (screenId) => {
  if (!screenId) return true;
  if (screenId === "DAS001") return true;
  return getAllowedScreens().includes(screenId);
};

export const logout = () => {
  sessionStorage.clear();
};