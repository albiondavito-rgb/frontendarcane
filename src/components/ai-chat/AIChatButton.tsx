import styles from './AIChat.module.css';
import { MessageCircle } from 'react-feather';

type AIChatButtonProps = {
  onClick: () => void;
  isShifted: boolean;
};

export const AIChatButton = ({ onClick, isShifted }: AIChatButtonProps) => {
  return (
    <button 
      onClick={onClick} 
      className={styles.aiChat} 
      title="Abrir Asistente de IA"
      style={{ bottom: isShifted ? '6rem' : '2rem' }}
    >
      <MessageCircle size={32} />
    </button>
  );
};
