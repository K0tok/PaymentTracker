const CACHE_NAME = "payment-tracker-v1";
const OFFLINE_URL = "/offline.html";

// Ресурсы для кэширования при установке
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html"
];

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Установка Service Worker");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Кэширование статических ресурсов");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Активация Service Worker");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов
self.addEventListener("fetch", (event) => {
  // Игнорируем не-GET запросы
  if (event.request.method !== "GET") return;

  // Игнорируем внешние запросы
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Возвращаем из кэша, но обновляем в фоне
        event.waitUntil(updateCache(event.request));
        return cachedResponse;
      }

      // Если нет в кэше, делаем запрос к сети
      return fetchAndCache(event.request);
    }).catch(() => {
      // Если офлайн, возвращаем offline страницу для навигации
      if (event.request.mode === "navigate") {
        return caches.match(OFFLINE_URL);
      }
    })
  );
});

// Запрос к сети с кэшированием
async function fetchAndCache(request) {
  const response = await fetch(request);
  
  // Кэшируем только успешные ответы
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  
  return response;
}

// Обновление кэша в фоне
async function updateCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response);
    }
  } catch (err) {
    // Игнорируем ошибки сети
    console.log("[SW] Не удалось обновить кэш:", err);
  }
}
