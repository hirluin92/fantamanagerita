import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateAstaAsync } from '../../state/slices/astaSlice';
import { useSeatingSelection } from '../../hooks/useSeatingSelection';
import '../../styles/SeatingSelection.css';

const SeatingSelection = ({ astaId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    selectedSeat,
    occupiedSeats,
    handleSeatSelect,
    updateSeat,
    isAllSeated,
    participants
  } = useSeatingSelection(astaId);

  useEffect(() => {
    updateSeat();
  }, [updateSeat, selectedSeat]);

  const handleStartAsta = useCallback(async () => {
    try {
      await dispatch(updateAstaAsync({
        id: astaId,
        fase: 'league_draw', // or whatever the next phase is in your app
      }));
      navigate(`/sorteggio-lega/${astaId}`); // Adjust this route as needed
    } catch (error) {
      console.error('Error starting asta:', error);
    }
  }, [astaId, dispatch, navigate]);

  const calculateSeatStyle = (index) => {
    const totalSeats = participants.length;
    const angle = (2 * Math.PI * index) / totalSeats - Math.PI / 2;
    const radius = 42;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div className="seating-selection">
      <h1 className="title">Seleziona il tuo posto</h1>
      <div className="table-container">
        <div className="table">
          {participants.map((participant, index) => (
            <div
              key={index}
              className={`seat 
                ${occupiedSeats.includes(index) ? 'occupied' : ''} 
                ${selectedSeat === index ? 'selected' : ''}
                ${participant && participant.isBot ? 'bot' : ''}
              `}
              onClick={() => handleSeatSelect(index)}
              style={calculateSeatStyle(index)}
            >
              {index + 1}
              {participant && participant.isBot && <span className="bot-indicator">Bot</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Disponibile</span>
        </div>
        <div className="legend-item">
          <div className="legend-color occupied"></div>
          <span>Occupato</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selezionato</span>
        </div>
        <div className="legend-item">
          <div className="legend-color bot"></div>
          <span>Bot</span>
        </div>
      </div>
      {isAllSeated() && (
        <button className="start-asta-button" onClick={handleStartAsta}>
          Avvia Asta
        </button>
      )}
    </div>
  );
};

export default React.memo(SeatingSelection);