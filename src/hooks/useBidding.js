import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAstaAsync, setError } from '../state/slices/astaSlice';
import { auth } from '../firebaseConfig';
import { errorHandler } from '../utils/errorHandler';

export const useBidding = (astaId) => {
  const dispatch = useDispatch();
  const handleError = errorHandler(dispatch);
  const asta = useSelector(state => state.asta);

  const { 
    selectedPlayer, 
    currentBid, 
    userCredits, 
    timer,
    currentBidder
  } = useMemo(() => ({
    selectedPlayer: asta.selectedPlayer,
    currentBid: asta.currentBid,
    userCredits: asta.userCredits,
    timer: asta.timer,
    currentBidder: asta.currentBidder
  }), [asta]);

  const placeBid = useCallback(async (amount) => {
    if (amount <= currentBid) return;
    if (amount > userCredits) {
      handleError(new Error("Non hai abbastanza crediti per questa offerta."));
      return;
    }

    try {
      await dispatch(updateAstaAsync({
        id: astaId,
        currentBid: amount,
        currentBidder: auth.currentUser.uid,
        timer: 15
      }));
    } catch (error) {
      handleError(error);
    }
  }, [astaId, currentBid, userCredits, dispatch, handleError]);

  const passTurn = useCallback(async () => {
    try {
      await dispatch(updateAstaAsync({
        id: astaId,
        activeParticipants: asta.activeParticipants.map(p => 
          p.id === auth.currentUser.uid ? { ...p, isActive: false } : p
        )
      }));
    } catch (error) {
      dispatch(setError("Errore nel passaggio del turno"));
    }
  }, [astaId, asta.activeParticipants, dispatch]);

  const concludiAstaGiocatore = useCallback(async () => {
    if (!currentBidder) {
      dispatch(setError("Nessun offerente attuale"));
      return;
    }

    try {
      await dispatch(updateAstaAsync({
        id: astaId,
        fase: 'selecting',
        selectedPlayer: null,
        currentBid: 0,
        currentBidder: null,
        timer: 20,
      }));
    } catch (error) {
      dispatch(setError("Errore nella conclusione dell'asta del giocatore"));
    }
  }, [astaId, currentBidder, dispatch]);

  return {
    selectedPlayer,
    currentBid,
    userCredits,
    timer,
    currentBidder,
    placeBid,
    passTurn,
    concludiAstaGiocatore
  };
};