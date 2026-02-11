const fs = require('fs');
const bcrypt = require('bcryptjs');
const password = 'admin123';
const saltRounds = 10;

try {
    const hash = bcrypt.hashSync(password, saltRounds);
    fs.writeFileSync('generated-hash.txt', `Password: ${password}\nHash: ${hash}\n`);
    console.log('Hash written to generated-hash.txt');
} catch (err) {
    fs.writeFileSync('generated-hash-error.txt', err.toString());
}
