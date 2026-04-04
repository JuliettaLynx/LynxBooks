<template>
  <div
    class="min-h-screen bg-white transition-colors duration-200 dark:bg-bg-primary-dark flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <!-- Шапка с заголовком и темой -->
      <div
        class="bg-white dark:bg-bg-secondary-dark text-black dark:text-white rounded-t-2xl p-4 border-b border-border dark:border-border-dark"
      >
        <div class="flex justify-between items-center">
          <h1 class="text-2xl tracking-wider font-bold dark:text-white">
            {{ isLoginMode ? "Вход" : "Регистрация" }}
          </h1>
          <ThemeToggle />
        </div>
      </div>

      <!-- Основная форма -->
      <div
        class="bg-white dark:bg-bg-secondary-dark rounded-b-2xl p-6 shadow-lg"
      >
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Имя (только при регистрации) -->
          <div v-if="!isLoginMode" class="space-y-1">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Имя
            </label>
            <input
              v-model="displayName"
              type="text"
              placeholder="Как к вам обращаться?"
              class="w-full px-4 py-2 bg-white dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg dark:text-white transition-colors duration-200"
            />
          </div>

          <!-- Email -->
          <div class="space-y-1">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="your@email.com"
              class="w-full px-4 py-2 bg-white dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg dark:text-white transition-colors duration-200"
            />
          </div>

          <!-- Пароль -->
          <div class="space-y-1">
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Пароль
            </label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                required
                :placeholder="
                  isLoginMode ? 'Введите пароль' : 'Минимум 6 символов'
                "
                class="w-full px-4 py-2 bg-white dark:bg-border-dark/40 border border-border dark:border-border-dark rounded-lg dark:text-white transition-colors duration-200 pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <span class="text-lg">{{ showPassword ? "👁️" : "👁️‍🗨️" }}</span>
              </button>
            </div>
          </div>

          <!-- Сообщение об ошибке -->
          <div
            v-if="error"
            class="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg text-sm"
          >
            {{ error }}
          </div>

          <!-- Кнопка входа/регистрации -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-accent/80 hover:bg-accent/60 font-medium text-black dark:text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">
              {{ isLoginMode ? "Войти" : "Зарегистрироваться" }}
            </span>
            <span v-else class="flex items-center justify-center">
              <span class="animate-spin mr-2">⌛</span>
              Загрузка...
            </span>
          </button>

          <!-- Разделитель -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div
                class="w-full border-t border-border dark:border-border-dark"
              ></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span
                class="px-2 bg-white dark:bg-border-dark rounded-lg text-gray-500 dark:text-gray-400"
              >
                или
              </span>
            </div>
          </div>

          <!-- Вход через Google -->
          <button
            type="button"
            @click="handleGoogleLogin"
            :disabled="loading"
            class="w-full py-3 bg-white dark:bg-border-dark/40 border border-border dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              class="w-5 h-5"
              onerror="this.src = 'data:image/svg+xml,...'"
            />
            <span>Продолжить с Google</span>
          </button>

          <!-- Переключение режима -->
          <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            {{ isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?" }}
            <button
              type="button"
              @click="toggleMode"
              class="text-accent hover:underline font-medium ml-1"
            >
              {{ isLoginMode ? "Создать" : "Войти" }}
            </button>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import ThemeToggle from "../components/ThemeToggle.vue";

const router = useRouter();

// Состояние формы
const email = ref("");
const password = ref("");
const displayName = ref("");
const error = ref("");
const loading = ref(false);
const showPassword = ref(false);
const isLoginMode = ref(true);

// Переключение между входом и регистрацией
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value;
  error.value = "";
  password.value = ""; // Очищаем пароль при смене режима
};

// Обработка отправки формы
const handleSubmit = async () => {
  loading.value = true;
  error.value = "";

  try {
    if (isLoginMode.value) {
      // Вход
      await signInWithEmailAndPassword(auth, email.value, password.value);
    } else {
      // Регистрация
      if (password.value.length < 6) {
        throw new Error("Пароль должен быть минимум 6 символов");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value,
      );

      // Добавляем имя пользователя если указано
      if (displayName.value) {
        await updateProfile(userCredential.user, {
          displayName: displayName.value,
        });
      }
    }

    // Успешная авторизация - редирект на главную
    router.push("/library");
  } catch (err) {
    console.error("Auth error:", err);

    const errorMessages = {
      // Email/Password errors
      "auth/user-not-found": "Пользователь с таким email не найден",
      "auth/wrong-password": "Неверный пароль",
      "auth/email-already-in-use": "Этот email уже зарегистрирован",
      "auth/weak-password": "Пароль должен содержать минимум 6 символов",
      "auth/invalid-email": "Некорректный формат email",
      "auth/invalid-credential": "Неверные учетные данные",
      "auth/too-many-requests": "Слишком много попыток. Попробуйте позже",

      // User disabled
      "auth/user-disabled": "Аккаунт отключен",

      // Network errors
      "auth/network-request-failed": "Ошибка сети. Проверьте подключение",

      // Password reset
      "auth/requires-recent-login": "Требуется повторный вход",

      // Google auth errors
      "auth/popup-closed-by-user": "Вход через Google отменен",
      "auth/popup-blocked": "Всплывающее окно заблокировано браузером",
      "auth/cancelled-popup-request": "Запрос входа отменен",

      // Session expired
      "auth/session-expired": "Сессия истекла. Войдите снова",

      // Default
      default: "Произошла ошибка. Попробуйте снова",
    };

    // Проверяем, есть ли код ошибки Firebase
    if (err.code && errorMessages[err.code]) {
      error.value = errorMessages[err.code];
    } else {
      // Если это не Firebase ошибка или неизвестный код
      error.value = err.message || errorMessages.default;
    }
  } finally {
    loading.value = false;
  }
};

// Вход через Google
const handleGoogleLogin = async () => {
  loading.value = true;
  error.value = "";

  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push("/library");
  } catch (err) {
    console.error("Google error:", err);
    error.value = err.message || "Ошибка входа через Google";
  } finally {
    loading.value = false;
  }
};
</script>
