const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; //Using AES encryption
const key = process.env.ENCRYPTION_KEY;
// const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

//Encrypting text
const encrypt = (text) => {
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decrypting text
const decrypt = (text) => {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
}