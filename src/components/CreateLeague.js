import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faUpload } from '@fortawesome/free-solid-svg-icons';
import '../styles/CreateLeague.css';

const CreateLeague = () => {
  const [leagueName, setLeagueName] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        const logoRef = ref(storage, `league_logos/${auth.currentUser.uid}/${logo.name}`);
        await uploadBytes(logoRef, logo);
        logoUrl = await getDownloadURL(logoRef);
      }

      const leagueData = {
        name: leagueName,
        logo: logoUrl,
        createdBy: auth.currentUser.uid,
        createdAt: new Date()
      };

      await addDoc(collection(db, "leagues"), leagueData);

      alert('Lega creata con successo!');
      navigate('/dashboard');
    } catch (error) {
      console.error("Error creating league: ", error);
      alert('Si è verificato un errore durante la creazione della lega. Riprova più tardi.');
    }

    setLoading(false);
  };

  return (
    <div className="create-league-container">
      <div className="create-league-card">
        <h2>Crea Nuova Lega</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="leagueName">Nome Lega</label>
            <input
              type="text"
              id="leagueName"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              required
            />
          </div>
          <div className="file-upload-group">
            <label htmlFor="logo">Logo Lega</label>
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
              <FontAwesomeIcon icon={faSave} /> {loading ? 'Creazione in corso...' : 'Crea Lega'}
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

export default CreateLeague;