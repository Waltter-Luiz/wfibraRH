const bcrypt = require('bcryptjs');

// Senha: admin123
const password = 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Erro:', err);
        return;
    }
    
    console.log('\n=================================');
    console.log('📋 NOVO HASH GERADO!');
    console.log('=================================\n');
    console.log('Senha:', password);
    console.log('Hash:', hash);
    console.log('\n=================================');
    console.log('📝 SQL PARA ATUALIZAR SENHA:');
    console.log('=================================\n');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@wfibra.com';`);
    console.log('\n=================================\n');
});