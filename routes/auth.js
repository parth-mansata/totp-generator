const express = require('express');
const router = express.Router();
const DATA_FILE = 'users.json';
const SECRET_KEY = process.env.JWT_KEY;
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Read data from file
const readData = () => {
    if (fs.existsSync(DATA_FILE)) {
        const rawData = fs.readFileSync(DATA_FILE);
        return JSON.parse(rawData);
    }
    return [];
};

// Write data to file
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};


// Authentication routes
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const data = readData();
    const existingUser = data.find(u => u.email === email);
    console.log('existingUser', existingUser);
    if(existingUser) {
        return res.status(400).json({message:'User with this email already exists.'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), email, password: hashedPassword };
    data.push(newUser);
    writeData(data);
    res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const data = readData();
    const user = data.find((user) => user.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});


module.exports = router;
