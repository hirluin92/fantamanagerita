import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAstaAsync } from '../state/slices/astaSlice';
import { selectParticipants } from '../state/selectors/astaSelectors';
import { errorHandler } from '../utils/errorHandler';
import { shuffleArray } from '../utils/helpers';

export const useOrderSelection = (astaId) => {
  const dispatch = useDispatch();
  const handleError = errorHandler(dispatch);
  const participants = useSelector(selectParticipants);
  const [selectionMode, setSelectionMode] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [displayedNames, setDisplayedNames] = useState([]);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [finalOrder, setFinalOrder] = useState([]);

  const getParticipantName = useCallback((participant) => {
    if (!participant) return 'Partecipante sconosciuto';
    return participant.isBot ? participant.name : (participant.displayName || participant.id);
  }, []);

  const handleRandomSelection = useCallback(() => {
    setIsAnimating(true);
    const shuffledParticipants = shuffleArray([...participants]);
    let currentIndex = 0;

    const animate = () => {
      if (currentIndex < shuffledParticipants.length) {
        const participant = shuffledParticipants[currentIndex];
        const displayName = participant ? getParticipantName(participant) : 'Partecipante sconosciuto';
        setDisplayedNames(prev => {
          const newNames = [...prev, displayName];
          if (newNames.length > 2) newNames.shift();
          return newNames;
        });
        currentIndex++;
        setTimeout(animate, Math.max(50, 300 * Math.pow(1 - currentIndex / shuffledParticipants.length, 2)));
      } else {
        setIsAnimating(false);
        setSelectedParticipant(shuffledParticipants[0]);
        setFinalOrder(shuffledParticipants);
      }
    };

    animate();
  }, [participants, getParticipantName]);

  const handleManualSelect = useCallback((playerId) => {
    const selected = participants.find(p => p.id === playerId);
    setSelectedParticipant(selected);
    const remainingParticipants = participants.filter(p => p.id !== playerId);
    setFinalOrder([selected, ...shuffleArray(remainingParticipants)]);
  }, [participants]);

  const completeOrderSelection = useCallback(async () => {
    try {
      await dispatch(updateAstaAsync({
        id: astaId,
        startingOrder: finalOrder.map(p => p.id),
        fase: 'selecting', // Cambiato da 'countdown' a 'selecting'
        currentTurnIndex: 0
      }));
      setOrderCompleted(true);
    } catch (error) {
      handleError(error);
    }
  }, [astaId, dispatch, handleError, finalOrder]);

  useEffect(() => {
    if (finalOrder.length === participants.length && participants.length > 0) {
      setOrderCompleted(true);
    }
  }, [finalOrder, participants]);

  return {
    selectionMode,
    isAnimating,
    selectedParticipant,
    displayedNames,
    participants,
    orderCompleted,
    setSelectionMode,
    handleRandomSelection,
    handleManualSelect,
    completeOrderSelection,
    getParticipantName
  };
};