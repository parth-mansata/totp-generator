const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
// const open = require('open');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = 4567;
const auth = require('./routes/auth');
const accounts = require('./routes/accounts');
const {authMiddleware} = require("./middlewares/auth");

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/auth', auth);
app.use('/accounts', authMiddleware, accounts);

app.listen(PORT, async () => {
    try {
        console.log(`Server running on http://localhost:${PORT}`);
        await connectDb();
        // await open(`http://localhost:${PORT}/index.html`);
    } catch (e) {
        console.error(e);
    }

});

const connectDb = async () => {
    try {
        const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/auth-ext';
        await mongoose.connect(DB_URL);
        console.log('DB connected successfully.');
    } catch (e) {
        console.log('Error connecting Database', e);
    }
}