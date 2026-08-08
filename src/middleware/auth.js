const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db/knex');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await db('users')
      .where({ id: payload.userId, is_active: true })
      .first();

    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      id: user.id,
      companyId: user.company_id,
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
