import styles from './ComponentCard.module.css';
import type { ReactNode } from 'react';

type ComponentCardProps = {
  title: string;
  children: ReactNode;
};

export const ComponentCard = ({ title, children }: ComponentCardProps) => {
  return (
    <section className={styles.componentCard}>
      <div className={styles.componentHeader}>
        <h2 className={styles.componentTitle}>{title}</h2>
      </div>
      {children}
    </section>
  );
};
