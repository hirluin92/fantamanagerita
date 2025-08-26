import React from 'react';
import '../../styles/ResultsList.css';

const ResultsList = ({ results, getUserDisplayName }) => {
  return (
    <div className="results-list">
      <h3 className="results-list__title">Risultati del sorteggio:</h3>
      <ul className="results-list__items">
        {results.map((result, index) => (
          <li key={index} className="results-list__item">
            <span className="results-list__participant">
              {getUserDisplayName(result.user)}:
            </span>
            <span className="results-list__team">
              {result.team.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(ResultsList);