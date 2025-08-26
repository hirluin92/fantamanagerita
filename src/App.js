import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import ErrorBoundary from './components/common/ErrorBoundary';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Dashboard from './components/Dashboard';
import AuctionList from './components/asta/AuctionList';
import PrivateRoute from './components/PrivateRoute';
import CreaAsta from './components/asta/CreaAsta';
import SalaAttesa from './components/asta/SalaAttesa';
import AsteInAttesa from './components/asta/AsteInAttesa';
import AstaInCorso from './components/asta/AstaInCorso';
import ImportPlayers from './components/ImportPlayers';
import CreaSquadra from './components/CreaSquadra';
import CreateSociety from './components/CreateSociety';
import CreateLeague from './components/CreateLeague';
import ViewLeagues from './components/ViewLeagues';
import LeagueDraw from './components/asta/LeagueDraw'; 
import OrderSelection from './components/asta/OrderSelection'; 
import Countdown from './components/asta/Countdown'; 

import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <div className="App">
          <NavBar />
          <div className="dashboard-container">
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/crea-squadra" element={<CreaSquadra />} /> 
                <Route path="/countdown/:id" element={<Countdown />} />
                <Route path="/sorteggio-lega/:id" element={<LeagueDraw />} />
                <Route path="/order-selection/:id" element={<OrderSelection />} />
                <Route path="/auction-list" element={<AuctionList />} />
                <Route path="/crea-asta" element={<CreaAsta />} />
                <Route path="/sala-attesa/:id" element={<SalaAttesa />} />
                <Route path="/aste-in-attesa" element={<AsteInAttesa />} />
                <Route path="/asta-in-corso/:id" element={<AstaInCorso />} />
                <Route path="/import-players" element={<ImportPlayers />} />
                <Route path="/crea-societa" element={<CreateSociety />} />
                <Route path="/crea-lega" element={<CreateLeague />} />
                <Route path="/visualizza-leghe" element={<ViewLeagues />} />
              </Route>
            </Routes>
          </div>
        </div>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;