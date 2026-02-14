/**
 * Serviço centralizado para chamadas à API (Fetch)
 * Padrão: baseURL já contém /api
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface ApiResponseMeta {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
}

export interface Employee {
    id: number;
    name: string;
    email: string;
    role: string;
    team_id?: number | null;
    position_id?: number | null;
    contract_type_id?: number | null;
    manager_id?: number | null;
    salary?: number | null;
    admission_date?: string | null;
    is_active: number;
    team_name?: string;
    position_title?: string;
}

export interface Team {
    id: number;
    name: string;
}

export interface Position {
    id: number;
    title: string;
}

export interface ContractType {
    id: number;
    name: string;
}

export interface EmployeeListResponse {
    data: Employee[];
    meta: ApiResponseMeta;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        team_id?: number | null;
    };
}

interface RequestOptions extends RequestInit {
    requiresAuth?: boolean;
}

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { requiresAuth = true, ...fetchOptions } = options;

        const headers: Record<string, string> = {
            Accept: 'application/json',
            ...(fetchOptions.headers as Record<string, string>),
        };

        if (!(fetchOptions.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (requiresAuth) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const url = `${this.baseUrl}${endpoint}`;

        let response: Response;

        try {
            response = await fetch(url, {
                ...fetchOptions,
                headers,
            });
        } catch {
            throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        }

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        if (!response.ok) {
            const errorData = isJson ? await response.json() : { message: await response.text() };
            throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
        }

        if (!isJson) {
            return {} as T;
        }

        return await response.json();
    }

    get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const api = new ApiService(API_URL);

/**
 * AUTH
 */
export const authApi = {
    login: (email: string, password: string) =>
        api.post<LoginResponse>('/login', { email, password }, { requiresAuth: false }),

    refreshToken: (refreshToken: string) =>
        api.post<{ token: string }>('/refresh-token', { refreshToken }, { requiresAuth: false }),

    changePassword: (currentPassword: string, newPassword: string) =>
        api.post<{ message: string }>('/change-password', { currentPassword, newPassword }),

    me: () => api.get('/me'),
};

/**
 * EMPLOYEES
 */
export const employeeApi = {
    getAll: (params?: { page?: number; limit?: number; search?: string }) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        const search = params?.search ?? '';

        return api.get<EmployeeListResponse>(
            `/employees?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
        );
    },

    getById: (id: number) => api.get<Employee>(`/employees/${id}`),

    create: (data: any) => api.post('/employees', data),

    update: (id: number, data: any) => api.put(`/employees/${id}`, data),

    delete: (id: number) => api.delete(`/employees/${id}`),
};

/**
 * TEAMS CRUD
 */
export const teamApi = {
    getAll: () => api.get<Team[]>('/teams'),

    getById: (id: number) => api.get<Team>(`/teams/${id}`),

    create: (data: { name: string }) => api.post('/teams', data),

    update: (id: number, data: { name: string }) => api.put(`/teams/${id}`, data),

    delete: (id: number) => api.delete(`/teams/${id}`),
};

/**
 * POSITIONS CRUD
 */
export const positionApi = {
    getAll: () => api.get<Position[]>('/positions'),

    getById: (id: number) => api.get<Position>(`/positions/${id}`),

    create: (data: { title: string }) => api.post('/positions', data),

    update: (id: number, data: { title: string }) => api.put(`/positions/${id}`, data),

    delete: (id: number) => api.delete(`/positions/${id}`),
};

/**
 * CONTRACT TYPES CRUD
 */
export const contractTypeApi = {
    getAll: () => api.get<ContractType[]>('/contract-types'),

    getById: (id: number) => api.get<ContractType>(`/contract-types/${id}`),

    create: (data: { name: string }) => api.post('/contract-types', data),

    update: (id: number, data: { name: string }) => api.put(`/contract-types/${id}`, data),

    delete: (id: number) => api.delete(`/contract-types/${id}`),
};

/**
 * OPTIONS (Dropdowns)
 */
export const optionsApi = {
    getTeams: () => api.get<Team[]>('/options/teams'),
    getPositions: () => api.get<Position[]>('/options/positions'),
    getContractTypes: () => api.get<ContractType[]>('/options/contract-types'),
};
