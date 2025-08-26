import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ImportPlayers = () => {
  const [jsonData, setJsonData] = useState('');
  const [importStatus, setImportStatus] = useState('');

  const validatePlayer = (player) => {
    // Rimuovi campi vuoti o null
    const validPlayer = Object.entries(player).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Assicurati che ci sia almeno un campo valido
    return Object.keys(validPlayer).length > 0 ? validPlayer : null;
  };

  const handleImport = async () => {
    try {
      const players = JSON.parse(jsonData);
      setImportStatus('Importazione in corso...');
      
      let importedCount = 0;
      let skippedCount = 0;

      for (const player of players) {
        const validPlayer = validatePlayer(player);
        if (validPlayer) {
          await addDoc(collection(db, 'giocatori'), validPlayer);
          importedCount++;
        } else {
          skippedCount++;
        }
      }
      
      setImportStatus(`Importazione completata. Importati: ${importedCount}, Saltati: ${skippedCount}`);
    } catch (error) {
      setImportStatus(`Errore durante l'importazione: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Importa Giocatori</h2>
      <textarea
        value={jsonData}
        onChange={(e) => setJsonData(e.target.value)}
        placeholder="Incolla qui il JSON dei giocatori"
        rows={10}
        cols={50}
      />
      <br />
      <button onClick={handleImport}>Importa Giocatori</button>
      <p>{importStatus}</p>
    </div>
  );
};

export default ImportPlayers;