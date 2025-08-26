import React from 'react';
import { useCreaAsta } from '../../hooks/useCreaAsta';
import '../../styles/CreaAsta.css';

const CreaAsta = () => {
  const {
    opzioniAsta,
    error,
    isLoading,
    isSubmitting,
    leghe,
    handleChange,
    handleSubmit
  } = useCreaAsta();

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="crea-asta-container">
      <div className="stars"></div>
      <div className="crea-asta-content">
        <div className="crea-asta-card">
          <div className="crea-asta-header">
            <h2>Crea una Nuova Asta</h2>
          </div>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="crea-asta-form">
            <div className="form-group">
              <label>Lega:</label>
              <select
                name="legaId"
                value={opzioniAsta.legaId}
                onChange={handleChange}
                required
              >
                <option value="">Seleziona una lega</option>
                {leghe.map((lega) => (
                  <option key={lega.id} value={lega.id}>
                    {lega.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Crediti:</label>
              <select
                name="crediti"
                value={opzioniAsta.crediti}
                onChange={handleChange}
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
                <option value="800">800</option>
                <option value="1000">1000</option>
              </select>
            </div>
            <div className="form-group">
              <label>Base d'asta:</label>
              <select
                name="baseAsta"
                value={opzioniAsta.baseAsta}
                onChange={handleChange}
              >
                <option value="quotazione">Quotazione Calciatore</option>
                <option value="1">Da 0</option>
              </select>
            </div>
            <div className="form-group">
              <label>Timebank:</label>
              <select
                name="timebank"
                value={opzioniAsta.timebank}
                onChange={handleChange}
              >
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="30">30</option>
              </select>
            </div>
            <div className="form-group">
              <label>Chiamata:</label>
              <select
                name="chiamata"
                value={opzioniAsta.chiamata}
                onChange={handleChange}
              >
                <option value="reparto">Per Reparto</option>
                <option value="libera">Libera</option>
              </select>
            </div>
            <div className="form-group">
              <label>Numero Partecipanti:</label>
              <select
                name="numeroPartecipanti"
                value={opzioniAsta.numeroPartecipanti}
                onChange={handleChange}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
            <button type="submit" className="crea-asta-button" disabled={isSubmitting}>
              {isSubmitting ? 'Creazione in corso...' : 'Crea Asta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreaAsta);