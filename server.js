const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 2000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Use your MySQL username
    password: 'rootuser', // Use your MySQL password
    database: 'fooddata' // Your database name
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

// API endpoint for registration
app.post('/register', (req, res) => {
    const { fullname, phone, password } = req.body;

    if (!fullname || !phone || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ success: false, message: 'The Phone number or the name is already registered' });
        }

        const query = 'INSERT INTO users (fullname, phone, password) VALUES (?, ?, ?)';
        db.query(query, [fullname, phone, hash], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ success: false, message: 'The Phone number or the name is already registered' });
            }
            res.json({ success: true, message: 'User registered successfully' });
        });
    });
});

// API endpoint for login
app.post('/login', (req, res) => {
    const { phone, password } = req.body;

    const query = 'SELECT * FROM users WHERE phone = ?';
    db.query(query, [phone], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ success: false, message: 'Login failed' });
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id, phone: user.phone }, 'your_jwt_secret', { expiresIn: '1h' });
            res.json({ success: true, token });
        });
    });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
}

// Protected route to serve calcPage
app.get('/calcPage', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'calcPage.html')); // Serve calcPage.html directly
});

// Protected route to serve index
app.get('/index', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve index.html directly
});

// Route to fetch data from the meals table with pagination and filtering
app.get('/data', (req, res) => {
    const { page = 1, limit = 10, calories, protein, carbohydrates } = req.query;
    let query = 'SELECT COUNT(*) AS totalRecords FROM meals WHERE 1=1';

    if (calories) {
        query += ` AND calories = ${mysql.escape(calories)}`;
    }

    if (protein) {
        query += ` AND protein = ${mysql.escape(protein)}`;
    }

    if (carbohydrates) {
        query += ` AND carbohydrates = ${mysql.escape(carbohydrates)}`;
    }

    db.query(query, (error, countResults) => {
        if (error) {
            console.error('Error executing count query:', error);
            return res.status(500).send('Error counting total records');
        }

        const totalRecords = countResults[0].totalRecords;
        const totalPages = Math.ceil(totalRecords / limit);
        const offset = (page - 1) * limit;

        let dataQuery = 'SELECT * FROM meals WHERE 1=1';

        if (calories) {
            dataQuery += ` AND calories = ${mysql.escape(calories)}`;
        }
        if (protein) {
            dataQuery += ` AND protein = ${mysql.escape(protein)}`;
        }
        if (carbohydrates) {
            dataQuery += ` AND carbohydrates = ${mysql.escape(carbohydrates)}`;
        }

        dataQuery += ` LIMIT ${mysql.escape(limit)} OFFSET ${mysql.escape(offset)}`;

        db.query(dataQuery, (error, results) => {
            if (error) {
                console.error('Error executing data query:', error);
                return res.status(500).send('Error fetching data from database');
            }

            const responseData = {
                data: results,
                totalPages: totalPages
            };

            res.json(responseData);
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
