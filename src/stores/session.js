import { defineStore } from "pinia";
import { ref } from "vue";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { sessionsDB } from "../db/index";
import { useLibraryStore } from "./library";

export const useSessionStore = defineStore("session", () => {
  const sessions = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const syncStatus = ref("synced");
  const lastSession = ref(null);

  let unsubscribeSessions = null;

  // ========== Работа с IndexedDB ==========
  const saveSessionToIndexedDB = async (sessionData) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const pagesRead =
        sessionData.pagesRead ||
        (sessionData.endPage && sessionData.startPage
          ? sessionData.endPage - sessionData.startPage + 1
          : 0);

      await sessionsDB.put({
        // Индексируемые поля
        id: sessionData.id,
        bookId: sessionData.bookId,
        date: sessionData.date,
        finishedBook: sessionData.finishedBook || false,
        pagesRead: pagesRead,
        color: sessionData.color || "#9CA3AF",
        createdAt: sessionData.createdAt,

        // Неиндексируемые поля
        userId: user.uid,
        bookTitle: sessionData.bookTitle || "",
        startDate: sessionData.startDate || null,
        startPage: sessionData.startPage || null,
        endPage: sessionData.endPage || null,
        rating: sessionData.rating || 0,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Ошибка сохранения сессии в IndexedDB:", err);
    }
  };

  // ========== Работа с localStorage ==========
  const loadLastSession = () => {
    const saved = localStorage.getItem("lastSession");
    if (saved) {
      try {
        lastSession.value = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing last session:", e);
      }
    }
    return lastSession.value;
  };

  const saveLastSession = (session) => {
    if (session && session.bookId) {
      lastSession.value = {
        bookId: session.bookId,
        bookTitle: session.bookTitle,
        color: session.color,
      };
      localStorage.setItem("lastSession", JSON.stringify(lastSession.value));
    }
  };

  // ========== Синхронизация ==========
  const initSync = (userId) => {
    if (!userId) return;

    if (unsubscribeSessions) {
      unsubscribeSessions();
    }

    loading.value = true;
    syncStatus.value = "synced";

    try {
      const sessionsRef = collection(db, `users/${userId}/sessions`);
      const q = query(sessionsRef, orderBy("date", "desc"));

      unsubscribeSessions = onSnapshot(
        q,
        async (snapshot) => {
          const newSessions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            startDate: doc.data().startDate?.toDate?.() || doc.data().startDate,
            date: doc.data().date?.toDate?.() || doc.data().date,
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          }));

          sessions.value = newSessions;

          for (const session of newSessions) {
            await saveSessionToIndexedDB(session);
          }

          loading.value = false;
          error.value = null;
        },
        (err) => {
          console.error("Sessions sync error:", err);
          syncStatus.value = "error";
          error.value = err.message;
          loading.value = false;
        },
      );
    } catch (err) {
      console.error("Init sessions sync error:", err);
      loading.value = false;
    }
  };

  const cleanup = () => {
    if (unsubscribeSessions) {
      unsubscribeSessions();
      unsubscribeSessions = null;
    }
    sessions.value = [];
  };

  // ========== Получение данных ==========
  const getSessionsByDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    return sessions.value.filter((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate >= targetDate && sessionDate < nextDate;
    });
  };

  const getPagesReadByDate = (date) => {
    const daySessions = getSessionsByDate(date);
    return daySessions.reduce(
      (sum, session) => sum + (session.pagesRead || 0),
      0,
    );
  };

  const getSessionsByBook = (bookId) => {
    return sessions.value.filter((session) => session.bookId === bookId);
  };

  const getBookStats = (bookId) => {
    const bookSessions = getSessionsByBook(bookId);
    const totalPagesRead = bookSessions.reduce(
      (sum, session) => sum + (session.pagesRead || 0),
      0,
    );
    const lastReadDate =
      bookSessions.length > 0
        ? Math.max(...bookSessions.map((s) => new Date(s.date).getTime()))
        : null;

    return {
      totalPagesRead,
      sessionsCount: bookSessions.length,
      lastReadDate: lastReadDate ? new Date(lastReadDate) : null,
      finished: bookSessions.some((s) => s.finishedBook),
    };
  };

  // ========== CRUD операции ==========
  const addSession = async (sessionData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const libraryStore = useLibraryStore();

    const pagesRead =
      sessionData.pagesRead ||
      (sessionData.endPage && sessionData.startPage
        ? sessionData.endPage - sessionData.startPage + 1
        : 0);

    const tempId = `temp_${Date.now()}`;
    const optimisticSession = {
      id: tempId,
      ...sessionData,
      pagesRead: pagesRead,
      createdAt: new Date(),
      updatedAt: new Date(),
      _syncStatus: "pending",
    };

    sessions.value = [optimisticSession, ...sessions.value];
    syncStatus.value = "pending";

    try {
      const sessionsRef = collection(db, `users/${user.uid}/sessions`);

      const docRef = await addDoc(sessionsRef, {
        ...sessionData,
        pagesRead: pagesRead,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: user.uid,
      });

      saveLastSession({
        bookId: sessionData.bookId,
        bookTitle: sessionData.bookTitle,
        color: sessionData.color,
      });

      if (sessionData.finishedBook) {
        await libraryStore.updateBook(sessionData.bookId, {
          status: "прочитано",
          rating: sessionData.rating || 0,
        });
      }

      sessions.value = sessions.value.filter((s) => s.id !== tempId);
      return docRef.id;
    } catch (err) {
      console.error("Add session error:", err);
      sessions.value = sessions.value.map((s) =>
        s.id === tempId ? { ...s, _syncStatus: "error" } : s,
      );
      error.value = err.message;
      throw err;
    }
  };

  const updateSession = async (id, sessionData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const libraryStore = useLibraryStore();
    const index = sessions.value.findIndex((s) => s.id === id);
    if (index === -1) return;

    const originalSession = { ...sessions.value[index] };

    const pagesRead =
      sessionData.pagesRead ||
      (sessionData.endPage && sessionData.startPage
        ? sessionData.endPage - sessionData.startPage + 1
        : originalSession.pagesRead);

    sessions.value[index] = {
      ...sessions.value[index],
      ...sessionData,
      pagesRead: pagesRead,
      updatedAt: new Date(),
      _syncStatus: "pending",
    };

    try {
      const sessionRef = doc(db, `users/${user.uid}/sessions/${id}`);
      await updateDoc(sessionRef, {
        ...sessionData,
        pagesRead: pagesRead,
        updatedAt: serverTimestamp(),
      });

      if (sessionData.finishedBook && !originalSession.finishedBook) {
        await libraryStore.updateBook(sessionData.bookId, {
          status: "прочитано",
          rating: sessionData.rating || 0,
        });
      }
    } catch (err) {
      console.error("Update session error:", err);
      sessions.value[index] = originalSession;
      error.value = err.message;
      throw err;
    }
  };

  const deleteSession = async (id) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const deletedSession = sessions.value.find((s) => s.id === id);
    sessions.value = sessions.value.filter((s) => s.id !== id);

    try {
      const sessionRef = doc(db, `users/${user.uid}/sessions/${id}`);
      await deleteDoc(sessionRef);
    } catch (err) {
      console.error("Delete session error:", err);
      if (deletedSession) {
        sessions.value = [deletedSession, ...sessions.value];
      }
      error.value = err.message;
      throw err;
    }
  };

  return {
    sessions,
    loading,
    error,
    syncStatus,
    lastSession,
    initSync,
    cleanup,
    addSession,
    updateSession,
    deleteSession,
    getSessionsByDate,
    getPagesReadByDate,
    getSessionsByBook,
    getBookStats,
    loadLastSession,
    saveLastSession,
  };
});
