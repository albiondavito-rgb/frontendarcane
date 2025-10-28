// Para enviar datos al backend al crear una tarjeta
export interface MetodoPagoCreate {
  numeroTarjeta: string;
  mesExpiracion: number;
  anoExpiracion: number;
  nombreTitular: string;
  codigoPostal: string;
}

// Para recibir datos del backend y mostrar las tarjetas guardadas
export interface MetodoPago {
  id: number;
  tipoTarjeta: string;
  numeroTarjetaEnmascarado: string;
  mesExpiracion: number;
  anoExpiracion: number;
  nombreTitular: string;
}
