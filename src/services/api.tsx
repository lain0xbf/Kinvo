import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://85ab-146-164-9-234.ngrok-free.app/api',
});