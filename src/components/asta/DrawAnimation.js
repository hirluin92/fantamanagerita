import React, { useEffect, useRef } from 'react';
import '../../styles/DrawAnimation.css';

const DrawAnimation = ({ availableParticipants, selectedParticipant, isAnimating, onAnimationComplete }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (isAnimating && availableParticipants.length > 0) {
      const totalDuration = 9000; // 9 seconds
      const fastPhaseDuration = 4000; // 4 seconds of fast animation
      const startTime = Date.now();

      const animate = () => {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < totalDuration) {
          const randomIndex = Math.floor(Math.random() * availableParticipants.length);
          const participant = availableParticipants[randomIndex];
          const displayName = participant ? (participant.displayName || participant.name || 'Partecipante') : 'Partecipante';
          animationRef.current.textContent = displayName;
          
          let nextInterval;
          if (elapsedTime < fastPhaseDuration) {
            nextInterval = 50; // Fast phase: change every 50ms
          } else {
            const slowPhaseProgress = (elapsedTime - fastPhaseDuration) / (totalDuration - fastPhaseDuration);
            nextInterval = 50 + (slowPhaseProgress * 950); // Gradually increase interval up to 1000ms
          }

          setTimeout(animate, nextInterval);
        } else {
          const finalName = selectedParticipant ? (selectedParticipant.displayName || selectedParticipant.name || 'Partecipante selezionato') : 'Partecipante selezionato';
          animationRef.current.textContent = finalName;
          onAnimationComplete();
        }
      };

      animate();
    }
  }, [isAnimating, availableParticipants, selectedParticipant, onAnimationComplete]);

  return (
    <div className="draw-animation">
      <div className="draw-animation__name-display" ref={animationRef}>
        {isAnimating ? 'Sorteggio in corso...' : 'Premi il pulsante per iniziare'}
      </div>
    </div>
  );
};

export default React.memo(DrawAnimation);