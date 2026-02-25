<template>
  <div id="app">
    <nav v-if="store.isAuthenticated()" class="navbar">
      <div class="nav-brand">
        <img src="/logo.png" alt="Логотип" class="nav-logo" />
        <span>Учёт оплат</span>
      </div>
      <div class="nav-links">
        <router-link to="/payment">Новая оплата</router-link>
        <router-link to="/history">История</router-link>
        <button @click="logout" class="btn-logout">Выйти</button>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
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
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: linear-gradient(135deg, #4a90d9 0%, #3672b9 100%);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.nav-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
