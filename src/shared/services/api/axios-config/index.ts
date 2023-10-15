import axios from 'axios';

import { responseInterceptor, errorInterceptor } from './interceptors';
import { Environment } from '../../../environment';


const Api = axios.create({
  baseURL: Environment.URL_BASE,
  headers: localStorage.getItem('APP_ACCESS_TOKEN')
      ? { Authorization: `Bearer ${JSON.parse(localStorage.getItem('APP_ACCESS_TOKEN') || '')}` }
      : undefined,
});

Api.interceptors.response.use(
  (response) => responseInterceptor(response),
  (error) => errorInterceptor(error),
);

export { Api };
