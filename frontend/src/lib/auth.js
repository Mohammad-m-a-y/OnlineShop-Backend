

export function isAuthenticated() {
  if (typeof window === "undefined") return false;

  return !!localStorage.getItem("access_token");
}