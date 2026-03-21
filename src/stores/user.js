import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { updateProfile as firebaseUpdateProfile } from "firebase/auth";
import { db, auth } from "../firebase/config";
import { usersDB } from "../db/index";

export const useUserStore = defineStore("user", () => {
  const dailyGoal = ref(parseInt(localStorage.getItem("dailyGoal")) || 50);
  const userData = ref(null);
  const loading = ref(false);
  const syncStatus = ref("synced");

  let unsubscribeUser = null;

  // Сохранение данных пользователя в IndexedDB
  const saveUserToIndexedDB = async (userId, data) => {
    if (!userId) return;

    try {
      const existing = await usersDB.get(userId);
      const now = new Date().toISOString();

      if (existing) {
        await usersDB.update(userId, {
          ...data,
          updatedAt: now,
        });
      } else {
        await usersDB.add({
          userId: userId,
          ...data,
          createdAt: now,
          updatedAt: now,
        });
      }
      console.log("Пользователь сохранен в IndexedDB");
    } catch (error) {
      console.error("Ошибка сохранения пользователя в IndexedDB:", error);
    }
  };

  // Инициализация синхронизации пользовательских данных
  const initUserSync = (userId) => {
    if (!userId) return;

    // Очищаем предыдущую подписку
    if (unsubscribeUser) {
      unsubscribeUser();
    }

    loading.value = true;
    syncStatus.value = "synced";

    try {
      const userRef = doc(db, "users", userId);

      unsubscribeUser = onSnapshot(
        userRef,
        async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();

            // Преобразуем timestamp в Date
            const userDataObj = {
              userId: snapshot.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || data.createdAt,
              updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            };

            userData.value = userDataObj;

            // Сохраняем в IndexedDB для кэширования
            await saveUserToIndexedDB(snapshot.id, {
              ...data,
              userId: snapshot.id,
            });

            // Обновляем локальное хранилище
            if (data.dailyGoal) {
              dailyGoal.value = data.dailyGoal;
              localStorage.setItem("dailyGoal", data.dailyGoal);
            }
          } else {
            // Создаем запись если её нет
            console.log("Создаем документ пользователя в Firestore");
            const newUserData = {
              email: auth.currentUser?.email || "",
              displayName: auth.currentUser?.displayName || "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              dailyGoal: dailyGoal.value,
              avatar: null,
              originalAvatar: null,
            };

            await setDoc(userRef, newUserData);

            // Сохраняем в IndexedDB сразу
            await saveUserToIndexedDB(userId, {
              ...newUserData,
              userId: userId,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          loading.value = false;
        },
        (err) => {
          console.error("User sync error:", err);
          syncStatus.value = "error";
          loading.value = false;
        },
      );
    } catch (err) {
      console.error("Init user sync error:", err);
      loading.value = false;
    }
  };

  // Сохранение данных пользователя в Firestore (с проверкой существования)
  const saveUserToFirestore = async (updates) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    try {
      const userRef = doc(db, "users", user.uid);

      // Проверяем существует ли документ
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        // Обновляем существующий документ
        await updateDoc(userRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Создаем новый документ
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          dailyGoal: dailyGoal.value,
          avatar: null,
          originalAvatar: null,
          ...updates,
        });
      }

      console.log("Данные пользователя сохранены в Firestore");

      // Обновляем локальный userData
      if (userData.value) {
        userData.value = {
          ...userData.value,
          ...updates,
          updatedAt: new Date(),
        };
      }

      // Сохраняем в IndexedDB
      await saveUserToIndexedDB(user.uid, {
        ...(userData.value || {}),
        ...updates,
        userId: user.uid,
      });

      return true;
    } catch (err) {
      console.error("Save user error:", err);
      throw err;
    }
  };

  // Обновление аватара
  const updateAvatar = async (avatarBase64, originalAvatarBase64 = null) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    try {
      const updates = {
        avatar: avatarBase64,
        updatedAt: serverTimestamp(),
      };

      if (originalAvatarBase64 !== undefined) {
        updates.originalAvatar = originalAvatarBase64;
      }

      await saveUserToFirestore(updates);

      // Также сохраняем в локальном userData
      if (userData.value) {
        userData.value.avatar = avatarBase64;
        if (originalAvatarBase64 !== undefined) {
          userData.value.originalAvatar = originalAvatarBase64;
        }
        userData.value.updatedAt = new Date();
      }

      return true;
    } catch (err) {
      console.error("Update avatar error:", err);
      throw err;
    }
  };

  // Полное обновление профиля
  const updateProfile = async (updates) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    try {
      // Обновляем Firebase Auth если нужно
      if (updates.displayName) {
        await firebaseUpdateProfile(user, { displayName: updates.displayName });
      }

      // Сохраняем в Firestore
      await saveUserToFirestore({
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Обновляем локальные данные
      if (userData.value) {
        userData.value = {
          ...userData.value,
          ...updates,
          updatedAt: new Date(),
        };
      }

      return true;
    } catch (err) {
      console.error("Update profile error:", err);
      throw err;
    }
  };

  // Установка дневной цели
  const setDailyGoal = async (goal) => {
    dailyGoal.value = goal;
    localStorage.setItem("dailyGoal", goal);

    // Синхронизируем с Firestore
    const user = auth.currentUser;
    if (user) {
      await saveUserToFirestore({ dailyGoal: goal });
    }
  };

  // Загрузка пользователя из IndexedDB (для быстрого старта)
  const loadUserFromIndexedDB = async (userId) => {
    if (!userId) return null;

    try {
      const user = await usersDB.get(userId);
      if (user) {
        console.log("Пользователь загружен из IndexedDB");
        return user;
      }
    } catch (error) {
      console.error("Ошибка загрузки из IndexedDB:", error);
    }
    return null;
  };

  // Очистка при логауте
  const cleanup = () => {
    if (unsubscribeUser) {
      unsubscribeUser();
      unsubscribeUser = null;
    }
    userData.value = null;
  };

  return {
    dailyGoal,
    userData,
    loading,
    syncStatus,
    initUserSync,
    saveUserToFirestore,
    updateAvatar,
    updateProfile,
    setDailyGoal,
    loadUserFromIndexedDB,
    cleanup,
  };
});
