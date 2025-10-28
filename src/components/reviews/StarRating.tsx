import React, { useState } from 'react';
import { Star } from 'react-feather'; // Importar el componente Star de react-feather

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  readOnly?: boolean; // Nueva prop
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  const displayRating = readOnly ? rating : (hover || rating);

  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            style={{
              background: 'none',
              border: 'none',
              padding: '0'
            }}
            onClick={readOnly ? undefined : () => onRatingChange(starValue)}
            onMouseEnter={readOnly ? undefined : () => setHover(starValue)}
            onMouseLeave={readOnly ? undefined : () => setHover(0)}
            disabled={readOnly}
          >
            <Star
              size={16}
              fill={starValue <= displayRating ? '#FFD700' : 'none'}
              stroke={starValue <= displayRating ? '#FFD700' : '#CCCCCC'}
              strokeWidth="1px"
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
