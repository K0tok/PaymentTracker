import { createApp } from "vue";
import App from "./App.vue";
import router from "./router.js";
import "./assets/style.css";

const app = createApp(App);
app.use(router);
app.mount("#app");

// Регистрация Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker зарегистрирован:", registration.scope);
      })
      .catch((error) => {
        console.log("Ошибка регистрации Service Worker:", error);
      });
  });
}
