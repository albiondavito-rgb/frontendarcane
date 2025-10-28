export interface UpdateEmailPayload {
  nuevoEmail: string;
}

export interface UpdatePasswordPayload {
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarNuevaContrasena: string;
}

export interface UpdateTelefonoPayload {
  telefono: string;
}

export interface FoundUser {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
}