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
