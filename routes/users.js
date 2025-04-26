const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *',
      [name, email, hashed]
    );

    res.status(201).json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

module.exports = router;
