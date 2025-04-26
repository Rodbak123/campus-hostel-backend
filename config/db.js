const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://hostel_management_system_x8uq_user:dwWPfvOQajNZNy5TCAOp49wlDVesrjak@dpg-d0595n7gi27c738n81vg-a.oregon-postgres.render.com/hostel_management_system_x8uq',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;

pool.connect()
  .then(client => {
    return client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(10) DEFAULT 'student'
      );
    `)
    .then(() => {
      console.log("✅ Users table ready.");
      client.release();
    })
    .catch(err => {
      client.release();
      console.error("❌ Error creating users table", err.stack);
    });
  });

module.exports = pool;
