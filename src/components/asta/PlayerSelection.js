import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayerSelection } from '../../hooks/usePlayerSelection';
import { debounce } from '../../utils/helpers';

const PlayerSelection = () => {
  const { id: astaId } = useParams();
  const { 
    filteredGiocatori,
    handleSearch,
    selectPlayer
  } = usePlayerSelection(astaId);

  const debouncedSearch = useCallback(
    (e) => {
      const value = e.target.value;
      debounce((searchValue) => handleSearch(searchValue), 300)(value);
    },
    [handleSearch]
  );

  // Mostra loading se non ci sono giocatori
  if (!filteredGiocatori || filteredGiocatori.length === 0) {
    return (
      <div className="player-selection">
        <div className="loading-giocatori">
          <p>Caricamento giocatori...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-selection">
      <input 
        type="text" 
        placeholder="Cerca giocatore" 
        onChange={debouncedSearch} 
      />
      <ul>
        {filteredGiocatori.map((giocatore) => (
          <li key={giocatore.id} onClick={() => selectPlayer(giocatore)}>
            {giocatore.Nome}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(PlayerSelection);