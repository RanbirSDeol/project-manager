/*

PROJECTS[X]:
: id [INT (++)]
: title [TEXT]
: progress [INT (0 - 100)]
: date_created [DATE]
: image [TEXT]
: githubLink [TEXT]
*/

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  image TEXT,
  githubLink TEXT,
  isFavorite BOOLEAN DEFAULT 0
);
