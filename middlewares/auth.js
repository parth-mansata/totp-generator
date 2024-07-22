const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_KEY;

const authMiddleware = (req, res, next) => {
    const token = req.headers['token'];
    if (token) {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Unauthorized access' });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        return res.status(401).json({ error: 'No token provided' });
    }
};

module.exports = { authMiddleware };