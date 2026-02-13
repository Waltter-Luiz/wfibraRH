/**
 * Serviço centralizado para chamadas à API
 */

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error('VITE_API_URL não foi definido no arquivo .env');
}

interface RequestOptions extends RequestInit {
    requiresAuth?: boolean;
    params?: Record<string, any>;
}

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private buildQueryString(params?: Record<string, any>): string {
        if (!params) return '';

        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            query.append(key, String(value));
        });

        const queryString = query.toString();
        return queryString ? `?${queryString}` : '';
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { requiresAuth = true, params, ...fetchOptions } = options;

        const headers: Record<string, string> = {
            Accept: 'application/json',
        };

        // Headers extras (se vierem)
        if (fetchOptions.headers) {
            const extraHeaders = fetchOptions.headers as Record<string, string>;
            Object.assign(headers, extraHeaders);
        }

        // Só adiciona Content-Type se tiver body
        if (fetchOptions.body) {
            headers['Content-Type'] = 'application/json';
        }

        // Token automático
        if (requiresAuth) {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const queryString = this.buildQueryString(params);
        const url = `${this.baseUrl}${endpoint}${queryString}`;

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers,
            });

            // 401 = sessão expirada
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';

                throw new ApiError('Sessão expirada. Faça login novamente.', 401);
            }

            // Parse seguro
            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');

            let data: any = null;

            if (isJson) {
                try {
                    data = await response.json();
                } catch {
                    data = null;
                }
            } else {
                data = await response.text();
            }

            // 403 = proibido (sem permissão)
            if (response.status === 403) {
                const message =
                    data?.message ||
                    'Você não tem permissão para acessar este recurso.';

                throw new ApiError(message, 403);
            }

            // Outros erros
            if (!response.ok) {
                const message =
                    data?.message ||
                    data?.error ||
                    (typeof data === 'string' && data.trim() !== '' ? data : null) ||
                    `Erro ${response.status}: ${response.statusText}`;

                throw new ApiError(message, response.status);
            }

            return data as T;
        } catch (error: any) {
            if (error instanceof ApiError) {
                throw error;
            }

            if (error instanceof Error) {
                if (error.message.includes('Failed to fetch')) {
                    throw new ApiError(
                        'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
                        0
                    );
                }

                throw new ApiError(error.message, 0);
            }

            throw new ApiError('Erro desconhecido ao fazer requisição.', 0);
        }
    }

    async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET',
            params,
        });
    }

    async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
        });
    }
}

export const api = new ApiService(API_URL);

/**
 * Tipagens
 */
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    team_id?: number | null;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface Employee {
    id: number;
    name: string;
    email: string;
    role: string;
    team_name?: string;
    position_title?: string;
    team_id?: number | null;
    position_id?: number | null;
    contract_type_id?: number | null;
    salary?: number;
    admission_date?: string;
    is_active: number;
}

export interface EmployeesResponse {
    data: Employee[];
    meta?: {
        totalPages: number;
        page: number;
        total: number;
    };
}

/**
 * APIs específicas
 */
export const authApi = {
    login: (email: string, password: string) =>
        api.post<LoginResponse>('/login', { email, password }, { requiresAuth: false }),

    refreshToken: (refreshToken: string) =>
        api.post('/refresh-token', { refreshToken }, { requiresAuth: false }),

    changePassword: (currentPassword: string, newPassword: string) =>
        api.post('/change-password', { currentPassword, newPassword }),

    me: () => api.get<{ user: User }>('/me'),
};

export const employeeApi = {
    getAll: (page = 1, search = '') =>
        api.get<EmployeesResponse>('/employees', { page, search }),

    getById: (id: number) =>
        api.get<Employee>(`/employees/${id}`),

    create: (data: Partial<Employee> & { password?: string }) =>
        api.post<Employee>('/employees', data),

    update: (id: number, data: Partial<Employee> & { password?: string }) =>
        api.put<Employee>(`/employees/${id}`, data),

    delete: (id: number) =>
        api.delete(`/employees/${id}`),
};

export const optionsApi = {
    getTeams: () =>
        api.get<{ id: number; name: string }[]>('/options/teams'),

    getPositions: () =>
        api.get<{ id: number; title: string }[]>('/options/positions'),

    getContractTypes: () =>
        api.get<{ id: number; name: string }[]>('/options/contract-types'),
};
