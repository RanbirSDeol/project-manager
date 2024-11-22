// Imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite = require('sqlite3').verbose();
const fs = require('fs');
const multer = require('multer'); // Import multer
const path = require('path');

// Initialization
const app = express(); // Creating our backend / app
const PORT = 5000; // Backend port

// Ensure the uploads folder exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true }); // Ensure folder exists
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Set up storage configuration for file uploads (using Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsPath = path.join(__dirname, 'uploads');
        cb(null, uploadsPath);  // Store uploaded images in the "uploads" folder
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname); // Get file extension
        cb(null, Date.now() + fileExtension);  // Generate unique filename based on timestamp
    }
});

const upload = multer({ storage: storage });

const dbPath = path.join(__dirname, 'db', 'projects.db');

// DB Connection to our projects.db
const database = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Error Connecting to Database', err.message);
    } else {
        console.log('Connected to SQLite DB');
    }
})

// | CRUD |

// [Projects] |GET|: Return all of our projects
app.get('/projects', (req, res) => {
    // Getting everything from our projects and putting it into a list
    database.all('SELECT * FROM projects', [], (err, rows) => {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        // Send the result as a JSON
        res.json({projects: rows});
    });
});

// [Wipe Database] |POST|: Wipes database, temp func for testing
app.post('/wipe-database', (req, res) => {
    const query = "DELETE FROM projects"; // SQL Command
    database.run(query, function (err) {
        if (err) {
            console.error('Error wiping the DB: ', err.message);
            return res.status(500).json({error: 'Failed to wipe database'});
        } 
        console.log('Database wiped succesfully');
        res.json({message: 'Database wiped succesfully'});
    })
})

// [POST] Adding a new project with optional image upload
app.post('/projects', upload.single('image'), (req, res) => {
    const { title, progress, githubLink, date_created, isFavorite } = req.body;

    // Ensure the image is handled correctly
    const image = req.file ? '/uploads/' + req.file.filename : ''; // Image path to be stored in DB

    // Validate required fields
    if (!title || !progress || !githubLink) {
        return res.status(400).json({ message: 'Title, Progress, and Github Link are required' });
    }

    // Validate progress (should be between 0 and 100)
    if (progress < 0 || progress > 100) {
        return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }

    // Set default values for optional fields
    const now = new Date().toISOString();
    const formattedDate = date_created || now;
    const formattedFavorite = isFavorite !== undefined ? isFavorite : 0;

    // SQL query to insert a new project into the database
    const query = `
        INSERT INTO projects (title, progress, date_created, image, githubLink, isFavorite)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Insert the project data into the database
    database.run(query, [title, progress, formattedDate, image, githubLink, formattedFavorite], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Send the response with the inserted data
        res.status(201).json({
            status: 'Successful',
            id: this.lastID,
            title,
            progress,
            date_created: formattedDate,
            image,  // Image path saved in DB
            githubLink,
            isFavorite: formattedFavorite
        });
    });
});

// [Delete a project] |DELETE|: Removes a project from the database
app.delete('/projects/:id', (req, res) => {
    const {id} = req.params;

    const query = 'DELETE FROM projects WHERE id = ?';

    database.run(query, [id], function(err) {
        if (err) {
            console.log('Error deleting project:', err.message);
            return res.status(500).json({error: "Failed to delete project"});
        }

        // Check if the row exists
        if (this.changes == 0) {
            return res.status(404).json({message: 'No project found with given ID'});
        }
        
        console.log(`Project with ID ${id} deleted succesfully`);
        res.json({message: `Project with ID ${id} deleted successfully`});
    });
});

// | Routes |

// Serve the index.html from frontend when accessing /home
app.get('/home', (req, res) => {
    const filePath = path.join(__dirname, '..', 'frontend', 'index.html'); // Adjusted path
    res.sendFile(filePath);
});

// Serve the create.html from backend/routes when accessing /create
app.get('/create', (req, res) => {
    const filePath = path.join(__dirname, 'routes', 'create.html');
    res.sendFile(filePath);
});

// Main

// Serve uploaded files (images) from the 'uploads' directory
app.use('/home', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`Server is running @ http://localhost:${PORT}`);
});