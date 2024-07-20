const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const speakeasy = require('speakeasy');
const cors = require('cors');
const path = require('path');
const open = require('open');

const app = express();
const PORT = 4567;
const DATA_FILE = 'data.json';

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend')));
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
app.get('/accounts', (req, res) => {
    const data = readData();
    res.json(data);
});

app.post('/accounts', (req, res) => {
    const { name, color, secret } = req.body;
    const newAccount = {
        id: Date.now(),
        name,
        color,
        secret,
    };
    const data = readData();
    data.push(newAccount);
    writeData(data);
    res.status(201).json(newAccount);
});

app.put('/accounts/:id', (req, res) => {
    const { id } = req.params;
    const { name, color } = req.body;
    const data = readData();
    const accountIndex = data.findIndex((acc) => acc.id == id);
    if (accountIndex >= 0) {
        data[accountIndex].name = name || data[accountIndex].name;
        data[accountIndex].color = color || data[accountIndex].color;
        writeData(data);
        res.json(data[accountIndex]);
    } else {
        res.status(404).json({ error: 'Account not found' });
    }
});

app.delete('/accounts/:id', (req, res) => {
    const { id } = req.params;
    let data = readData();
    data = data.filter((acc) => acc.id != id);
    writeData(data);
    res.status(204).end();
});

app.get('/accounts/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const account = data.find((acc) => acc.id == id);
    if (account) {
        res.json(account);
    } else {
        res.status(404).json({ error: 'Account not found' });
    }
});

app.get('/accounts/:id/totp', (req, res) => {
    const { id } = req.params;
    const data = readData();
    const account = data.find((acc) => acc.id == id);
    if (account) {
        const token = speakeasy.totp({
            secret: account.secret,
            encoding: 'base32',
        });
        res.json({ token });
    } else {
        res.status(404).json({ error: 'Account not found' });
    }
});


app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await open(`http://localhost:${PORT}/index.html`);
    // require('child_process').exec(`start http://localhost:${PORT}/index.html`);

});
