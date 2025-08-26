import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTrophy, faChartLine, faFutbol, faPlus, faGavel, faFileImport, faBuilding, faEye } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/logos/fantamanager.png';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [userTeams, setUserTeams] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  const containerRef = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        // Recupera il nome dell'utente da Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().displayName || `${userDoc.data().name} ${userDoc.data().surname}`);
        }

        const teamsQuery = query(collection(db, "teams"), where("userId", "==", user.uid));
        const teamsSnapshot = await getDocs(teamsQuery);
        setUserTeams(teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const userStatsDocRef = doc(db, "userStats", user.uid);
        const userStatsDocSnap = await getDoc(userStatsDocRef);
        if (userStatsDocSnap.exists()) {
          setUserStats(userStatsDocSnap.data());
        }

        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const createParticle = (x, y) => {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      document.body.appendChild(particle);

      const size = Math.random() * 5 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      particle.style.setProperty('--tx', `${Math.random() * 200 - 100}px`);
      particle.style.setProperty('--ty', `${Math.random() * 200 - 100}px`);
      particle.style.animation = `particleAnimation 1.5s ease-out forwards`;

      setTimeout(() => particle.remove(), 1500);
    };

    const handleMouseMove = (e) => createParticle(e.clientX, e.clientY);

    const handleMouseLeave = (section) => {
      section.style.transform = 'rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    document.addEventListener('mousemove', handleMouseMove);

    const currentSections = sectionsRef.current;
    currentSections.forEach(section => {
      if (section) {
        section.addEventListener('mousemove', (e) => {
          const { left, top, width, height } = section.getBoundingClientRect();
          const x = e.clientX - left;
          const y = e.clientY - top;

          const middleX = width / 2;
          const middleY = height / 2;
          const offsetX = ((x - middleX) / middleX) * 10;
          const offsetY = ((y - middleY) / middleY) * 10;

          section.style.transform = `rotateX(${-offsetY}deg) rotateY(${offsetX}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        section.addEventListener('mouseleave', () => handleMouseLeave(section));
      }
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      currentSections.forEach(section => {
        if (section) {
          section.removeEventListener('mousemove', handleMouseMove);
          section.removeEventListener('mouseleave', () => handleMouseLeave(section));
        }
      });
    };
  }, [loading]);

  if (!auth.currentUser) {
    return <div>Accesso negato. Per favore, effettua il login.</div>;
  }

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="dashboard-container" ref={containerRef}>
      <div className="stars"></div>
      <div className="container">
        <div className="dashboard-logo-container">
          <img src={logo} alt="FantaManager Logo" className="dashboard-logo" />
        </div>

        <h1>Benvenuto {userName}</h1>
        <h2>Gestisci la tua squadra, domina l'asta, e porta il tuo fantacalcio al livello successivo!</h2>

        <div className="dashboard-content">
          <div className="dashboard-section" ref={el => sectionsRef.current.push(el)}>
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
          <div className="dashboard-section" ref={el => sectionsRef.current.push(el)}>
            <h2><FontAwesomeIcon icon={faGavel} /> Aste</h2>
            <Link to="/crea-asta" className="dashboard-button">
              <FontAwesomeIcon icon={faPlus} /> Crea Nuova Asta
            </Link>
            <Link to="/aste-in-attesa" className="dashboard-button">
              Partecipa ad un'Asta
            </Link>
          </div>
          <div className="dashboard-section" ref={el => sectionsRef.current.push(el)}>
            <h2><FontAwesomeIcon icon={faTrophy} /> Le tue Statistiche</h2>
            {userStats ? (
              <div className="user-stats">
                <p>Punteggio totale: <span className="stat-value">{userStats.totalScore}</span></p>
                <p>Posizione: <span className="stat-value">{userStats.ranking}</span></p>
                <p>Miglior giocatore: {userStats.bestPlayer}</p>
              </div>
            ) : (
              <p>Nessuna statistica disponibile al momento.</p>
            )}
          </div>
          <div className="dashboard-section" ref={el => sectionsRef.current.push(el)}>
            <h2><FontAwesomeIcon icon={faChartLine} /> Statistiche Giocatori</h2>
            <Link to="/statistiche-giocatori" className="dashboard-button">Visualizza Statistiche</Link>
          </div>
          <div className="dashboard-section" ref={el => sectionsRef.current.push(el)}>
            <h2><FontAwesomeIcon icon={faFileImport} /> Importa Giocatori</h2>
            <Link to="/import-players" className="dashboard-button">
              <FontAwesomeIcon icon={faPlus} /> Importa Giocatori
            </Link>
          </div>
          <div className="dashboard-section" ref={el => sectionsRef.current.push(el)}>
            <h2><FontAwesomeIcon icon={faBuilding} /> Leghe</h2>
            <Link to="/crea-lega" className="dashboard-button">
              <FontAwesomeIcon icon={faPlus} /> Crea Nuova Lega
            </Link>
            <Link to="/visualizza-leghe" className="dashboard-button">
              <FontAwesomeIcon icon={faEye} /> Visualizza Leghe
            </Link>
          </div>
          <div className="dashboard-section" ref={el => sectionsRef.current.push(el)}>
            <h2><FontAwesomeIcon icon={faUsers} /> Società</h2>
            <Link to="/crea-societa" className="dashboard-button">
              <FontAwesomeIcon icon={faPlus} /> Crea Nuova Società
            </Link>
          </div>
          <div className="dashboard-section" ref={el => sectionsRef.current.push(el)}>
            <h2><FontAwesomeIcon icon={faUsers} /> Sorteggio</h2>
            <Link to="/sorteggio-lega" className="dashboard-button">
              <FontAwesomeIcon icon={faPlus} /> Crea Nuovo Sorteggio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
