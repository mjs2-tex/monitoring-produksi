import { Pool } from "pg";

// Koneksi Database Pertama (Utama)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// Koneksi Database Kedua (Misal: DB Backup atau DB Modul lain)
const poolSecond = new Pool({
  connectionString: process.env.DATABASE_URL_SECOND, // Pastikan tambahkan di .env
  ssl: false,
});

export { pool, poolSecond };