const crypto = require('crypto');
const { createUser, getUserByEmail } = require('../services/storeData');

async function postRegistHandler(request, h) {
    const { name, email, password } = request.payload;

    if (!name || !email || !password) {
        return h.response({
            status: 'fail',
            message: 'Semua field harus diisi.',
        }).code(400);
    }

    const salt = crypto.randomBytes(16).toString('hex');  // Membuat salt random
    const hashedPassword = crypto.scryptSync(password, salt, 64).toString('hex');  // Menggunakan scryptSync untuk hashing password

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
        name,
        email,
        password: hashedPassword,
        salt: salt,  
        createdAt
    };

    await createUser(id, data);

    const response = h.response({
        status: 'success',
        message: 'User successfully registered',
        data
    });
    
    response.code(201);
    return response;
} 

async function postLoginHandler(request, h) {
    const { email, password } = request.payload;

    if (!email || !password) {
        return h.response({
            status: 'fail',
            message: 'Email dan password harus diisi.',
        }).code(400);
    }

    const user = await getUserByEmail(email);

    if (!user) {
        return h.response({
            status: 'fail',
            message: 'Email atau password salah.',
        }).code(401);
    }

    const { password: hashedPassword, salt } = user;
    const hashedInputPassword = crypto.scryptSync(password, salt, 64).toString('hex');

    if (hashedInputPassword !== hashedPassword) {
        return h.response({
            status: 'fail',
            message: 'Email atau password salah.',
        }).code(401);
    }

    const response = h.response({
        status: 'success',
        message: 'Login berhasil.',
        data: { email }
    });

    response.code(200);
    return response;
}

module.exports = { postRegistHandler, postLoginHandler };
