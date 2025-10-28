import React from 'react';
import styles from './Checkout.module.css';
import { Check } from 'react-feather';

interface CheckoutStepsProps {
  currentStep: number;
  steps: string[];
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep, steps }) => {
  return (
    <div className={styles.stepsContainer}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div 
            key={index}
            className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
          >
            <div className={styles.stepCircle}>
              {isCompleted ? <Check size={20} /> : stepNumber}
            </div>
            <div className={styles.stepLabel}>{step}</div>
          </div>
        );
      })}
    </div>
  );
};
