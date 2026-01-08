import { defineStore } from "pinia";
import api from "../services/api";

function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getRoleFromToken(token) {
  const payload = decodeJwt(token);
  return payload?.role || null;
}

export const useAuthStore = defineStore("auth", {
  state: () => {
    const token = localStorage.getItem("access_token") || null;

    // ✅ försök ta role från localStorage, annars från token direkt
    const storedRole = localStorage.getItem("role");
    const role = storedRole || (token ? getRoleFromToken(token) : null);

    // om vi lyckades hitta role från token, spara det
    if (!storedRole && role) localStorage.setItem("role", role);

    return {
      token,
      role, // ✅ NY
      user: null,
      loading: false,
      error: null,
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    roleLabel: (state) => (state.role ? state.role.toUpperCase() : ""), // ✅ NY
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/login", { email, password });
        const token = res.data?.access_token;
        if (!token) throw new Error("Ingen access_token i svar från API");

        const role = getRoleFromToken(token);

        this.token = token;
        this.role = role;

        localStorage.setItem("access_token", token);
        if (role) localStorage.setItem("role", role);
        else localStorage.removeItem("role");
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e?.message ||
          "Inloggning misslyckades";
        throw e;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.role = null;
      this.user = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
    },
  },
});
