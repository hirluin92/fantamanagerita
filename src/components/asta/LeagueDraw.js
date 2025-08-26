import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeagueDraw } from '../../hooks/useLeagueDraw';
import '../../styles/LeagueDraw.css';

const LeagueDraw = () => {
  const { id: astaId } = useParams();
  const navigate = useNavigate();
  const {
    availableTeams,
    availableParticipants,
    selectedTeam,
    results,
    isLoading,
    error,
    audioError,
    currentParticipant,
    drawStage,
    displayedNames,
    isAnimating,
    isAnimationComplete,
    startDraw,
    handleTeamSelect,
    confirmSelection,
    proceedToNextPhase,
    getUserDisplayName
  } = useLeagueDraw(astaId);

  useEffect(() => {
    if (drawStage === 'completed') {
      // Il reindirizzamento viene gestito dal hook
      return;
    }
  }, [drawStage, navigate, astaId]);

  if (isLoading) return <div className="loading">Caricamento...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const isDrawComplete = availableParticipants.length === 0;

  return (
    <div className="league-draw">
      <h1 className="league-draw__title">Sorteggio Lega</h1>
      {audioError && <div className="audio-error-message">{audioError}</div>}
      
      {!isDrawComplete && (
        <>
          {drawStage === 'initial' && availableParticipants.length > 0 && (
            <button onClick={startDraw} className="league-draw__start-btn">
              {availableParticipants.length === 1 ? 'Seleziona Ultimo Partecipante' : 'Estrai Partecipante'}
            </button>
          )}
          
          {drawStage === 'drawing' && (
            <div className="draw-animation">
              <div className={`name-display ${isAnimating ? 'animating' : ''} ${isAnimationComplete ? 'final-result' : ''}`}>
                {displayedNames.length > 0 && displayedNames[0] ? (
                  displayedNames.map((name, index) => (
                    <span key={index} style={{ 
                      color: '#ffffff',
                      opacity: 1,
                      textShadow: '0 0 30px rgba(59, 130, 246, 0.9)',
                      visibility: 'visible'
                    }}>
                      {name}
                    </span>
                  ))
                ) : (
                  <span style={{ 
                    color: '#ffffff',
                    opacity: 1,
                    textShadow: '0 0 30px rgba(59, 130, 246, 0.9)',
                    visibility: 'visible'
                  }}>
                    {availableParticipants.length > 0 ? 'Preparazione...' : 'Nessun partecipante disponibile'}
                  </span>
                )}
              </div>
              
              <div className="music-info">
                🎵 Musica Champions League in riproduzione
              </div>
            </div>
          )}
          
          {drawStage === 'selecting' && currentParticipant && !isAnimating && (
            <div className="team-selection">
              <h3>{currentParticipant?.displayName || currentParticipant?.name || getUserDisplayName(currentParticipant?.id)}, seleziona la tua squadra:</h3>
              <div className="team-list">
                {availableTeams.map((team) => (
                  <div
                    key={team.id}
                    className={`team-item ${selectedTeam?.id === team.id ? 'selected' : ''}`}
                    onClick={() => handleTeamSelect(team)}
                  >
                    {team.logo && <img src={team.logo} alt={team.name} />}
                    <span>{team.name}</span>
                  </div>
                ))}
              </div>
              <button onClick={confirmSelection} disabled={!selectedTeam} className="confirm-btn">
                Conferma Selezione
              </button>
            </div>
          )}
        </>
      )}
      
      <div className="results-list">
        <h3>Risultati Sorteggio:</h3>
        {results.map((result, index) => (
          <div key={index} className="result-item">
            <span className="participant-name">
              {result.participantName || getUserDisplayName(result.participantId)}
            </span>
            <span className="team-name">→ {result.teamName}</span>
          </div>
        ))}
      </div>
      
      {drawStage === 'completed' && (
        <button onClick={proceedToNextPhase} className="proceed-btn">
          Procedi all'Ordine di Chiamata
        </button>
      )}
    </div>
  );
};

export default LeagueDraw;