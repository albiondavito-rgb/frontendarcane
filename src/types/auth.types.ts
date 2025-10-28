// Este archivo contendrá todas las interfaces y tipos relacionados con la autenticación.

// Datos que el frontend envía al backend para el registro
export interface RegisterPayload {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// Datos que el frontend envía al backend para el login
export interface LoginPayload {
    email: string;
    password: string;
}

// Datos del usuario que se reciben del backend y se guardan en el contexto
export interface User {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    roles: string[];
}
