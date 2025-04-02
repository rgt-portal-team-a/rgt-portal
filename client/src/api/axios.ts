import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface ApiClientConfig extends AxiosRequestConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: true;
}

axios.defaults.withCredentials = true;

console.log('Environment variables:', {
  VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
  DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
});

export const createApiClient = (
  baseURL: string = import.meta.env.VITE_NODE_ENV === 'development'
    ? import.meta.env.VITE_DEV_BASE_URL
    : import.meta.env.VITE_BASE_URL
): AxiosInstance => {
  console.log(`This is the baseURL: ${baseURL}`);
  const config: ApiClientConfig = {
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  };

  const axiosInstance = axios.create(config);

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export const defaultApiClient = createApiClient();

export default defaultApiClient;
