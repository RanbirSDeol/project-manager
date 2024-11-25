# Project Manager

Project Manager is a fullstack application which allows you to store, and track current projects you are working on. This application also allows you to upload an image to visually be able to see what each project represents. Moreover, you can track progress, and a favorite certain projects. Finally, you can fully manipulate projects, since this program follows CRUD: (create, read, update, and delete projects).

# Using the Program

## 1. Clone the repository

Start by cloning this repository to your local machine:

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

## 2. Install dependencies

Run the following command to install the necessary packages:

```bash
npm install
```

## 3. Set up the database

To set up the SQLite database, you'll need to run the schema to create the necessary tables. Run the following commands:

```bash
sqlite3 projects.db < schema.sql
```

This will create the `projects.db` SQLite database with the correct schema.

## 4. Start the application

Run the server with the following command:

```bash
npm start
```

This will start the application, which will be accessible at `http://localhost:3000`.

## 5. API Endpoints

### GET: `/projects/:id`

Retrieves a specific project from the database by ID.

Example:

```bash
GET /projects/1
```

### PUT: `/projects/:id`

Edits a project in the database by ID.

Example:

```bash
PUT /projects/1
```

Body:

```json
{
  "title": "New Project Title",
  "progress": 50,
  "githubLink": "https://github.com/yourusername/yourproject"
}
```

### POST: `/projects`

Creates a new project in the database.

Example:

```bash
POST /projects
```

Body:

```json
{
  "title": "Project Title",
  "progress": 20,
  "githubLink": "https://github.com/yourusername/yourproject"
}
```

### DELETE: `/projects/:id`

Deletes a project from the database by ID.

Example:

```bash
DELETE /projects/1
```

## 6. Database Schema

The SQLite database schema (`schema.sql`) should include the following table for storing project data:

```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    progress INTEGER NOT NULL CHECK(progress >= 0 AND progress <= 100),
    githubLink TEXT NOT NULL,
    image TEXT,
    isFavorite INTEGER DEFAULT 0,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
