export function redirectPathForRole(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "owner") return "/espace-proprietaire";
  return "/login";
}
