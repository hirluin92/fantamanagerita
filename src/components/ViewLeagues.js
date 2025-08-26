import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db, storage } from '../firebaseConfig';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUsers, faArrowLeft, faEdit, faSave, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../styles/ViewLeagues.css';

const ViewLeagues = () => {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLeague, setEditingLeague] = useState(null);
  const [editingSociety, setEditingSociety] = useState(null);
  const [newLogo, setNewLogo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const leaguesCollection = collection(db, 'leagues');
      const leaguesSnapshot = await getDocs(leaguesCollection);
      const leaguesList = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeagues(leaguesList);
    } catch (error) {
      console.error("Error fetching leagues: ", error);
      setError("Impossibile caricare le leghe. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueClick = async (league) => {
    setSelectedLeague(league);
    setSocieties([]);
    setLoading(true);
    try {
      const societiesQuery = query(collection(db, 'societies'), where('leagueId', '==', league.id));
      const societiesSnapshot = await getDocs(societiesQuery);
      const societiesList = societiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSocieties(societiesList);
    } catch (error) {
      console.error("Error fetching societies: ", error);
      setError("Impossibile caricare le società. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditLeague = (league) => {
    setEditingLeague({ ...league });
  };

  const handleEditSociety = (society) => {
    setEditingSociety({ ...society });
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setNewLogo(e.target.files[0]);
    }
  };

  const handleSaveLeague = async () => {
    try {
      setLoading(true);
      let logoUrl = editingLeague.logo;
      if (newLogo) {
        const logoRef = ref(storage, `league_logos/${editingLeague.id}/${newLogo.name}`);
        await uploadBytes(logoRef, newLogo);
        logoUrl = await getDownloadURL(logoRef);
      }
      
      await updateDoc(doc(db, "leagues", editingLeague.id), {
        name: editingLeague.name,
        logo: logoUrl
      });
      
      setLeagues(leagues.map(league => 
        league.id === editingLeague.id ? { ...league, name: editingLeague.name, logo: logoUrl } : league
      ));
      setEditingLeague(null);
      setNewLogo(null);
    } catch (error) {
      console.error("Error updating league: ", error);
      setError("Impossibile aggiornare la lega. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSociety = async () => {
    try {
      setLoading(true);
      let logoUrl = editingSociety.logo;
      if (newLogo) {
        const logoRef = ref(storage, `society_logos/${editingSociety.id}/${newLogo.name}`);
        await uploadBytes(logoRef, newLogo);
        logoUrl = await getDownloadURL(logoRef);
      }
      
      await updateDoc(doc(db, "societies", editingSociety.id), {
        name: editingSociety.name,
        logo: logoUrl
      });
      
      setSocieties(societies.map(society => 
        society.id === editingSociety.id ? { ...society, name: editingSociety.name, logo: logoUrl } : society
      ));
      setEditingSociety(null);
      setNewLogo(null);
    } catch (error) {
      console.error("Error updating society: ", error);
      setError("Impossibile aggiornare la società. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeague = async (league) => {
    if (confirmDelete !== league.id) {
      setConfirmDelete(league.id);
      return;
    }

    try {
      setLoading(true);
      
      const societiesQuery = query(collection(db, 'societies'), where('leagueId', '==', league.id));
      const societiesSnapshot = await getDocs(societiesQuery);
      
      await Promise.all(societiesSnapshot.docs.map(async (doc) => {
        if (doc.data().logo) {
          const logoRef = ref(storage, `society_logos/${doc.id}/${doc.data().logo}`);
          await deleteObject(logoRef);
        }
        await deleteDoc(doc.ref);
      }));

      if (league.logo) {
        const logoRef = ref(storage, `league_logos/${league.id}/${league.logo}`);
        await deleteObject(logoRef);
      }

      await deleteDoc(doc(db, "leagues", league.id));
      
      setLeagues(leagues.filter(l => l.id !== league.id));
      if (selectedLeague && selectedLeague.id === league.id) {
        setSelectedLeague(null);
        setSocieties([]);
      }
    } catch (error) {
      console.error("Error deleting league: ", error);
      setError("Impossibile eliminare la lega. Riprova più tardi.");
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  const handleDeleteSociety = async (society) => {
    if (confirmDelete !== society.id) {
      setConfirmDelete(society.id);
      return;
    }

    try {
      setLoading(true);
      
      if (society.logo) {
        const logoRef = ref(storage, `society_logos/${society.id}/${society.logo}`);
        await deleteObject(logoRef);
      }

      await deleteDoc(doc(db, "societies", society.id));
      
      setSocieties(societies.filter(s => s.id !== society.id));
    } catch (error) {
      console.error("Error deleting society: ", error);
      setError("Impossibile eliminare la società. Riprova più tardi.");
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

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

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [loading]);

  if (loading && !selectedLeague) {
    return <div className="loading">Caricamento...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="view-leagues-container" ref={containerRef}>
      <div className="stars"></div>
      <h1><FontAwesomeIcon icon={faBuilding} /> Leghe</h1>
      <div className="leagues-list">
        {leagues.map(league => (
          <div key={league.id} className={`league-item ${selectedLeague && selectedLeague.id === league.id ? 'selected' : ''}`}>
            <div onClick={() => handleLeagueClick(league)}>
              {league.logo && <img src={league.logo} alt="" className="league-logo" />}
              <div className="item-text">
                <span className="item-name">{league.name}</span>
                <span className="item-info">{league.teams || 0} squadre</span>
              </div>
            </div>
            <div className="item-actions">
              <button className="edit-button" onClick={() => handleEditLeague(league)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="delete-button" onClick={() => handleDeleteLeague(league)}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedLeague && (
        <div className="societies-container">
          <h2><FontAwesomeIcon icon={faUsers} /> Società in {selectedLeague.name}</h2>
          {loading ? (
            <div className="loading">Caricamento società...</div>
          ) : (
            <div className="societies-list">
              {societies.length > 0 ? (
                societies.map(society => (
                  <div key={society.id} className="society-item">
                    <div>
                      {society.logo && <img src={society.logo} alt="" className="society-logo" />}
                      <div className="item-text">
                        <span className="item-name">{society.name}</span>
                        <span className="item-info">{society.players || 0} giocatori</span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="edit-button" onClick={() => handleEditSociety(society)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="delete-button" onClick={() => handleDeleteSociety(society)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Nessuna società trovata per questa lega.</p>
              )}
            </div>
          )}
        </div>
      )}
      <Link to="/dashboard" className="back-button">
        <FontAwesomeIcon icon={faArrowLeft} /> Torna alla Dashboard
      </Link>

      {editingLeague && (
        <div className="modal">
          <div className="modal-content">
            <h2>Modifica Lega</h2>
            <input 
              type="text" 
              value={editingLeague.name} 
              onChange={(e) => setEditingLeague({...editingLeague, name: e.target.value})}
            />
            <input type="file" onChange={handleLogoChange} accept="image/*" />
            {editingLeague.logo && <img src={editingLeague.logo} alt="Logo attuale" className="current-logo" />}
            <div className="modal-actions">
              <button onClick={handleSaveLeague}><FontAwesomeIcon icon={faSave} /> Salva</button>
              <button onClick={() => setEditingLeague(null)}><FontAwesomeIcon icon={faTimes} /> Annulla</button>
            </div>
          </div>
        </div>
      )}

      {editingSociety && (
        <div className="modal">
          <div className="modal-content">
            <h2>Modifica Società</h2>
            <input 
              type="text" 
              value={editingSociety.name} 
              onChange={(e) => setEditingSociety({...editingSociety, name: e.target.value})}
            />
            <input type="file" onChange={handleLogoChange} accept="image/*" />
            {editingSociety.logo && <img src={editingSociety.logo} alt="Logo attuale" className="current-logo" />}
            <div className="modal-actions">
              <button onClick={handleSaveSociety}><FontAwesomeIcon icon={faSave} /> Salva</button>
              <button onClick={() => setEditingSociety(null)}><FontAwesomeIcon icon={faTimes} /> Annulla</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal">
          <div className="modal-content">
            <h2>Conferma Eliminazione</h2>
            <p>Sei sicuro di voler eliminare questo elemento?</p>
            <div className="modal-actions">
              <button onClick={() => setConfirmDelete(null)}><FontAwesomeIcon icon={faTimes} /> Annulla</button>
              <button onClick={() => {
                const itemToDelete = leagues.find(l => l.id === confirmDelete) || societies.find(s => s.id === confirmDelete);
                if (itemToDelete) {
                  if ('teams' in itemToDelete) {
                    handleDeleteLeague(itemToDelete);
                  } else {
                    handleDeleteSociety(itemToDelete);
                  }
                }
              }}><FontAwesomeIcon icon={faTrash} /> Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewLeagues;