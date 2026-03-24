import Dexie from "dexie";

export const db = new Dexie("lynx-books-db");

db.version(8).stores({
  books: "++id, title, author, status, format, isFavorite, rating, createdAt",
  users: "userId, email, dailyGoal, createdAt, updatedAt",
  sessions: "++id, bookId, date, finishedBook, pagesRead, color, createdAt",
});

// Создаем таблицу с индексами для поиска и сортировки
export const booksDB = db.books;
export const usersDB = db.users;
export const sessionsDB = db.sessions;
