import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("access_token") || null,
    user: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.post("/auth/login", { email, password });
        const token = res.data?.access_token;
        if (!token) throw new Error("Ingen access_token i svar från API");
        this.token = token;
        localStorage.setItem("access_token", token);
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
      this.user = null;
      localStorage.removeItem("access_token");
    },
  },
});
