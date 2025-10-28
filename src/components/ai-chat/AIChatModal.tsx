import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import styles from './AIChat.module.css';
import { X, Send } from 'react-feather';
import { aiChatService } from '../../api/aiChatService';
import { RecommendedProducts } from './RecommendedProducts';
import { useCart } from '../../context/CartContext';
import ReactMarkdown from 'react-markdown';
import { useResizable } from '../../hooks/useResizable';
import type { Message } from '../../types/chat.types';

// Las props que recibirá el modal
type AIChatModalProps = {
  onClose: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

export const AIChatModal = ({ onClose, messages, setMessages }: AIChatModalProps) => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(localStorage.getItem('chatSessionId') || `anon_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { size, handleMouseDown } = useResizable({ width: 380, height: 500 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { sender: 'bot', text: '¡Hola! Soy tu asistente virtual de CompoNet. ¿En qué puedo ayudarte hoy?' }
      ]);
    }
  }, [messages.length, setMessages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Componente personalizado para los enlaces
  const CustomLink = (props: any) => {
    const { href, children } = props;
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      
      if (href.startsWith('/')) {
        onClose();
        navigate(href);
      } else {
        window.open(href, '_blank');
      }
    };
    
    return (
      <a href={href} onClick={handleClick}>
        {children}
      </a>
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    const userMessage = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiChatService.sendMessage(userMessage, sessionId);
      
      if (response.sessionId) {
        localStorage.setItem('chatSessionId', response.sessionId);
        setSessionId(response.sessionId);
      }

      const botMessage: Message = { 
        sender: 'bot', 
        text: response.message 
      };

      if (response.additionalData) {
        if (Array.isArray(response.additionalData)) {
          botMessage.products = response.additionalData;
        } else if (typeof response.additionalData === 'object') {
          if (response.additionalData.id) {
            botMessage.products = [response.additionalData];
          }
        }
      }
      
      if ((response.intentType === 'add_to_cart' || response.intentType === 'confirm_add_to_cart') && 
          response.additionalData && response.additionalData.product) {
        addToCart(response.additionalData.product);
      }

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return createPortal(
    <div className={`${styles.chatOverlay} ${styles.active}`}>
      <div ref={modalRef} style={{ width: size.width, height: size.height }} className={styles.chatModal}>
        <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
        <header className={styles.chatHeader}>
          <h3 className={styles.chatTitle}>Asistente Virtual</h3>
          <button onClick={onClose} className={styles.closeChat} title="Cerrar chat">
            <X size={24} />
          </button>
        </header>

        <div className={styles.chatMessages}>
          {messages.map((msg, index) => (
            <div key={index}>
              <div className={`${styles.message} ${styles[msg.sender]}`}>
                {msg.sender === 'bot' ? (
                  <ReactMarkdown
                    components={{
                      a: CustomLink
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
              {msg.products && msg.products.length > 0 && (
                <RecommendedProducts products={msg.products} />
              )}
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.bot} ${styles.typing}`}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatInputContainer}>
          <input 
            type="text" 
            className={styles.chatInput} 
            placeholder="Escribe tu mensaje..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            className={styles.sendBtn} 
            title="Enviar mensaje"
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
