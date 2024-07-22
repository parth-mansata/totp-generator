const express = require('express');
const router = express.Router();
const fs = require('fs');
const speakeasy = require('speakeasy');
const {decrypt, encrypt} = require("../helper/encrypt-decrypt");

const DATA_FILE = 'data.json';

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

// CRUD operations
router.get('/', (req, res) => {
    const data = readData();
    const userData = data.filter(acc => acc.userId === req.user.id).map(({secret, ...remaining}) => remaining);
    res.json(userData);
});

router.post('/', (req, res) => {
    const { name, color, secret } = req.body;
    const newAccount = {
        id: Date.now(),
        name,
        color,
        secret: encrypt(secret),
        userId: req.user.id
    };
    const data = readData();
    data.push(newAccount);
    writeData(data);
    delete newAccount.secret;
    res.status(201).json(newAccount);
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, color } = req.body;
    const data = readData();
    const accountIndex = data.findIndex((acc) => acc.id == id);
    if (accountIndex >= 0) {
        data[accountIndex].name = name || data[accountIndex].name;
        data[accountIndex].color = color || data[accountIndex].color;
        writeData(data);
        delete data[accountIndex].secret;
        res.json(data[accountIndex]);
    } else {
        res.status(404).json({ error: 'Account not found' });
    }
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    let data = readData();
    data = data.filter((acc) => acc.id != id);
    writeData(data);
    res.status(204).end();
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const account = data.find((acc) => acc.id == id && acc.userId === req.user.id);
    if (account) {
        delete account.secret;
        res.json(account);
    } else {
        res.status(404).json({ error: 'Account not found' });
    }
});

router.get('/:id/totp', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const account = data.find((acc) => acc.id == id && acc.userId === req.user.id);
    if (account) {
        const token = speakeasy.totp({
            secret: decrypt(account.secret),
            encoding: 'base32',
        });
        res.json({ token });
    } else {
        res.status(404).json({ error: 'Account not found' });
    }
});

module.exports = router;
