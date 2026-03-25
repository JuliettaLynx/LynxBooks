import { defineStore } from "pinia";
import { ref } from "vue";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { booksDB } from "../db/index";

export const useLibraryStore = defineStore("library", () => {
  const books = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const syncStatus = ref("synced");
  const lastSyncTime = ref(null);

  let unsubscribeBooks = null;

  // ========== Работа с IndexedDB ==========
  const saveBookToIndexedDB = async (bookData) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await booksDB.put({
        // Индексируемые поля
        id: bookData.id,
        title: bookData.title,
        author: bookData.author,
        status: bookData.status || "не прочитано",
        format: bookData.format || "paper",
        isFavorite: bookData.isFavorite || false,
        rating: bookData.rating || 0,
        createdAt: bookData.createdAt,

        // Неиндексируемые поля
        userId: user.uid,
        description: bookData.description || "",
        cover: bookData.cover || null,
        originalCover: bookData.originalCover || null,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Ошибка сохранения книги в IndexedDB:", err);
    }
  };

  // ========== Синхронизация ==========
  const initSync = (userId) => {
    if (!userId) return;

    if (unsubscribeBooks) {
      unsubscribeBooks();
    }

    loading.value = true;
    syncStatus.value = "synced";

    try {
      const booksRef = collection(db, `users/${userId}/books`);

      const q = query(booksRef, orderBy("createdAt", "desc"));

      unsubscribeBooks = onSnapshot(
        q,
        async (snapshot) => {
          const newBooks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          }));

          books.value = newBooks;

          for (const book of newBooks) {
            await saveBookToIndexedDB(book);
          }

          loading.value = false;
          lastSyncTime.value = new Date();
          error.value = null;
        },
        (err) => {
          console.error("Sync error:", err);

          if (
            err.code === "unavailable" ||
            err.code === "failed-precondition"
          ) {
            syncStatus.value = "offline";
          } else {
            syncStatus.value = "error";
            error.value = err.message;
          }

          loading.value = false;
        },
      );
    } catch (err) {
      console.error("Init sync error:", err);
      error.value = err.message;
      syncStatus.value = "error";
      loading.value = false;
    }
  };

  const cleanup = () => {
    if (unsubscribeBooks) {
      unsubscribeBooks();
      unsubscribeBooks = null;
    }
    books.value = [];
    error.value = null;
  };

  // Следим за сетью
  const initNetworkListener = () => {
    window.addEventListener("online", () => {
      syncStatus.value = "synced";
    });
    window.addEventListener("offline", () => {
      syncStatus.value = "offline";
    });
  };

  // ========== CRUD операции ==========
  const addBook = async (bookData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const userId = user.uid;

    // Оптимистичное обновление
    const tempId = `temp_${Date.now()}`;
    const optimisticBook = {
      id: tempId,
      ...bookData,
      createdAt: new Date(),
      updatedAt: new Date(),
      _syncStatus: "pending",
    };

    books.value = [optimisticBook, ...books.value];
    syncStatus.value = "pending";

    try {
      const booksRef = collection(db, `users/${userId}/books`);

      const docRef = await addDoc(booksRef, {
        ...bookData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isFavorite: bookData.isFavorite || false,
        rating: bookData.rating || 0,
        format: bookData.format || "paper",
        userId: userId,
      });

      books.value = books.value.filter((b) => b.id !== tempId);

      return docRef.id;
    } catch (err) {
      console.error("Add book error:", err);

      books.value = books.value.map((b) =>
        b.id === tempId ? { ...b, _syncStatus: "error" } : b,
      );

      error.value = err.message;
      throw err;
    }
  };

  const updateBook = async (id, bookData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const userId = user.uid;

    // Оптимистичное обновление
    const index = books.value.findIndex((b) => b.id === id);
    if (index === -1) return;

    const originalBook = { ...books.value[index] };
    books.value[index] = {
      ...books.value[index],
      ...bookData,
      updatedAt: new Date(),
      _syncStatus: "pending",
    };

    syncStatus.value = "pending";

    try {
      const bookRef = doc(db, `users/${userId}/books/${id}`);
      await updateDoc(bookRef, {
        ...bookData,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Update error:", err);
      books.value[index] = originalBook;
      error.value = err.message;
      throw err;
    }
  };

  const deleteBook = async (id) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const userId = user.uid;

    // Оптимистичное удаление
    const deletedBook = books.value.find((b) => b.id === id);
    books.value = books.value.filter((b) => b.id !== id);
    syncStatus.value = "pending";

    try {
      const bookRef = doc(db, `users/${userId}/books/${id}`);
      await deleteDoc(bookRef);
    } catch (err) {
      console.error("Delete error:", err);
      if (deletedBook) {
        books.value = [deletedBook, ...books.value];
      }
      error.value = err.message;
      throw err;
    }
  };

  // ========== Действия с книгами ==========
  const toggleFavorite = async (book) => {
    await updateBook(book.id, {
      isFavorite: !book.isFavorite,
    });
  };

  // ========== Получение данных ==========
  const getBook = async (id) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    try {
      const bookRef = doc(db, `users/${user.uid}/books/${id}`);
      const bookSnap = await getDoc(bookRef);

      if (bookSnap.exists()) {
        return {
          id: bookSnap.id,
          ...bookSnap.data(),
        };
      } else {
        return null;
      }
    } catch (err) {
      console.error("Get book error:", err);
      throw err;
    }
  };

  const getUnreadBooks = async (searchQuery = "") => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    try {
      const booksRef = collection(db, `users/${user.uid}/books`);
      const q = query(
        booksRef,
        where("status", "==", "не прочитано"),
        orderBy("title"),
      );

      const snapshot = await getDocs(q);
      let books = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        books = books.filter(
          (book) =>
            book.title.toLowerCase().includes(queryLower) ||
            book.author.toLowerCase().includes(queryLower),
        );
      }

      return books;
    } catch (err) {
      console.error("Get unread books error:", err);
      return [];
    }
  };

  const getBooksByStatus = (status) => {
    return books.value.filter((book) => book.status === status);
  };

  const getFavoriteBooks = () => {
    return books.value.filter((book) => book.isFavorite);
  };

  // ========== Пакетные операции ==========
  const batchAddBooks = async (booksArray) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const userId = user.uid;
    const batch = writeBatch(db);
    const booksRef = collection(db, `users/${userId}/books`);

    booksArray.forEach((bookData) => {
      const newBookRef = doc(booksRef);
      batch.set(newBookRef, {
        ...bookData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId,
      });
    });

    await batch.commit();
  };

  // ========== Инициализация ==========
  const init = () => {
    console.log("Library store initialized");
    initNetworkListener();
  };

  return {
    books,
    loading,
    error,
    syncStatus,
    lastSyncTime,
    init,
    initSync,
    cleanup,
    addBook,
    updateBook,
    deleteBook,
    toggleFavorite,
    getBook,
    getUnreadBooks,
    getBooksByStatus,
    getFavoriteBooks,
    batchAddBooks,
  };
});
