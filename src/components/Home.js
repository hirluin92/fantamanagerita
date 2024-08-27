import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol, faChartLine, faUsers, faTrophy } from '@fortawesome/free-solid-svg-icons';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <header className="home-header">
          <h1><FontAwesomeIcon icon={faFutbol} /> FantaManager</h1>
          <p>Costruisci la tua squadra dei sogni e domina la lega!</p>
        </header>
        <section className="home-features">
          <div className="feature">
            <FontAwesomeIcon icon={faUsers} className="feature-icon" />
            <h2>Crea la Tua Squadra</h2>
            <p>Seleziona i migliori giocatori e forma una squadra imbattibile</p>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faChartLine} className="feature-icon" />
            <h2>Analizza le Prestazioni</h2>
            <p>Monitora le statistiche dei giocatori e ottimizza la tua formazione</p>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faTrophy} className="feature-icon" />
            <h2>Vinci la Lega</h2>
            <p>Competi con altri manager e dimostra di essere il migliore</p>
          </div>
        </section>
        <section className="home-cta">
          <Link to="/signup" className="btn btn-primary">Inizia Ora</Link>
          <Link to="/login" className="btn btn-secondary">Accedi</Link>
        </section>
      </div>
    </div>
  );
};

export default Home;