import React, { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAsta } from '../../hooks/useAsta';
import { useAstaStateMachine } from '../../hooks/useAstaStateMachine';
import PlayerSelection from './PlayerSelection';
import BiddingPhase from './BiddingPhase';
import Sidebar from './Sidebar';
import Loading from '../common/Loading';
import { ASTA_FASI, RUOLI } from '../../utils/constants';
import '../../styles/AstaInCorso.css';
import { auth } from '../../firebaseConfig';

const AstaInCorso = () => {
  const { id } = useParams();
  const { 
    currentReparto,
    activeParticipants,
    currentTurnIndex,
    partecipantSquadre,
    error,
    isLoading,
    asta
  } = useAsta(id);
  
  const { state, send } = useAstaStateMachine();
  
  // Aggiorna lo stato della state machine quando l'asta viene caricata
  useEffect(() => {
    console.log('🔍 Debug AstaInCorso:', { 
      asta: asta ? { id: asta.id, fase: asta.fase, currentReparto: asta.currentReparto } : null,
      isLoading, 
      error,
      stateValue: state.value,
      activeParticipants: activeParticipants?.length
    });
    
    if (asta && !isLoading && !error) {
      // Inizializza la state machine con lo stato corretto dell'asta
      if (asta.fase === ASTA_FASI.SELECTING) {
        console.log('🚀 Inizializzazione state machine per fase selecting');
        // Se siamo in fase selecting, invia FETCH_SUCCESS per attivare lo stato
        if (state.value === 'idle') {
          send('FETCH_SUCCESS');
        }
      } else if (asta.fase === ASTA_FASI.BIDDING) {
        console.log('🚀 Inizializzazione state machine per fase bidding');
        // Se siamo in fase bidding, attiva entrambi gli stati
        if (state.value === 'idle') {
          send('FETCH_SUCCESS');
          // Piccolo delay per assicurarsi che lo stato selecting sia attivo
          setTimeout(() => {
            send('SELECT_PLAYER');
          }, 100);
        }
      }
    }
  }, [asta, isLoading, error, send, state.value, activeParticipants]);

  const currentTurn = useMemo(() => {
    const currentParticipant = activeParticipants[currentTurnIndex];
    return {
      isUserTurn: currentParticipant?.id === auth.currentUser.uid,
      participantName: currentParticipant?.displayName || 'Utente sconosciuto'
    };
  }, [activeParticipants, currentTurnIndex]);

  const repartoTitle = useMemo(() => RUOLI[currentReparto], [currentReparto]);

  const turnMessage = useMemo(() => {
    if (state.matches(ASTA_FASI.SELECTING)) {
      return currentTurn.isUserTurn 
        ? <span className="your-turn">È IL TUO TURNO DI SELEZIONARE UN CALCIATORE!</span>
        : `È il turno di ${currentTurn.participantName} di selezionare un calciatore`;
    } else if (state.matches(ASTA_FASI.BIDDING)) {
      return currentTurn.isUserTurn
        ? <span className="your-turn">È IL TUO TURNO!</span>
        : `È il turno di: ${currentTurn.participantName}`;
    } else {
      // Fallback: mostra sempre l'interfaccia di selezione se l'asta è in fase selecting
      if (asta?.fase === ASTA_FASI.SELECTING) {
        return currentTurn.isUserTurn 
          ? <span className="your-turn">È IL TUO TURNO DI SELEZIONARE UN CALCIATORE!</span>
          : `È il turno di ${currentTurn.participantName} di selezionare un calciatore`;
      }
      return `È il turno di: ${currentTurn.participantName}`;
    }
  }, [state, currentTurn, asta?.fase]);

  if (isLoading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="asta-in-corso-container">
      <div className="asta-content">
        <div className="asta-main">
          <h2 className="reparto-title">{repartoTitle}</h2>
          <h3>{turnMessage}</h3>
          
          {/* Mostra sempre PlayerSelection se l'asta è in fase selecting, indipendentemente dalla state machine */}
          {(state.matches(ASTA_FASI.SELECTING) || asta?.fase === ASTA_FASI.SELECTING) && <PlayerSelection />}
          {state.matches(ASTA_FASI.BIDDING) && <BiddingPhase />}
        </div>
        <Sidebar squadre={partecipantSquadre} />
      </div>
    </div>
  );
};

export default React.memo(AstaInCorso);