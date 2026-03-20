import Dexie from "dexie";

export const db = new Dexie("lynx-books-db");

// Определяем схему базы данных
db.version(3).stores({
  books:
    "++id, title, author, status, isFavorite, rating, format, description, cover, originalCover, createdAt",
  users:
    "userId, avatar, originalAvatar, displayName, email, dailyGoal, createdAt, updatedAt",
});

// Создаем таблицу с индексами для поиска и сортировки
export const booksDB = db.books;
export const usersDB = db.users;
