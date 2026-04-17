import { buildApiUrl } from "@/lib/apiConfig";

export type AuthRole = "admin" | "vendor";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: AuthRole;
    status?: string;
    mobile?: string;
  };
};

const TOKEN_KEY = "swadeshi_token";
const USER_KEY = "swadeshi_user";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): LoginResponse["user"] | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LoginResponse["user"];
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class AuthSessionExpiredError extends Error {
  constructor(message = "Session expired. Please login again.") {
    super(message);
    this.name = "AuthSessionExpiredError";
  }
}

function getAuthHeader() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const isFormData = init.body instanceof FormData;
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...getAuthHeader(),
      ...(init.headers || {}),
    },
  });

  if (response.status === 401) {
    clearAuth();
    throw new AuthSessionExpiredError();
  }

  return response;
}

export async function validateSession() {
  const response = await apiFetch("/api/auth/me", { method: "GET" });
  if (!response.ok) return null;
  const user = (await response.json()) as LoginResponse["user"];
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function loginWithEmailPassword(email: string, password: string) {
  const response = await fetch(buildApiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json()) as LoginResponse | { message?: string };
  if (!response.ok) {
    const message = "message" in payload && payload.message ? payload.message : "Login failed";
    throw new Error(message);
  }

  const data = payload as LoginResponse;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}
