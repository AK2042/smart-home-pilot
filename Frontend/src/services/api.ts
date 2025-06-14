
import { LoginResponse, Device, DeviceResponse, DeviceRegistration } from '../types/auth';

const API_BASE = '<YOUR_API_BASE_URL>';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  async register(username: string, password: string) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem('token', this.token!);
    return data;
  }

  async registerDevice(deviceData: DeviceRegistration): Promise<DeviceResponse> {
    return this.request('/device', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async getDevices(): Promise<Device[]> {
    return this.request('/devices');
  }

  async toggleDevice(deviceId: string, state: 'ON' | 'OFF') {
    return this.request(`/device/${deviceId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ state }),
    });
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
