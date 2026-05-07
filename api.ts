// API client para el backend
// En producción, Nginx hace proxy de /api a http://localhost:3001/api
const API_URL = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api';

import type { PaginatedPatients } from './types';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async buildError(response: Response): Promise<Error> {
    let message = `Error ${response.status}: ${response.statusText}`;

    try {
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const body = await response.json() as ApiResponse<unknown> & { message?: string; details?: string };
        message = body.error || body.message || body.details || message;
      } else {
        const text = (await response.text()).trim();
        if (text) {
          message = text;
        }
      }
    } catch {
      // Keep the default HTTP message if the response body cannot be parsed.
    }

    return new Error(message);
  }

  private async request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    try {
      const response = await fetch(input, init);

      if (!response.ok) {
        throw await this.buildError(response);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('No se pudo conectar con el servidor');
    }
  }

  async get<T>(table: string, id?: string | number): Promise<T> {
    const url = id
      ? `${this.baseUrl}/${table}?id=${id}`
      : `${this.baseUrl}/${table}`;

    return this.request<T>(url);
  }

  async post<T>(table: string, data: any): Promise<T> {
    return this.request<T>(`${this.baseUrl}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async put<T>(table: string, id: string | number, data: any): Promise<T> {
    return this.request<T>(`${this.baseUrl}/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async delete<T>(table: string, id: string | number): Promise<T> {
    return this.request<T>(`${this.baseUrl}/${table}/${id}`, {
      method: 'DELETE',
    });
  }

  async searchPatients(params: {
    search?: string;
    mode?: 'name' | 'dui';
    page?: number;
    limit?: number;
  }): Promise<PaginatedPatients> {
    const query = new URLSearchParams({
      search: params.search ?? '',
      mode: params.mode ?? 'name',
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 10),
    });
    return this.request<PaginatedPatients>(`${this.baseUrl}/patients/search?${query}`);
  }

  async getVisitsByPatient(patientId: string): Promise<import('./types').Visit[]> {
    return this.request(`${this.baseUrl}/visits/patient/${patientId}`);
  }

  async healthCheck(): Promise<{ status: string; database: string }> {
    const healthUrl = import.meta.env.MODE === 'production' ? '/health' : 'http://localhost:3001/health';
    return this.request<{ status: string; database: string }>(healthUrl);
  }
}

export const api = new ApiClient();

// Ejemplo de uso:
// const pacientes = await api.get('patients');
// const nuevoPaciente = await api.post('patients', { nombre: 'Juan', edad: 30 });
// const actualizado = await api.put('patients', 1, { nombre: 'Juan Carlos' });
// await api.delete('patients', 1);
