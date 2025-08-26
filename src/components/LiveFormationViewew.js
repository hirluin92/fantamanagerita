import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const LiveFormationViewer = ({ auctionId }) => {
  const [formation, setFormation] = useState({
    goalkeepers: [],
    defenders: [],
    midfielders: [],
    forwards: []
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !auctionId) return;

    const userFormationRef = collection(db, 'auctions', auctionId, 'formations');
    const q = query(userFormationRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const data = change.doc.data();
          setFormation(prevFormation => ({
            ...prevFormation,
            [data.position]: [...prevFormation[data.position], data]
          }));
        }
        if (change.type === "removed") {
          const data = change.doc.data();
          setFormation(prevFormation => ({
            ...prevFormation,
            [data.position]: prevFormation[data.position].filter(player => player.id !== data.id)
          }));
        }
      });
    });

    return () => unsubscribe();
  }, [user, auctionId]);

  const renderPlayers = (players) => {
    return players.map((player, index) => (
      <div key={index} className="player-card">
        <img src={player.image} alt={player.name} />
        <p>{player.name}</p>
        <p>{player.price} M</p>
      </div>
    ));
  };

  return (
    <div className="live-formation-viewer">
      <h3>La tua formazione</h3>
      <div className="formation-grid">
        <div className="goalkeepers">
          <h4>Portieri</h4>
          {renderPlayers(formation.goalkeepers)}
        </div>
        <div className="defenders">
          <h4>Difensori</h4>
          {renderPlayers(formation.defenders)}
        </div>
        <div className="midfielders">
          <h4>Centrocampisti</h4>
          {renderPlayers(formation.midfielders)}
        </div>
        <div className="forwards">
          <h4>Attaccanti</h4>
          {renderPlayers(formation.forwards)}
        </div>
      </div>
    </div>
  );
};

export default LiveFormationViewer;