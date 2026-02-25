import { createApp } from "vue";
import { Quasar, Notify, Dialog } from "quasar";
import "quasar/dist/quasar.css";
import "@quasar/extras/material-icons/material-icons.css";
import App from "./App.vue";
import router from "./router.js";
import "./assets/style.css";

const app = createApp(App);

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  },
  config: {
    notify: {
      position: "bottom-right",
      timeout: 3000
    }
  }
});
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
