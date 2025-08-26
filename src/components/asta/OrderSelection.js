import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useDispatch } from 'react-redux';
import { updateAstaAsync } from '../../state/slices/astaSlice';
import '../../styles/OrderSelection.css';

const OrderSelection = () => {
  const { id: astaId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [participants, setParticipants] = useState([]);
  const [selectionMode, setSelectionMode] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [displayedNames, setDisplayedNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const animationRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const fetchAstaData = async () => {
      try {
        const astaRef = doc(db, 'aste', astaId);
        const astaSnap = await getDoc(astaRef);
        
        if (astaSnap.exists()) {
          const astaData = astaSnap.data();
          
          if (astaData.drawResults && astaData.drawResults.length > 0) {
            // Usa i risultati del sorteggio per creare la lista dei partecipanti
            const participantsList = astaData.drawResults.map(result => ({
              id: result.participantId,
              displayName: result.participantName,
              squadraId: result.squadraId,
              squadraName: result.squadraName
            }));
            setParticipants(participantsList);
          } else {
            // Fallback: usa i partecipanti dell'asta
            const participantsList = (astaData.partecipanti || [])
              .filter(p => p && p.id)
              .map(p => ({
                id: p.id,
                displayName: p.displayName || p.name || `Partecipante ${p.id}`,
                squadraId: p.squadraId,
                squadraName: p.squadraName
              }));
            setParticipants(participantsList);
          }
        }
      } catch (error) {
        console.error('Errore nel caricamento dell\'asta:', error);
        setError('Errore nel caricamento dell\'asta: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAstaData();
  }, [astaId]);

  const handleRandomSelection = () => {
    setIsAnimating(true);
    startTimeRef.current = Date.now();
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    let currentIndex = 0;

    const animate = () => {
      const elapsedTime = Date.now() - startTimeRef.current;
      const totalDuration = 5000; // 5 seconds total animation
      
      if (elapsedTime < totalDuration) {
        const progress = elapsedTime / totalDuration;
        const speed = Math.max(50, 300 * Math.pow(1 - progress, 2)); // Starts very fast, slows down more dramatically
        
        setDisplayedNames(prev => {
          const newNames = [...prev, shuffledParticipants[currentIndex].displayName];
          if (newNames.length > 2) newNames.shift();
          return newNames;
        });
        currentIndex = (currentIndex + 1) % shuffledParticipants.length;
        animationRef.current = setTimeout(animate, speed);
      } else {
        // Animation ended, select the final player
        const finalPlayer = shuffledParticipants[0];
        setDisplayedNames([finalPlayer.displayName]);
        setIsAnimating(false);
        
        setTimeout(() => {
          handleComplete([finalPlayer, ...shuffledParticipants.slice(1)]);
        }, 4000); // 4 seconds pause on the chosen name
      }
    };

    animate();
  };

  const handleManualConfirm = () => {
    const selected = participants.find(p => p.id === selectedPlayer);
    if (selected) {
      handleComplete([selected, ...participants.filter(p => p.id !== selected.id)]);
    }
  };

  const handleComplete = async (finalOrder) => {
    try {
      // Aggiorna l'asta con l'ordine finale
      await dispatch(updateAstaAsync({
        id: astaId,
        fase: 'selecting',
        finalOrder: finalOrder,
        currentTurnIndex: 0,
        lastSelectorIndex: -1
      }));
      
      // Reindirizza all'asta
    navigate(`/asta-in-corso/${astaId}`);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'asta:', error);
      setError('Errore durante l\'aggiornamento dell\'asta: ' + error.message);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  if (isLoading) return <div className="loading">Caricamento...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (participants.length === 0) return <div className="error-message">Nessun partecipante trovato</div>;

  return (
    <div className="order-selection">
      <h2>Seleziona l'ordine di partenza</h2>
      
      <div className="participants-info">
        <h3>Partecipanti e Squadre:</h3>
        <div className="participants-list">
          {participants.map((participant, index) => (
            <div key={participant.id} className="participant-item">
              <span className="participant-name">{participant.displayName}</span>
              <span className="squadra-name">→ {participant.squadraName}</span>
            </div>
          ))}
        </div>
      </div>
      
        <div className="selection-options">
          <button onClick={() => setSelectionMode('random')}>Seleziona Random</button>
          <button onClick={() => setSelectionMode('manual')}>Scegli Giocatore</button>
        </div>
      
      {selectionMode === 'random' && (
        <div className="random-selection">
          <h3>Selezione casuale</h3>
          <div className={`name-display ${isAnimating ? 'animating' : ''}`}>
            {displayedNames.map((name, index) => (
              <span key={index} style={{transform: `translateY(${-100 * index}%)`}}>{name}</span>
            ))}
          </div>
          {!isAnimating && (
            <button onClick={handleRandomSelection}>Avvia Selezione Random</button>
          )}
        </div>
      )}
      
      {selectionMode === 'manual' && (
        <div className="manual-selection">
          <h3>Seleziona il primo giocatore</h3>
          <select 
            value={selectedPlayer} 
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            <option value="">Seleziona un giocatore</option>
            {participants.map((player) => (
              <option key={player.id} value={player.id}>
                {player.displayName} ({player.squadraName})
              </option>
            ))}
          </select>
          <button onClick={handleManualConfirm} disabled={!selectedPlayer}>
            Conferma Selezione
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSelection;