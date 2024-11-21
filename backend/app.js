// Imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite = require('sqlite3').verbose();

// Initialization
const app = express(); // Creating our backend / app
const PORT = 5000; // Backend port

// Middleware
app.use(cors());
app.use(bodyParser.json());

// DB Connection to our projects.db
const database = new sqlite.Database('./db/projects.db', (err) => {
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

// [Post a new project] |POST|: Adding a new projects into our database
app.post('/projects', (req, res) => {
    const {title, description, progress, image, githubLink} = req.body;

    // Making sure that our request is complete
    if (!title || !description || !progress || !image || !githubLink) {
        return res.status(400).json({message: 'All fields are required'});
    }

    // SQL query to insert a new project
    const query = 'INSERT INTO projects (title, description, progress, image, githubLink) VALUES (?, ?, ?, ?, ?)';

    database.run(query, [title, description, progress, image, githubLink], function(err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        // Return the project inserted w/ the ID
        res.status(201).json({
            status: 'Successful',
            id: this.lastID,
            title,
            description,
            progress,
            image,
            githubLink       
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
            return res.status(404).json({message: 'No project found with given ID'})
        }

        console.log(`Projerct with ID ${id} deleted succesfully`);
        res.json({message: `Project with ID ${id} deleted successfully`});
    });
});

// Main
app.listen(PORT, () => {
    console.log(`Server is running @ http://localhost:${PORT}`);
});