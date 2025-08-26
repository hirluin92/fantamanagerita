import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useBidding } from '../../hooks/useBidding';
import { formatCurrency } from '../../utils/helpers';

const BiddingPhase = () => {
  const { id: astaId } = useParams();
  const { 
    selectedPlayer,
    currentBid,
    userCredits,
    timer,
    placeBid,
    passTurn,
    concludiAstaGiocatore
  } = useBidding(astaId);

  const handleBid = useCallback((amount) => {
    if (amount <= userCredits) {
      placeBid(amount);
    }
  }, [userCredits, placeBid]);

  return (
    <div className="bidding-phase">
      <h3 className="calciatore-name">Calciatore: <span>{selectedPlayer?.Nome}</span></h3>
      <div className="current-bid-display">Offerta attuale: {formatCurrency(currentBid)}</div>
      <div className="user-credits">I tuoi crediti: {formatCurrency(userCredits)}</div>
      <div className="bidding-buttons">
        <button onClick={() => handleBid(currentBid + 1)} disabled={currentBid + 1 > userCredits}>+1</button>
        <button onClick={() => handleBid(currentBid + 2)} disabled={currentBid + 2 > userCredits}>+2</button>
        <button onClick={() => handleBid(currentBid + 5)} disabled={currentBid + 5 > userCredits}>+5</button>
        <button onClick={() => handleBid(currentBid + 10)} disabled={currentBid + 10 > userCredits}>+10</button>
        <button onClick={() => handleBid(userCredits)}>All In</button>
        <button onClick={passTurn}>Non partecipo</button>
      </div>
      <div className="timer">Tempo rimanente: {timer} secondi</div>
      <button onClick={concludiAstaGiocatore}>Concludi Asta Giocatore</button>
    </div>
  );
};

export default React.memo(BiddingPhase);