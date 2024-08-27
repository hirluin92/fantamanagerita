import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTrophy, faChartLine, faFutbol, faPlus, faGavel } from '@fortawesome/free-solid-svg-icons';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [userTeams, setUserTeams] = useState([]);
  const [asteInCorso, setAsteInCorso] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const teamsQuery = query(collection(db, "teams"), where("userId", "==", user.uid));
        const teamsSnapshot = await getDocs(teamsQuery);
        const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserTeams(teams);

        const asteQuery = query(collection(db, "aste"), where("stato", "==", "in attesa"));
        const asteSnapshot = await getDocs(asteQuery);
        const aste = asteSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAsteInCorso(aste);

        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (!auth.currentUser) {
    return <div>Accesso negato. Per favore, effettua il login.</div>;
  }

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Benvenuto su Fantacalcio Manager, {auth.currentUser.email}</h1>
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2><FontAwesomeIcon icon={faUsers} /> Le tue Squadre</h2>
          {userTeams.length > 0 ? (
            <ul className="team-list">
              {userTeams.map(team => (
                <li key={team.id}>
                  <Link to={`/team/${team.id}`}>
                    <FontAwesomeIcon icon={faFutbol} /> {team.nome}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Non hai ancora creato nessuna squadra.</p>
          )}
          <Link to="/crea-squadra" className="dashboard-button">
            <FontAwesomeIcon icon={faPlus} /> Crea Nuova Squadra
          </Link>
        </div>
        <div className="dashboard-section">
          <h2><FontAwesomeIcon icon={faGavel} /> Aste</h2>
          <Link to="/crea-asta" className="dashboard-button">
            <FontAwesomeIcon icon={faPlus} /> Crea Nuova Asta
          </Link>
          <Link to="/aste-in-attesa" className="dashboard-button">
            Partecipa ad un'Asta
          </Link>
        </div>
        <div className="dashboard-section">
          <h2><FontAwesomeIcon icon={faTrophy} /> Leghe</h2>
          <Link to="/unisciti-lega" className="dashboard-button">Unisciti a una Lega</Link>
          <Link to="/crea-lega" className="dashboard-button">Crea una Lega</Link>
        </div>
        <div className="dashboard-section">
          <h2><FontAwesomeIcon icon={faChartLine} /> Statistiche Giocatori</h2>
          <Link to="/statistiche-giocatori" className="dashboard-button">Visualizza Statistiche Giocatori</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;