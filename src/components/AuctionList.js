import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      const querySnapshot = await getDocs(collection(db, 'auctions'));
      const auctionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAuctions(auctionsData);
    };

    fetchAuctions();
  }, []);

  return (
    <div>
      <h2>Elenco Aste</h2>
      <ul>
        {auctions.map(auction => (
          <li key={auction.id}>
            {auction.name} - Budget: {auction.budget}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AuctionList;
