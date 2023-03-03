import {createApp} from "vue";
import App from "./App.vue";
import VueToast from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import "./main.css";

Vue.use(VueToast);

createApp(App).mount("#app");
