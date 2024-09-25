import axios from 'axios';
import { baseUrl, config, withLogs } from '../core';
import {WorkerProps} from "./WorkerProps";

const authUrl = `http://${baseUrl}/api/auth`;

export interface AuthProps {
  token: string;
}

export const login: (username?: string, password?: string) => Promise<AuthProps> = (username, password) => {
  return withLogs(axios.post(`${authUrl}/login`, { username, password }, config), 'login');
}

export const getAllWorkers: () => Promise<WorkerProps[]> = () => {
  return withLogs(axios.get(`${authUrl}/get`, config), 'getAllWorkers');
}
