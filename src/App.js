import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import CreateAuction from './components/CreateAuction';
import AuctionList from './components/AuctionList';
import PrivateRoute from './components/PrivateRoute';
import CreaAsta from './components/CreaAsta';
import SalaAttesa from './components/SalaAttesa';
import AsteInAttesa from './components/AsteInAttesa';
import { useAuth } from './hooks/useAuth';
import AstaInCorso from './components/AstaInCorso';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-auction" element={<CreateAuction />} />
          <Route path="/auction-list" element={<AuctionList />} />
          <Route path="/crea-asta" element={<CreaAsta />} />
          <Route path="/sala-attesa/:id" element={<SalaAttesa />} />
          <Route path="/aste-in-attesa" element={<AsteInAttesa />} />
          <Route path="/asta-in-corso/:id" element={<AstaInCorso />} /> 
        </Route>
      </Routes>
    </div>
  );
}

export default App;