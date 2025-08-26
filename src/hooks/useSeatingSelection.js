import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAstaAsync } from '../state/slices/astaSlice';
import { selectParticipants } from '../state/selectors/astaSelectors';
import { auth } from '../firebaseConfig';
import { errorHandler } from '../utils/errorHandler';

export const useSeatingSelection = (astaId) => {
  const dispatch = useDispatch();
  const handleError = errorHandler(dispatch);
  const participants = useSelector(selectParticipants);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  useEffect(() => {
    if (!participants || participants.length === 0) return;

    const occupied = participants
      .map(p => (p && p.id && p.seat !== undefined ? p.seat : null))
      .filter(seat => seat !== null);
    setOccupiedSeats(occupied);

    const userSeat = participants.find(p => p && p.id === auth.currentUser?.uid)?.seat;
    if (userSeat !== undefined) {
      setSelectedSeat(userSeat);
    }
  }, [participants]);

  const assignBotsToSeats = useCallback(() => {
    const botsWithoutSeats = participants.filter(p => p && p.isBot && p.seat === undefined);
    if (botsWithoutSeats.length === 0) return;

    let updatedParticipants = [...participants];
    let availableSeats = Array.from({ length: participants.length }, (_, i) => i)
      .filter(seat => !occupiedSeats.includes(seat));

    botsWithoutSeats.forEach(bot => {
      if (availableSeats.length > 0) {
        const randomSeatIndex = Math.floor(Math.random() * availableSeats.length);
        const seat = availableSeats[randomSeatIndex];
        availableSeats.splice(randomSeatIndex, 1);
        updatedParticipants = updatedParticipants.map(p => 
          p.id === bot.id ? { ...p, seat } : p
        );
      }
    });

    dispatch(updateAstaAsync({
      id: astaId,
      partecipanti: updatedParticipants
    }));
  }, [participants, occupiedSeats, dispatch, astaId]);

  useEffect(() => {
    if (participants && participants.length > 0) {
    assignBotsToSeats();
    }
  }, [assignBotsToSeats, participants]);

  const handleSeatSelect = useCallback((seatIndex) => {
    if (occupiedSeats.includes(seatIndex)) return;
    setSelectedSeat(prevSeat => prevSeat === seatIndex ? null : seatIndex);
  }, [occupiedSeats]);

  const updateSeat = useCallback(async () => {
    if (selectedSeat === null) return;
    try {
      const updatedParticipants = participants.map(p => 
        p && p.id === auth.currentUser?.uid ? { ...p, seat: selectedSeat } : p
      );
      await dispatch(updateAstaAsync({
        id: astaId,
        partecipanti: updatedParticipants
      }));
    } catch (error) {
      handleError(error);
    }
  }, [selectedSeat, participants, dispatch, astaId, handleError]);

  const isAllSeated = useCallback(() => participants.every(p => p && p.seat !== undefined), [participants]);

  return {
    selectedSeat,
    occupiedSeats,
    handleSeatSelect,
    updateSeat,
    isAllSeated,
    participants
  };
};