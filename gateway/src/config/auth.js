module.exports = {
    SECRET_KEY: process.env.JWT_SECRET || 'cinema_super_secret_key',
    TOKEN_EXPIRATION: '500h'
};