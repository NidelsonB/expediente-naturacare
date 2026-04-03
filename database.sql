-- NaturaCare Database Schema
-- PostgreSQL Database Setup

-- Create database (run this first if needed)
-- CREATE DATABASE clinicademo;

-- Connect to the database
-- \c clinicademo;

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    age INTEGER NOT NULL,
    dui VARCHAR(20) UNIQUE,
    address TEXT NOT NULL,
    chronicIllness TEXT,
    medicalHistory TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
    id VARCHAR(36) PRIMARY KEY,
    patientId VARCHAR(36) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    notes JSONB NOT NULL,
    treatment TEXT,
    medications TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_dui ON patients(dui);
CREATE INDEX IF NOT EXISTS idx_visits_patientId ON visits(patientId);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(date DESC);

-- Sample data (optional, for testing)
-- INSERT INTO patients (id, name, gender, age, dui, address, chronicIllness, medicalHistory, createdAt) VALUES
-- ('550e8400-e29b-41d4-a716-446655440000', 'Juan Pérez', 'Masculino', 45, '01234567-8', 'San Salvador, Col. Escalón', 'Diabético Tipo II', 'Antecedentes de hipertensión', NOW()),
-- ('550e8400-e29b-41d4-a716-446655440001', 'María González', 'Femenino', 32, '98765432-1', 'Santa Ana, Centro', '', 'Sin antecedentes relevantes', NOW());

-- INSERT INTO visits (id, patientId, date, notes, treatment, medications, createdAt) VALUES
-- ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', NOW(), '["Control de glucosa elevada", "Paciente refiere mareos"]', 'Dieta baja en azúcares y carbohidratos', 'Metformina 850mg cada 12 horas', NOW());

COMMENT ON TABLE patients IS 'Tabla de pacientes del sistema clinicademo';
COMMENT ON TABLE visits IS 'Tabla de visitas médicas asociadas a pacientes';
