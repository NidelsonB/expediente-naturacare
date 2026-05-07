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

// Paginated patient search with last visit embedded
app.get('/api/patients/search', async (req, res) => {
  try {
    const { search = '', mode = 'name', page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = '';
    let params = [];

    if (search.trim()) {
      whereClause = mode === 'dui'
        ? 'WHERE p.dui ILIKE $1'
        : 'WHERE p.name ILIKE $1';
      params = [`%${search.trim()}%`];
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM patients p ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await pool.query(
      `SELECT p.*,
         lv.id         AS last_visit_id,
         lv.date       AS last_visit_date,
         lv.treatment  AS last_visit_treatment,
         lv.medications AS last_visit_medications
       FROM patients p
       LEFT JOIN LATERAL (
         SELECT id, date, treatment, medications
         FROM visits
         WHERE patientid = p.id
         ORDER BY date DESC
         LIMIT 1
       ) lv ON true
       ${whereClause}
       ORDER BY p.createdat DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limitNum, offset]
    );

    const rows = dataResult.rows.map(row => {
      const { last_visit_id, last_visit_date, last_visit_treatment, last_visit_medications, ...patientRow } = row;
      return {
        ...convertToCamelCase(patientRow),
        lastVisit: last_visit_id
          ? { id: last_visit_id, date: last_visit_date, treatment: last_visit_treatment, medications: last_visit_medications }
          : null
      };
    });

    res.json({ patients: rows, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('Error en patients/search:', error);
    res.status(500).json({ error: error.message });
  }
});

// DUI uniqueness check
app.get('/api/patients/check-dui', async (req, res) => {
  try {
    const { dui, excludeId } = req.query;
    if (!dui) return res.json({ unique: true });
    const query = excludeId
      ? 'SELECT id FROM patients WHERE dui = $1 AND id != $2'
      : 'SELECT id FROM patients WHERE dui = $1';
    const params = excludeId ? [dui, excludeId] : [dui];
    const result = await pool.query(query, params);
    res.json({ unique: result.rows.length === 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Visits for a specific patient (efficient — no full table scan)
app.get('/api/visits/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(
      'SELECT * FROM visits WHERE patientid = $1 ORDER BY date DESC',
      [patientId]
    );
    res.json(result.rows.map(row => convertToCamelCase(row)));
  } catch (error) {
    console.error('Error en visits/patient:', error);
    res.status(500).json({ error: error.message });
  }
});

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
