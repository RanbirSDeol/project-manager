/*

PROJECTS[X]:
: id [INT (++)]
: title [TEXT]
: description [TEXT]
: progress [INT (0 - 100)]
: image [TEXT]
: githubLink [TEXT]

*/

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
  image TEXT,
  githubLink TEXT
);
