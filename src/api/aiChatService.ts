import { ENDPOINTS } from './endpoints';

export type ChatMessage = {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: Date;
};

export type ChatResponse = {
  message: string;
  intentType: string;
  additionalData?: any;
  sessionId: string;
};

/**
 * Servicio para interactuar con el asistente de IA
 */
export const aiChatService = {
  /**
   * Envía un mensaje al asistente de IA
   * @param message - Mensaje del usuario
   * @param sessionId - ID de sesión opcional para mantener el contexto de la conversación
   * @returns Respuesta del asistente con el mensaje, tipo de intención y datos adicionales
   */
  sendMessage: async (message: string, sessionId: string = `anon_${Date.now()}`): Promise<ChatResponse> => {
    try {
      const response = await fetch(ENDPOINTS.AI.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', errorData);
        throw new Error(errorData.message || 'Error al comunicarse con el asistente');
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      return data;
    } catch (error) {
      console.error('Error en el servicio de chat:', error);
      throw error;
    }
  },
};
