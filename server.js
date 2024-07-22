const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const open = require('open');

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
    console.log(`Server running on http://localhost:${PORT}`);
    await open(`http://localhost:${PORT}/index.html`);
    // require('child_process').exec(`start http://localhost:${PORT}/index.html`);

});
