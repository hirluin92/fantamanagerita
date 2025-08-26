import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faUser, faCoins, faFutbol } from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from '../../hooks/useSidebar';

const Sidebar = () => {
  const {
    isSidebarExpanded,
    selectedSquadra,
    partecipantSquadre,
    toggleSidebar,
    handleSquadraClick,
    getParticipantName,
    calculateRemainingCredits
  } = useSidebar();

  const renderPlayers = (players) => {
    if (!players) return null;
    const roleOrder = ['P', 'D', 'C', 'A'];
    return roleOrder.map(role => {
      const rolePlayers = players[role] || [];
      return (
        <div key={role} className="player-section">
          <h4>{role === 'P' ? 'Portieri' : role === 'D' ? 'Difensori' : role === 'C' ? 'Centrocampisti' : 'Attaccanti'}</h4>
          <ul className="player-list">
            {rolePlayers.map((player, index) => (
              <li key={`${player.id || player.Nome}-${index}`} className="player-item">
                <span className="player-name">{player.Nome}</span>
                <span className="player-cost">{player.costoAcquisto} cr</span>
              </li>
            ))}
          </ul>
        </div>
      );
    });
  };

  const remainingCredits = selectedSquadra ? calculateRemainingCredits(selectedSquadra) : 0;

  return (
    <div className={`sidebar ${isSidebarExpanded ? 'expanded' : ''}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isSidebarExpanded ? faChevronRight : faChevronLeft} />
      </div>
      <div className="team-icons">
        {partecipantSquadre && partecipantSquadre.map((squadra, index) => (
          <div
            key={squadra.id || `squadra-${index}`}
            className={`team-icon ${selectedSquadra && selectedSquadra.id === squadra.id ? 'active' : ''}`}
            onClick={() => handleSquadraClick(squadra)}
          >
            <img src={squadra.logo} alt={squadra.name} title={squadra.name} />
          </div>
        ))}
      </div>
      {isSidebarExpanded && selectedSquadra && (
        <div className="team-details">
          <h3>{selectedSquadra.name}</h3>
          <div className="team-info">
            <p><FontAwesomeIcon icon={faUser} /> Partecipante: {getParticipantName(selectedSquadra)}</p>
            <p><FontAwesomeIcon icon={faCoins} /> Crediti rimanenti: {remainingCredits}</p>
            <p><FontAwesomeIcon icon={faFutbol} /> Giocatori: {Object.values(selectedSquadra.players || {}).flat().length}</p>
          </div>
          <h4>Rosa:</h4>
          {renderPlayers(selectedSquadra.players)}
        </div>
      )}
    </div>
  );
};

export default React.memo(Sidebar);