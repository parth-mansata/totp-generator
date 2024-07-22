const express = require('express');
const router = express.Router();
// const fs = require('fs');
const speakeasy = require('speakeasy');
const {decrypt, encrypt} = require("../helper/encrypt-decrypt");
const Account = require('../models/accounts');
const mongoose = require("mongoose");
//
// const DATA_FILE = 'data.json';
//
// // Read data from file
// const readData = () => {
//     if (fs.existsSync(DATA_FILE)) {
//         const rawData = fs.readFileSync(DATA_FILE);
//         return JSON.parse(rawData);
//     }
//     return [];
// };
//
// // Write data to file
// const writeData = (data) => {
//     fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
// };

// CRUD operations
router.get('/', async (req, res) => {
    const data = await Account.find({userId: req.user._id}, {secret: 0}).lean();
    res.json(data.map(a => {
        a.id = a._id.toString();
        delete a._id;
        return a;
    }));
});

router.post('/', async (req, res) => {
    const { name, color, secret } = req.body;
    const newAccount = {
        id: Date.now(),
        name,
        color,
        secret: encrypt(secret),
        userId: req.user._id
    };
    await Account.create(newAccount);
    delete newAccount.secret;
    res.status(201).json(newAccount);
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, color } = req.body;
    await Account.updateOne({_id: id}, {name, color});
    res.status(200).json({ name, color });
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await Account.deleteOne({_id: id});
    res.status(204).end();
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const account = await Account.findOne({_id: id, userId: req.user._id}, {secret: 0});
    // const data = readData();
    // const account = data.find((acc) => acc.id == id && acc.userId === req.user.id);
    if (account) {
        // delete account.secret;
        res.json(account);
    } else {
        res.status(404).json({ error: 'Account not found' });
    }
});

router.get('/:id/totp', async (req, res) => {
    const { id } = req.params;
    console.log('id::', id)
    const account = await Account.findOne({_id: id}, {secret: 1});
    // const data = readData();
    // const account = data.find((acc) => acc.id == id && acc.userId === req.user.id);
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
