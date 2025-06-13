
export interface User {
  username: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Device {
  _id: string;
  device_id: string;
  name: string;
  owner: string;
  state: 'ON' | 'OFF';
}

export interface DeviceResponse {
  device_id: string;
  topic: string;
  qr: string;
}
