import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'naturacare',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión de PostgreSQL:', err);
});

// Column mapping: PostgreSQL lowercase -> camelCase
const columnMapping = {
  'patientid': 'patientId',
  'chronicillness': 'chronicIllness',
  'medicalhistory': 'medicalHistory',
  'createdat': 'createdAt'
};

// Convert PostgreSQL column names to camelCase
const convertToCamelCase = (row) => {
  const convertedRow = {};
  for (const key in row) {
    // Use mapping if exists, otherwise use the key as-is
    const camelKey = columnMapping[key.toLowerCase()] || key;
    convertedRow[camelKey] = row[key];
  }
  return convertedRow;
};

// Generic GET endpoint for any table
app.get('/api/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { id } = req.query;
    
    let query = `SELECT * FROM ${table}`;
    let params = [];
    
    if (id) {
      query += ' WHERE id = $1';
      params = [id];
    }
    
    const result = await pool.query(query, params);
    const rows = result.rows.map(row => convertToCamelCase(row));
    
    res.json(rows);
  } catch (error) {
    console.error('Error en GET:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generic POST endpoint for any table
app.post('/api/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const data = req.body;
    const sanitizedData = table === 'patients'
      ? Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'phone'))
      : data;
    
    const columns = Object.keys(sanitizedData);
    const values = Object.values(sanitizedData).map((val, idx) => {
      // Convert arrays to JSON strings for JSONB columns
      if (Array.isArray(val) && columns[idx] === 'notes') {
        return JSON.stringify(val);
      }
      return val;
    });
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    
    const convertedRow = convertToCamelCase(result.rows[0]);
    res.status(201).json(convertedRow);
  } catch (error) {
    console.error('Error en POST:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generic PUT endpoint for any table
app.put('/api/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const data = req.body;
    const sanitizedData = table === 'patients'
      ? Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'phone'))
      : data;
    
    const columns = Object.keys(sanitizedData);
    const values = Object.values(sanitizedData).map((val, idx) => {
      // Convert arrays to JSON strings for JSONB columns
      if (Array.isArray(val) && columns[idx] === 'notes') {
        return JSON.stringify(val);
      }
      return val;
    });
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    
    const query = `UPDATE ${table} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    const convertedRow = convertToCamelCase(result.rows[0]);
    res.json(convertedRow);
  } catch (error) {
    console.error('Error en PUT:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generic DELETE endpoint for any table
app.delete('/api/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    
    res.json({ message: 'Registro eliminado', data: result.rows[0] });
  } catch (error) {
    console.error('Error en DELETE:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Backend API siempre usa puerto 3001 (Nginx está en 80)
const PORT = process.env.BACKEND_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_NAME || 'naturacare'}`);
});
