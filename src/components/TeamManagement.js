import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import '../styles/TeamManagement.css';

const TeamManagement = () => {
  const [teamName, setTeamName] = useState('');
  const [userTeams, setUserTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserTeams();
  }, []);

  const fetchUserTeams = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, "teams"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const teams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserTeams(teams);
      }
    } catch (err) {
      setError("Errore nel caricamento delle squadre");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "teams"), {
          name: teamName,
          userId: user.uid,
          createdAt: new Date()
        });
        setTeamName('');
        fetchUserTeams(); // Aggiorna la lista delle squadre
      }
    } catch (err) {
      setError("Errore nella creazione della squadra");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-management-container">
      <h2>Gestione Squadre</h2>
      <form onSubmit={handleCreateTeam} className="create-team-form">
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Nome della squadra"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creazione...' : 'Crea Squadra'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      <div className="teams-list">
        <h3>Le tue squadre:</h3>
        {loading ? (
          <p>Caricamento squadre...</p>
        ) : userTeams.length > 0 ? (
          <ul>
            {userTeams.map(team => (
              <li key={team.id}>{team.name}</li>
            ))}
          </ul>
        ) : (
          <p>Non hai ancora creato nessuna squadra.</p>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;