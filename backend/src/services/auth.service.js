const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/knex');
const config = require('../config');

async function login(email, password) {
  const user = await db('users').where({ email }).first();

  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Account is deactivated');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { userId: user.id, companyId: user.company_id, role: user.role },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
    },
  };
}

module.exports = { login };
