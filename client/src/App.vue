<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="header-gradient">
      <q-toolbar>
        <div class="logo-wrapper">
          <img src="/logo.png" alt="Логотип" class="logo-image" />
        </div>
        <q-toolbar-title class="text-weight-bold">
          Трекер платежей
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="store.isAuthenticated()" elevated class="footer-gradient">
      <q-tabs v-model="activeTab" align="center" class="text-white">
        <q-route-tab name="payment" to="/payment" icon="payments" label="Новая" />
        <q-route-tab name="history" to="/history" icon="history_edu" label="История" />
        <q-route-tab name="profile" to="/profile" icon="person_outline" label="Профиль" />
        <q-tab name="logout" @click="logout" icon="logout" label="Выход" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from "vue";
import { store } from "./store.js";
import router from "./router.js";

const activeTab = ref("payment");

function logout() {
  store.logout();
  router.push("/login");
}
</script>

<style scoped>
.header-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  backdrop-filter: blur(10px);
}

.footer-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 8px;
}

:deep(.q-tab--active) {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}
</style>
