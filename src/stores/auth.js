import { defineStore } from "pinia";
import api from "../services/api";

// Enkel klient-side-dekodning av JWT för att läsa roll utan extra API-anrop
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

// Extraherar användarroll från JWT-payload
function getRoleFromToken(token) {
  const payload = decodeJwt(token);
  return payload?.role || null;
}

export const useAuthStore = defineStore("auth", {
  state: () => {
    const token = localStorage.getItem("access_token") || null;

    // Försöker hämta roll från localStorage, annars dekodas den från JWT-token
    const storedRole = localStorage.getItem("role");
    const role = storedRole || (token ? getRoleFromToken(token) : null);

    // Sparar roll i localStorage om den endast kunde hämtas från token
    if (!storedRole && role) localStorage.setItem("role", role);

    return {
      token,
      role,
      user: null,
      loading: false,
      error: null,
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    roleLabel: (state) => (state.role ? state.role.toUpperCase() : ""),
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
