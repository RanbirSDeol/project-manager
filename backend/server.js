// Server.js
// Nov 24, 2024
// Main backend of project

// Imports
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite = require("sqlite3").verbose();
const fs = require("fs");
const multer = require("multer"); // Import multer
const path = require("path");

// Initialization
const app = express(); // Creating our backend
const PORT = 5000; // Backend PORT

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Storager for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = path.join(__dirname, "uploads");
    cb(null, uploadsPath); // Store uploaded images in the "uploads" folder
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname); // Get file extension
    cb(null, Date.now() + fileExtension); // Generate unique filename based on timestamp
  },
});
const upload = multer({ storage: storage });

// | Data Base |

const dbPath = path.join(__dirname, "db", "projects.db");
const database = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error("Error Connecting to Database: ", err.message);
  } else {
    console.log("SQLite Database Connection Success");
  }
});

// | CREATE, READ, UPDATE, and DELETE (CRUD) |

// |GET|: [/projects]: Returns all of our project.
app.get("/projects", (req, res) => {
  // Insert all projects into a list
  database.all("SELECT * FROM projects", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Return as JSON
    res.json({ projects: rows });
  });
});

//|POST|: [/wipe-database]: Wipes our database, used for testing.
app.post("/wipe-database", (req, res) => {
  const query = "DELETE FROM projects";
  database.run(query, function (err) {
    if (err) {
      console.error("Failed to Wipe Database:", err.message);
      return res.status(500).json({ error: "Failed to Wipe Database" });
    }
    console.log("Database Wiped");
    res.json({ message: "Database Wiped" });
  });
});

// |POST|: [/projects]: Creating a Project
app.post("/projects", upload.single("image"), (req, res) => {
  // Our params
  const { title, progress, githubLink, date_created, isFavorite } = req.body;

  // Ensure the image is handled correctly
  const image = req.file ? "/uploads/" + req.file.filename : ""; // Image path to be stored in DB

  // Validate required fields
  if (!title || !progress || !githubLink) {
    return res
      .status(400)
      .json({ message: "Title, Progress, and Github Link are Required" });
  }

  // Invalid Progress
  if (progress < 0 || progress > 100) {
    return res
      .status(400)
      .json({ message: "Progress Must Be Between 0 - 100" });
  }

  // Set default values for optional fields
  const now = new Date().toISOString();
  const formattedDate = date_created || now;
  const formattedFavorite = isFavorite ? "true" : "false";

  // SQL Query to insert our data into the database
  const query = `
    INSERT INTO projects (title, progress, date_created, image, githubLink, isFavorite)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Insert the data into our database
  database.run(
    query,
    [title, progress, formattedDate, image, githubLink, formattedFavorite],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Send the response with the inserted data
      res.status(201).json({
        status: "Success",
        id: this.lastID,
        title,
        progress,
        date_created: formattedDate,
        image,
        githubLink,
        isFavorite: formattedFavorite,
      });
    }
  );
});

// |PUT|: [/projects/:id]: Edits a project within the database
app.put("/projects/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { title, progress, githubLink } = req.body;

  // Ensure required fields are provided
  if (!title || !progress || !githubLink) {
    return res
      .status(400)
      .json({ message: "Title, Progress, and Github Link are required" });
  }

  // Validate progress (should be between 0 and 100)
  if (progress < 0 || progress > 100) {
    return res
      .status(400)
      .json({ message: "Progress must be between 0 and 100" });
  }
  // SQL query to update the project in the database
  const query = `
        UPDATE projects
        SET title = ?, progress = ?, githubLink = ?
        WHERE id = ?
    `;

  // Run the update query
  database.run(query, [title, progress, githubLink, id], function (err) {
    if (err) {
      console.error("Error updating project:", err.message);
      return res.status(500).json({ error: "Failed to update project" });
    }

    // Check if any row was updated
    if (this.changes === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Respond with the updated project details
    res.json({
      message: "Project updated successfully",
      id,
      title,
      progress,
      githubLink,
    });
  });
});

// |GET|: [/projects/:id]: Retrives a specific projects info from the database.
app.get("/projects/:id", (req, res) => {
  const { id } = req.params;

  // SQL query to get the project details by ID
  const query = `
    SELECT * FROM projects WHERE id = ?
  `;

  // Run the query to get the project from the database
  database.get(query, [id], (err, row) => {
    if (err) {
      console.error("Error fetching project:", err.message);
      return res.status(500).json({ error: "Failed to fetch project" });
    }

    // Check if the project was found
    if (!row) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Respond with the project details
    res.json({
      id: row.id,
      title: row.title,
      progress: row.progress,
      githubLink: row.githubLink,
      image: row.image, // Send back the image URL if available
      isFavorite: row.isFavorite,
      date_created: row.date_created, // Include any other fields you want
    });
  });
});

// |DELETE|: [/projects/:id]: Deletes a project using its ID
app.delete("/projects/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM projects WHERE id = ?";

  database.run(query, [id], function (err) {
    if (err) {
      console.log("Error deleting project:", err.message);
      return res.status(500).json({ error: "Failed to delete project" });
    }

    // Check if the row exists
    if (this.changes == 0) {
      return res
        .status(404)
        .json({ message: "No project found with given ID" });
    }

    console.log(`Project with ID ${id} deleted succesfully`);
    res.json({ message: `Project with ID ${id} deleted successfully` });
  });
});

// |PUT|: [/projects/favorite/:id]: Favorites or Unfavorites project
app.put("/projects/favorite/:id", (req, res) => {
  const { id } = req.params;

  // SQL query to get the current favorite status of the project
  const getFavoriteQuery = `SELECT isFavorite FROM projects WHERE id = ?`;

  // First, get the current favorite status
  database.get(getFavoriteQuery, [id], (err, row) => {
    if (err) {
      console.error("Error fetching project:", err.message);
      return res.status(500).json({ error: "Failed to fetch project" });
    }

    if (!row) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Toggle the favorite status (if it's "true", set it to "false"; if "false", set it to "true")
    const newFavoriteStatus = row.isFavorite === "true" ? "false" : "true"; // Toggle the string value

    // SQL query to update the favorite status
    const updateFavoriteQuery = `
      UPDATE projects
      SET isFavorite = ?
      WHERE id = ?
    `;

    // Update the favorite status
    database.run(updateFavoriteQuery, [newFavoriteStatus, id], function (err) {
      if (err) {
        console.error("Error updating favorite status:", err.message);
        return res
          .status(500)
          .json({ error: "Failed to update favorite status" });
      }

      // Respond with the updated project data
      res.json({
        message: "Project favorite status updated successfully",
        id,
        id: row.id,
        title: row.title,
        progress: row.progress,
        githubLink: row.githubLink,
        image: row.image, // Send back the image URL if available
        isFavorite: row.isFavorite,
        date_created: row.date_created, // Include any other fields you want
      });
    });
  });
});

// | Routes |

// Serve the index.html from frontend when accessing /home
app.get("/home", (req, res) => {
  const filePath = path.join(__dirname, "..", "frontend", "index.html"); // Adjusted path
  res.sendFile(filePath);
});

// Serve the create.html from backend/routes when accessing /create
app.get("/create", (req, res) => {
  const filePath = path.join(__dirname, "routes", "create.html");
  res.sendFile(filePath);
});

// Serve uploaded files (images) from the 'uploads' directory
app.use("/home", express.static(path.join(__dirname, "uploads")));

// | Main |

app.listen(PORT, () => {
  console.log(`Server is running @ http://localhost:${PORT}`);
});
