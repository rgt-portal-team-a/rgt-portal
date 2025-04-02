import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

interface ApiClientConfig extends AxiosRequestConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: true;
}

axios.defaults.withCredentials = true;

export const createApiClient = (
  baseURL: string = import.meta.env.VITE_NODE_ENV === "development" ? import.meta.env.VITE_DEV_BASE_URL : import.meta.env.VITE_BASE_URL
): AxiosInstance => {
  const config: ApiClientConfig = {
    baseURL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
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


