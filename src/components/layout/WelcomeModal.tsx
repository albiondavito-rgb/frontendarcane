import styles from './WelcomeModal.module.css';

interface WelcomeModalProps {
  message: string;
}

export const WelcomeModal = ({ message }: WelcomeModalProps) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.spinner}></div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};
