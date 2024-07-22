const express = require('express');
const router = express.Router();
const SECRET_KEY = process.env.JWT_KEY;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');


// Write data to file
const writeData = async (data) => {
    return await User.create(data);
};


// Authentication routes
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({email: email});
    if(existingUser) {
        return res.status(400).json({message:'User with this email already exists.'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { email, password: hashedPassword };
    await User.create(newUser);
    res.status(201).json({ message: 'User registered successfully' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const data = await User.find();
    const user = data.find((user) => user.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ _id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});


module.exports = router;
