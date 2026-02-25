import { reactive } from "vue";

export const store = reactive({
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user") || "null"),
  
  setToken(token, user = null) {
    this.token = token;
    if (user) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    }
    localStorage.setItem("token", token);
  },
  
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  
  isAuthenticated() {
    return !!this.token;
  }
});
