import { useState } from 'react';
import styles from './StarRating.module.css';

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

export const StarRating = ({ rating, setRating }: StarRatingProps) => {
  const [hover, setHover] = useState(0);

  return (
    <div className={styles.starRating}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            className={`${styles.starButton} ${starValue <= (hover || rating) ? styles.on : styles.off}`}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            <span className={styles.star}>&#9733;</span>
          </button>
        );
      })}
    </div>
  );
};
