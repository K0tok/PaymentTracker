<template>
  <q-layout view="hHh lpR fFf">
    <q-header v-if="store.isAuthenticated()" elevated class="bg-primary">
      <q-toolbar>
        <q-toolbar-title>
          <div class="row items-center q-gutter-sm">
            <img src="/logo.png" alt="Логотип" class="q-mr-sm logo" />
            <span>Учёт оплат</span>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="store.isAuthenticated()" elevated class="bg-primary">
      <q-tabs v-model="activeTab" align="center" class="text-white">
        <q-route-tab name="payment" to="/payment" icon="home" label="Новая" />
        <q-route-tab name="history" to="/history" icon="history" label="История" />
        <q-route-tab name="profile" to="/profile" icon="person" label="Профиль" />
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
.logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
</style>
