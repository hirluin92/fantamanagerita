import React from 'react';
import '../../styles/TeamSelection.css';

const TeamSelection = ({ 
  currentParticipant, 
  availableTeams, 
  selectedTeam, 
  onTeamSelect, 
  onConfirm, 
  getUserDisplayName 
}) => {
  return (
    <div className="team-selection">
      <h3 className="team-selection__title">
        {getUserDisplayName(currentParticipant)}, seleziona la tua squadra:
      </h3>
      {availableTeams.length === 0 ? (
        <p className="team-selection__no-teams">Nessuna squadra disponibile per questa lega.</p>
      ) : (
        <div className="team-selection__list">
          {availableTeams.map((team) => (
            <div
              key={team.id}
              className={`team-selection__item ${selectedTeam?.id === team.id ? 'selected' : ''}`}
              onClick={() => onTeamSelect(team)}
            >
              <div className="team-selection__logo-container">
                <img src={team.logo} alt={team.name} className="team-selection__logo" />
              </div>
              <span className="team-selection__name">{team.name}</span>
            </div>
          ))}
        </div>
      )}
      <button 
        onClick={onConfirm} 
        disabled={!selectedTeam || availableTeams.length === 0} 
        className="team-selection__confirm-btn"
      >
        Conferma Selezione
      </button>
    </div>
  );
};

export default React.memo(TeamSelection);