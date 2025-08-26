import { useState, useCallback } from 'react';

export const useAuctionState = (auctionId) => {
  const [auctionState, setAuctionState] = useState({
    participants: [],
    teams: [],
    currentPhase: 'seating',
    currentTurn: null,
    selectedPlayer: null,
    currentBid: 0,
    squads: [],
    selectedSquad: null,
  });

  const updateAuctionState = useCallback((updates) => {
    setAuctionState(prevState => ({ ...prevState, ...updates }));
  }, []);

  const setCurrentPhase = useCallback((phase) => {
    updateAuctionState({ currentPhase: phase });
  }, [updateAuctionState]);

  return { 
    auctionState, 
    updateAuctionState, 
    currentPhase: auctionState.currentPhase, 
    setCurrentPhase 
  };
};