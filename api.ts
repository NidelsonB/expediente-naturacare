// API client para el backend
// En producción, Nginx hace proxy de /api a http://localhost:3001/api
const API_URL = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async get<T>(table: string, id?: string | number): Promise<T> {
    const url = id 
      ? `${this.baseUrl}/${table}?id=${id}`
      : `${this.baseUrl}/${table}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async post<T>(table: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async put<T>(table: string, id: string | number, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async delete<T>(table: string, id: string | number): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${table}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async healthCheck(): Promise<{ status: string; database: string }> {
    const healthUrl = import.meta.env.MODE === 'production' ? '/health' : 'http://localhost:3001/health';
    const response = await fetch(healthUrl);
    return response.json();
  }
}

export const api = new ApiClient();

// Ejemplo de uso:
// const pacientes = await api.get('patients');
// const nuevoPaciente = await api.post('patients', { nombre: 'Juan', edad: 30 });
// const actualizado = await api.put('patients', 1, { nombre: 'Juan Carlos' });
// await api.delete('patients', 1);
