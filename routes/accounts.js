const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const {decrypt, encrypt} = require("../helper/encrypt-decrypt");
const Account = require('../models/accounts');

// CRUD operations
router.get('/', async (req, res) => {
    const data = await Account.find({userId: req.user._id}, {secret: 0}, {sort: 'position'}).lean();
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

// Reorders the position of the Accounts
router.post("/reorder", async (req, res) => {
    const { order } = req.body;
    if (!order || !Array.isArray(order)) {
        return res.status(400).json({ error: "Invalid or missing order data" });
    }
    try {
        // Update each account's position in the database
        const bulkOps = order.map((accountId, index) => ({
            updateOne: {
                filter: { _id: accountId },
                update: { $set: { position: index } },
            },
        }));

        // Perform bulk write operation
        await Account.bulkWrite(bulkOps);

        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
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
    if (account) {
        res.json(account);
    } else {
        res.status(404).json({ error: 'Account not found' });
    }
});

router.get('/:id/totp', async (req, res) => {
    const { id } = req.params;
    const account = await Account.findOne({_id: id, userId: req.user._id}, {secret: 1});
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
