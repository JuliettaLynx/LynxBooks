<template>
  <div class="relative" ref="menuContainer">
    <!-- Иконка профиля -->
    <button
      @click.stop="toggleMenu"
      class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg hover:ring-2 hover:ring-blue-300 transition-all overflow-hidden"
      :class="{ 'ring-2 ring-blue-400': isOpen }"
    >
      <img
        v-if="userAvatar"
        :src="userAvatar"
        alt="avatar"
        class="w-full h-full object-cover"
      />
      <span v-else>
        {{ user?.displayName?.charAt(0) || user?.email?.charAt(0) || "?" }}
      </span>
    </button>

    <!-- Выпадающее меню -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
    >
      <!-- Шапка профиля -->
      <div class="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <button
          @click.stop="openSection('profile')"
          class="rounded-lg w-72 flex transition-colors"
        >
          <div
            class="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold overflow-hidden"
          >
            <img
              v-if="userAvatar"
              :src="userAvatar"
              alt="avatar"
              class="w-full h-full object-cover"
            />
            <span v-else>
              {{
                user?.displayName?.charAt(0) || user?.email?.charAt(0) || "?"
              }}
            </span>
          </div>

          <div class="flex-1 min-w-0 relative text-left left-3">
            <p class="font-bold truncate">
              {{ user?.displayName || "Пользователь" }}
            </p>
            <p class="text-sm text-white/80 truncate">{{ user?.email }}</p>
          </div>

          <div class="w-12">
            <span class="text-white relative top-1 left-2 text-xl">✎</span>
          </div>
        </button>
      </div>

      <!-- Статистика -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <span class="text-gray-600 dark:text-gray-400">Цель на день:</span>

          <button
            @click.stop="openSection('goal')"
            class="rounded-lg flex items-center gap-3 transition-colors"
          >
            <span
              class="font-bold relative right-1 text-blue-600 dark:text-blue-400"
              >{{ dailyGoal || 0 }} стр.</span
            >
          </button>
        </div>
      </div>

      <!-- Настройки темы -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400 mb-3">Оформление:</p>
        <div class="grid grid-cols-3 gap-2">
          <button
            @click.stop="setTheme('light')"
            class="flex flex-col items-center p-2 rounded-lg transition-colors"
            :class="
              colorMode === 'light'
                ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            "
          >
            <span class="text-2xl mb-1">☀️</span>
            <span class="text-xs dark:text-gray-300">Светлая</span>
          </button>

          <button
            @click.stop="setTheme('dark')"
            class="flex flex-col items-center p-2 rounded-lg transition-colors"
            :class="
              colorMode === 'dark'
                ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            "
          >
            <span class="text-2xl mb-1">🌙</span>
            <span class="text-xs dark:text-gray-300">Тёмная</span>
          </button>

          <button
            @click.stop="setTheme('auto')"
            class="flex flex-col items-center p-2 rounded-lg transition-colors"
            :class="
              colorMode === 'auto'
                ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            "
          >
            <span class="text-2xl mb-1">⚙️</span>
            <span class="text-xs dark:text-gray-300">Системная</span>
          </button>
        </div>
      </div>

      <!-- Меню действий -->
      <div class="p-2">
        <button
          @click.stop="openSection('password')"
          class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 transition-colors"
        >
          <span class="flex-1 text-base text-gray-600 dark:text-gray-400"
            >Сменить пароль</span
          >
        </button>

        <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>

        <button
          @click.stop="handleLogout"
          class="w-full px-4 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
        >
          <span class="flex-1 text-base">Выйти</span>
        </button>

        <button
          @click.stop="confirmDelete"
          class="w-full px-4 py-1 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
        >
          <span class="flex-1 text-base">Удалить аккаунт</span>
        </button>
      </div>
    </div>

    <!-- Модальное окно редактирования -->
    <Teleport to="body">
      <div
        v-if="activeSection"
        class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
        @click.self="closeSection"
      >
        <div
          class="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col"
        >
          <!-- Заголовок модалки -->
          <div
            class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"
          >
            <h2 class="text-xl font-bold dark:text-white">{{ modalTitle }}</h2>
            <button
              @click="closeSection"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span class="text-2xl">✕</span>
            </button>
          </div>

          <!-- Контент модалки -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Редактирование профиля -->
            <div v-if="activeSection === 'profile'" class="space-y-4">
              <div class="flex justify-center">
                <AvatarUploader
                  :avatar-preview="avatarPreview"
                  :avatar-file="avatarFile"
                  :original-image="originalAvatar"
                  :user-id="user?.uid"
                  :display-name="editDisplayName"
                  :email="user?.email"
                  @update:avatar-preview="handleAvatarPreviewUpdate"
                  @update:avatar-file="avatarFile = $event"
                  @update:original-image="originalAvatar = $event"
                  @remove="handleAvatarRemove"
                />
              </div>

              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Имя</label
                >
                <input
                  v-model="editDisplayName"
                  type="text"
                  class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>

            <!-- Изменение цели -->
            <div v-if="activeSection === 'goal'" class="space-y-4">
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Дневная цель (страниц)
                </label>
                <input
                  v-model.number="editDailyGoal"
                  type="number"
                  min="1"
                  class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>

            <!-- Смена пароля -->
            <div v-if="activeSection === 'password'" class="space-y-4">
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Текущий пароль</label
                >
                <input
                  v-model="passwordData.current"
                  type="password"
                  autocomplete="off"
                  readonly
                  onfocus="this.removeAttribute('readonly')"
                  class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Новый пароль</label
                >
                <input
                  v-model="passwordData.new"
                  type="password"
                  class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Подтверждение</label
                >
                <input
                  v-model="passwordData.confirm"
                  type="password"
                  class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>

            <!-- Сообщение об ошибке/успехе -->
            <div
              v-if="sectionError"
              class="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm"
            >
              {{ sectionError }}
            </div>
            <div
              v-if="sectionSuccess"
              class="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm"
            >
              {{ sectionSuccess }}
            </div>
          </div>

          <!-- Кнопки действий -->
          <div
            class="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2"
          >
            <button
              @click="closeSection"
              class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Отмена
            </button>
            <button
              @click="saveSection"
              :disabled="sectionLoading"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <span v-if="!sectionLoading">Сохранить</span>
              <span v-else class="flex items-center justify-center">
                <span class="animate-spin mr-2">⌛</span>
                Сохранение...
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useColorMode } from "@vueuse/core";
import { auth } from "../firebase/config";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  signOut,
} from "firebase/auth";
import { useUserStore } from "../stores/user";
import { usersDB } from "../db/index";
import AvatarUploader from "./AvatarUploader.vue";

const router = useRouter();
const userStore = useUserStore();
const user = computed(() => auth.currentUser);

// Тема
const colorMode = useColorMode({
  emitAuto: true,
  modes: {
    light: "light",
    dark: "dark",
    auto: "auto",
  },
});

// Состояние меню
const isOpen = ref(false);
const activeSection = ref(null);
const menuContainer = ref(null);

// Данные для редактирования
const editDisplayName = ref("");
const avatarPreview = ref(null);
const avatarFile = ref(null);
const originalAvatar = ref(null);
const editDailyGoal = ref(50);

const passwordData = ref({
  current: "",
  new: "",
  confirm: "",
});

// Состояния загрузки
const sectionLoading = ref(false);
const sectionError = ref("");
const sectionSuccess = ref("");

// Цель
const dailyGoal = ref(50);

// Аватар пользователя
const userAvatar = ref(null);
const hasAvatarChanged = ref(false);

// Заголовок модалки
const modalTitle = computed(() => {
  switch (activeSection.value) {
    case "profile":
      return "Редактировать профиль";
    case "goal":
      return "Изменить цель";
    case "password":
      return "Сменить пароль";
    default:
      return "";
  }
});

// Обработчики AvatarUploader
const handleAvatarPreviewUpdate = (newPreview) => {
  avatarPreview.value = newPreview;
  hasAvatarChanged.value = true;
};

const handleAvatarRemove = () => {
  avatarPreview.value = null;
  avatarFile.value = null;
  originalAvatar.value = null;
  userAvatar.value = null;
  hasAvatarChanged.value = true;
};

// Обновляем загрузку пользовательских данных
const loadUserData = async () => {
  if (!user.value?.uid) return;

  try {
    // Загружаем из userStore или IndexedDB
    let userData = userStore.userData;

    if (!userData) {
      userData = await usersDB.get(user.value.uid);
    }

    if (userData) {
      // Аватар
      if (userData.avatar) {
        userAvatar.value = userData.avatar;
        avatarPreview.value = userData.avatar;
      }

      // Оригинальный аватар (для редактирования)
      if (userData.originalAvatar) {
        originalAvatar.value = userData.originalAvatar;
      }

      // Цель
      if (userData.dailyGoal) {
        dailyGoal.value = userData.dailyGoal;
        editDailyGoal.value = userData.dailyGoal;
      }

      // Имя
      if (userData.displayName) {
        editDisplayName.value = userData.displayName;
      } else if (user.value?.displayName) {
        editDisplayName.value = user.value.displayName;
      }
    } else {
      // Если нет данных, берем из Firebase Auth
      if (user.value?.displayName) {
        editDisplayName.value = user.value.displayName;
      }
      if (user.value?.photoURL) {
        userAvatar.value = user.value.photoURL;
        avatarPreview.value = user.value.photoURL;
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки пользователя:", error);
  }
};

// Сохранение данных пользователя в IndexedDB
const saveUserToDB = async (updates) => {
  if (!user.value?.uid) return;

  try {
    const existing = await usersDB.get(user.value.uid);
    if (existing) {
      await usersDB.update(user.value.uid, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await usersDB.add({
        userId: user.value.uid,
        email: user.value.email,
        ...updates,
        createdAt: new Date().toISOString(),
      });
    }
    console.log("Пользователь сохранен в IndexedDB");
  } catch (error) {
    console.error("Ошибка сохранения пользователя в IndexedDB:", error);
    throw error;
  }
};

// Обработчик клика вне меню
const handleClickOutside = (event) => {
  if (menuContainer.value && !menuContainer.value.contains(event.target)) {
    isOpen.value = false;
  }
};

// Методы для темы
const setTheme = (theme) => {
  colorMode.value = theme;
  isOpen.value = false;
};

// Методы меню
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const openSection = (section) => {
  activeSection.value = section;
  isOpen.value = false;
  hasAvatarChanged.value = false;

  if (section === "profile") {
    editDisplayName.value = user.value?.displayName || "";
    // Загружаем текущий аватар для отображения в редакторе
    if (userAvatar.value) {
      avatarPreview.value = userAvatar.value;
    }
    originalAvatar.value = null;
    avatarFile.value = null;
  } else if (section === "goal") {
    editDailyGoal.value = dailyGoal.value;
  } else if (section === "password") {
    passwordData.value = { current: "", new: "", confirm: "" };
  }

  sectionError.value = "";
  sectionSuccess.value = "";
};

const closeSection = () => {
  activeSection.value = null;
  hasAvatarChanged.value = false;
};

const saveSection = async () => {
  sectionLoading.value = true;
  sectionError.value = "";
  sectionSuccess.value = "";

  try {
    switch (activeSection.value) {
      case "profile": {
        // Обновляем имя в Firebase Auth если изменилось
        if (editDisplayName.value !== user.value?.displayName) {
          await updateProfile(user.value, {
            displayName: editDisplayName.value,
          });
        }

        // Если аватар был изменен
        if (hasAvatarChanged.value) {
          if (avatarPreview.value) {
            // Сохраняем новый аватар
            await userStore.updateAvatar(
              avatarPreview.value,
              originalAvatar.value,
            );
            userAvatar.value = avatarPreview.value;
          } else {
            // Удаляем аватар
            await userStore.updateAvatar(null, null);
            userAvatar.value = null;
          }
        } else if (editDisplayName.value !== user.value?.displayName) {
          // Если изменилось только имя
          await userStore.updateProfile({ displayName: editDisplayName.value });
        }

        sectionSuccess.value = "Профиль обновлён";
        break;
      }

      case "goal":
        dailyGoal.value = editDailyGoal.value;
        localStorage.setItem("dailyGoal", editDailyGoal.value);
        userStore.setDailyGoal(editDailyGoal.value);
        await saveUserToDB({ dailyGoal: editDailyGoal.value });
        sectionSuccess.value = "Цель обновлена";
        break;

      case "password":
        if (passwordData.value.new !== passwordData.value.confirm) {
          throw new Error("Пароли не совпадают");
        }
        if (passwordData.value.new.length < 6) {
          throw new Error("Пароль должен быть минимум 6 символов");
        }

        const credential = EmailAuthProvider.credential(
          user.value.email,
          passwordData.value.current,
        );
        await reauthenticateWithCredential(user.value, credential);
        await updatePassword(user.value, passwordData.value.new);
        sectionSuccess.value = "Пароль успешно изменён";
        passwordData.value = { current: "", new: "", confirm: "" };
        break;
    }

    setTimeout(() => {
      closeSection();
    }, 1000);
  } catch (error) {
    console.error("Save error:", error);
    sectionError.value = error.message || "Произошла ошибка";
  } finally {
    sectionLoading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push("/auth");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

const confirmDelete = () => {
  if (
    confirm(
      "Вы уверены? Это действие нельзя отменить. Все ваши данные будут удалены.",
    )
  ) {
    deleteAccount();
  }
};

const deleteAccount = async () => {
  try {
    // Удаляем данные пользователя из IndexedDB
    if (user.value?.uid) {
      await usersDB.delete(user.value.uid);
    }
    await deleteUser(user.value);
    router.push("/auth");
  } catch (error) {
    console.error("Delete account error:", error);
    alert("Ошибка при удалении аккаунта");
  }
};

// Следим за изменениями в userStore
watch(
  () => userStore.userData,
  (newData) => {
    if (newData) {
      if (newData.avatar && newData.avatar !== userAvatar.value) {
        userAvatar.value = newData.avatar;
        avatarPreview.value = newData.avatar;
      }
      if (
        newData.displayName &&
        newData.displayName !== editDisplayName.value
      ) {
        editDisplayName.value = newData.displayName;
      }
      if (newData.dailyGoal && newData.dailyGoal !== dailyGoal.value) {
        dailyGoal.value = newData.dailyGoal;
        editDailyGoal.value = newData.dailyGoal;
      }
    }
  },
  { immediate: true, deep: true },
);

// Добавляем слушатель событий
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  loadUserData();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
