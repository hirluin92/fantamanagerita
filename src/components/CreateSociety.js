import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc, query, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faUpload } from '@fortawesome/free-solid-svg-icons';
import '../styles/CreateSociety.css';

const CreateSociety = () => {
  const [societyName, setSocietyName] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeagues = async () => {
      const leaguesQuery = query(collection(db, "leagues"));
      const leaguesSnapshot = await getDocs(leaguesQuery);
      setLeagues(leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchLeagues();
  }, []);

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setLogo(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = '';
      if (logo) {
        const logoRef = ref(storage, `society_logos/${auth.currentUser.uid}/${logo.name}`);
        await uploadBytes(logoRef, logo);
        logoUrl = await getDownloadURL(logoRef);
      }

      const societyData = {
        name: societyName,
        logo: logoUrl,
        leagueId: selectedLeague,
        userId: auth.currentUser.uid,
        createdAt: new Date()
      };

      await addDoc(collection(db, "societies"), societyData);

      alert('Società creata con successo!');
      navigate('/dashboard');
    } catch (error) {
      console.error("Error creating society: ", error);
      alert('Si è verificato un errore durante la creazione della società. Riprova più tardi.');
    }

    setLoading(false);
  };

  return (
    <div className="create-society-container">
  <div className="create-society-card">
    <h2>Crea Nuova Società</h2>
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="societyName">Nome Società</label>
        <input
          type="text"
          id="societyName"
          value={societyName}
          onChange={(e) => setSocietyName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="league">Seleziona Lega</label>
        <select
          id="league"
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          required
        >
          <option value="">Seleziona una lega</option>
          {leagues.map(league => (
            <option key={league.id} value={league.id}>{league.name}</option>
          ))}
        </select>
      </div>
      <div className="file-upload-group">
        <label htmlFor="logo">Logo Società</label>
        <input
          type="file"
          id="logo"
          onChange={handleLogoChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <label htmlFor="logo" className="file-upload-label">
          <FontAwesomeIcon icon={faUpload} style={{marginRight: '10px'}} /> Carica Logo
        </label>
        {logoPreview && (
          <div className="logo-preview">
            <img src={logoPreview} alt="Logo preview" />
          </div>
        )}
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-primary">
          <FontAwesomeIcon icon={faSave} /> {loading ? 'Creazione in corso...' : 'Crea Società'}
        </button>
        <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
          <FontAwesomeIcon icon={faArrowLeft} /> Indietro
        </button>
      </div>
    </form>
  </div>
</div>
  );
};

export default CreateSociety;