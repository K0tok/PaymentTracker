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

        <q-btn flat round dense icon="home" to="/payment" class="q-mr-sm">
          <q-tooltip>Новая оплата</q-tooltip>
        </q-btn>

        <q-btn flat round dense icon="history" to="/history">
          <q-tooltip>История</q-tooltip>
        </q-btn>

        <q-btn flat round dense icon="logout" @click="logout" class="q-ml-sm">
          <q-tooltip>Выйти</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { store } from "./store.js";
import router from "./router.js";

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
