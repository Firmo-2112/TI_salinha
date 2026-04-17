// ==========================
// 🚀 BACKEND COMPLETO - PRONTO PARA DEPLOY NO RAILWAY
// ==========================

// ==========================
// 📁 ESTRUTURA DO PROJETO
// ==========================
/*
backend/
 ├── server.js
 ├── package.json
 ├── .env (não subir pro git)
 └── README.md
*/

// ==========================
// 📄 server.js
// ==========================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      quantidade INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS servicos (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Banco pronto');
}

initDB();

// ===== PRODUTOS =====
app.get('/produtos', async (req, res) => {
  const result = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
  res.json(result.rows);
});

app.post('/produtos', async (req, res) => {
  const { nome, quantidade } = req.body;
  const result = await pool.query(
    'INSERT INTO produtos (nome, quantidade) VALUES ($1,$2) RETURNING *',
    [nome, quantidade]
  );
  res.json(result.rows[0]);
});

app.put('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, quantidade } = req.body;
  const result = await pool.query(
    'UPDATE produtos SET nome=$1, quantidade=$2 WHERE id=$3 RETURNING *',
    [nome, quantidade, id]
  );
  res.json(result.rows[0]);
});

app.delete('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM produtos WHERE id=$1', [id]);
  res.json({ ok: true });
});

// ===== SERVICOS =====
app.get('/servicos', async (req, res) => {
  const result = await pool.query('SELECT * FROM servicos ORDER BY id DESC');
  res.json(result.rows);
});

app.post('/servicos', async (req, res) => {
  const { nome, descricao } = req.body;
  const result = await pool.query(
    'INSERT INTO servicos (nome, descricao) VALUES ($1,$2) RETURNING *',
    [nome, descricao]
  );
  res.json(result.rows[0]);
});

app.put('/servicos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;
  const result = await pool.query(
    'UPDATE servicos SET nome=$1, descricao=$2 WHERE id=$3 RETURNING *',
    [nome, descricao, id]
  );
  res.json(result.rows[0]);
});

app.delete('/servicos/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM servicos WHERE id=$1', [id]);
  res.json({ ok: true });
});

// HEALTH
app.get('/', (req, res) => res.send('API OK 🚀'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Rodando na porta ' + PORT));


// ==========================
// 📄 package.json
// ==========================
/*
{
  "name": "railway-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "pg": "^8.11.0"
  }
}
*/


// ==========================
// 📄 .env (LOCAL APENAS)
// ==========================
/*
DATABASE_URL=postgresql://user:password@host:port/db
*/


// ==========================
// 📄 README.md (PASSO A PASSO)
// ==========================
/*
1. Subir código pro GitHub
2. Criar projeto no Railway
3. Add PostgreSQL
4. Railway cria DATABASE_URL automaticamente
5. Deploy automático
6. Testar:
   /produtos
   /servicos

PRONTO ✅
*/
