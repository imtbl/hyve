-- Up
CREATE TABLE `users` (
  `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
  `username` TEXT NOT NULL UNIQUE,
  `password` TEXT NOT NULL,
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);

-- Down
DROP TABLE `users`;
