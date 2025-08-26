import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setCurrentPhase, 
  setParticipants, 
  setSelectedPlayer, 
  setCurrentBid, 
  setCurrentBidder, 
  setTimer, 
  setCurrentReparto,
  setCurrentTurnIndex,
  setLastSelectorIndex,
  setActiveParticipants,
  setPartecipantSquadre,
  setAllGiocatori,
  setFilteredGiocatori,
  setUserCredits,
  setIsLoading,
  setError,
  updateAstaAsync
} from '../state/slices/astaSlice';
import { selectAstaState } from '../state/selectors/astaSelectors';
import * as astaService from '../services/astaService';
import { auth } from '../firebaseConfig';
import { errorHandler } from '../utils/errorHandler';

export const useAsta = (astaId) => {
  const dispatch = useDispatch();
  const handleError = errorHandler(dispatch);
  const asta = useSelector(selectAstaState);
  
  const changeTurnRef = useRef(null);
  const concludiAstaGiocatoreRef = useRef(null);
  const getNextActiveTurnRef = useRef(null);

  const fetchAsta = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const astaData = await astaService.getAsta(astaId);
      if (!astaData) {
        throw new Error("Asta non trovata");
      }
      dispatch(setCurrentPhase(astaData.fase || 'seating'));
      dispatch(setParticipants(astaData.partecipanti || []));
      dispatch(setSelectedPlayer(astaData.selectedPlayer || null));
      dispatch(setCurrentBid(astaData.currentBid || 0));
      dispatch(setCurrentBidder(astaData.currentBidder || null));
      dispatch(setTimer(astaData.timer || 20));
      dispatch(setCurrentReparto(astaData.currentReparto || 'P'));
      dispatch(setCurrentTurnIndex(astaData.currentTurnIndex || 0));
      dispatch(setLastSelectorIndex(astaData.lastSelectorIndex || 0));
      dispatch(setActiveParticipants(astaData.activeParticipants || []));
      dispatch(setPartecipantSquadre(astaData.partecipantSquadre || []));
      dispatch(setUserCredits(astaData.partecipanti?.find(p => p.id === auth.currentUser.uid)?.crediti || 0));
      
      // Carica i giocatori del reparto corrente se siamo in fase selecting o bidding
      if (astaData.fase === 'selecting' || astaData.fase === 'bidding') {
        try {
          const giocatori = await astaService.fetchGiocatori(astaData.currentReparto || 'P');
          dispatch(setAllGiocatori(giocatori));
          dispatch(setFilteredGiocatori(giocatori));
        } catch (error) {
          console.warn('Errore nel caricamento dei giocatori:', error);
        }
      }
    } catch (error) {
      handleError(error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setIsLoading(false));
    }
  }, [astaId, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!astaId) return;
    
    let isMounted = true;
    
    const initializeAsta = async () => {
      if (isMounted) {
        await fetchAsta();
      }
    };
    
    initializeAsta();
    
    return () => {
      isMounted = false;
      // Cleanup per evitare memory leaks
      if (changeTurnRef.current) changeTurnRef.current = null;
      if (concludiAstaGiocatoreRef.current) concludiAstaGiocatoreRef.current = null;
      if (getNextActiveTurnRef.current) getNextActiveTurnRef.current = null;
    };
  }, [astaId]); // eslint-disable-line react-hooks/exhaustive-deps

  const placeBid = useCallback(async (amount) => {
    if (amount <= asta.currentBid) return;
    if (!asta.activeParticipants[asta.currentTurnIndex].isActive) {
      console.error("Non puoi fare un'offerta perché non sei più attivo in questa asta.");
      return;
    }

    try {
      await dispatch(updateAstaAsync({
        currentBid: amount,
        currentBidder: auth.currentUser.uid,
        timer: 15
      }));
      await changeTurnRef.current();
    } catch (error) {
      console.error('Errore durante l\'offerta:', error);
    }
  }, [asta, dispatch]);

  const passTurn = useCallback(async () => {
    const updatedParticipants = asta.activeParticipants.map((p, index) => 
      index === asta.currentTurnIndex ? { ...p, isActive: false } : p
    );

    try {
      await dispatch(updateAstaAsync({
        activeParticipants: updatedParticipants
      }));
      await changeTurnRef.current();
    } catch (error) {
      console.error('Errore durante il passaggio del turno:', error);
    }
  }, [asta, dispatch]);

  getNextActiveTurnRef.current = useCallback(() => {
    let nextIndex = (asta.currentTurnIndex + 1) % asta.activeParticipants.length;
    let count = 0;
    while (!asta.activeParticipants[nextIndex].isActive && count < asta.activeParticipants.length) {
      nextIndex = (nextIndex + 1) % asta.activeParticipants.length;
      count++;
    }
    return count === asta.activeParticipants.length - 1 ? -1 : nextIndex;
  }, [asta.currentTurnIndex, asta.activeParticipants]);

  concludiAstaGiocatoreRef.current = useCallback(async (winner) => {
    if (!winner || !asta.selectedPlayer) {
      handleError(new Error('Errore: vincitore o giocatore selezionato non valido'));
      return;
    }

    try {
      await astaService.concludiAstaGiocatore(astaId, winner, asta.selectedPlayer, asta.currentBid);
      dispatch(setCurrentPhase('selecting'));
      dispatch(setSelectedPlayer(null));
      dispatch(setCurrentBid(0));
      dispatch(setCurrentBidder(null));
      dispatch(setTimer(20));
      dispatch(setCurrentTurnIndex((asta.lastSelectorIndex + 1) % asta.participants.length));
      dispatch(setActiveParticipants(asta.participants.map(p => ({ ...p, isActive: true }))));
      dispatch(setLastSelectorIndex((asta.lastSelectorIndex + 1) % asta.participants.length));

      if (winner.id === auth.currentUser.uid) {
        dispatch(setUserCredits(winner.crediti - asta.currentBid));
      }
    } catch (error) {
      handleError(error);
    }
  }, [astaId, asta, dispatch, handleError]);

  changeTurnRef.current = useCallback(async () => {
    const activeParticipantsCount = asta.activeParticipants.filter(p => p.isActive).length;
  
    if (activeParticipantsCount === 1) {
      const winner = asta.activeParticipants.find(p => p.isActive);
      await concludiAstaGiocatoreRef.current(winner);
      return;
    }
  
    const nextTurnIndex = getNextActiveTurnRef.current();
  
    if (nextTurnIndex !== -1) {
      await dispatch(updateAstaAsync({
        currentTurnIndex: nextTurnIndex,
        timer: 15
      }));
    } else {
      await concludiAstaGiocatoreRef.current(null);
    }
  }, [asta, dispatch]);

  const selectPlayer = useCallback(async (player) => {
    const nextSelectorIndex = (asta.lastSelectorIndex + 1) % asta.participants.length;
    const resetActiveParticipants = asta.participants.map(p => ({ ...p, isActive: true }));
    
    const startingBid = asta.partenzaDa === 'quotazione' ? player.Qt || 0 : 0;
    
    try {
      await dispatch(updateAstaAsync({
        fase: 'bidding',
        selectedPlayer: player,
        currentBid: startingBid,
        timer: 15,
        activeParticipants: resetActiveParticipants,
        currentTurnIndex: nextSelectorIndex,
        lastSelectorIndex: nextSelectorIndex
      }));
    } catch (error) {
      handleError(error);
    }
  }, [asta, dispatch, handleError]);

  const handleSearch = useCallback((event, value) => {
    const searchTerm = value.toLowerCase();
    const filtered = asta.allGiocatori.filter(giocatore => 
      giocatore.Nome.toLowerCase().includes(searchTerm)
    );
    dispatch(setFilteredGiocatori(filtered));
  }, [asta.allGiocatori, dispatch]);

  const handleConcludiAstaReparto = useCallback(async () => {
    const reparti = ['P', 'D', 'C', 'A'];
    const currentRepartoIndex = reparti.indexOf(asta.currentReparto);
    const nextRepartoIndex = (currentRepartoIndex + 1) % reparti.length;
    const nextReparto = reparti[nextRepartoIndex];
  
    try {
      await dispatch(updateAstaAsync({
        fase: 'selecting',
        currentReparto: nextReparto
      }));
      
      const newGiocatori = await astaService.fetchGiocatori(nextReparto);
      dispatch(setAllGiocatori(newGiocatori));
      dispatch(setFilteredGiocatori(newGiocatori));
    } catch (error) {
      handleError(error);
    }
  }, [asta, dispatch, handleError]);

  const memoizedValues = useMemo(() => ({
    ...asta,
    placeBid,
    passTurn,
    selectPlayer,
    concludiAstaGiocatore: concludiAstaGiocatoreRef.current,
    handleSearch,
    handleConcludiAstaReparto
  }), [asta, placeBid, passTurn, selectPlayer, handleSearch, handleConcludiAstaReparto]);

  return memoizedValues;
};