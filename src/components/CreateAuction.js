import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const CreateAuction = () => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleCreateAuction = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'auctions'), {
        name,
        budget: parseInt(budget),
        createdAt: new Date()
      });
      setSuccess('Asta creata con successo!');
      setName('');
      setBudget('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Crea Asta</h2>
      <form onSubmit={handleCreateAuction}>
        <input
          type="text"
          placeholder="Nome Asta"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <button type="submit">Crea</button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>{success}</p>}
    </div>
  );
};

export default CreateAuction;
