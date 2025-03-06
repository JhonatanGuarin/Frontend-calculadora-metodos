import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import PuntoFijo from './components/metodos/PuntoFijo';
import Biseccion from './components/metodos/Biseccion';
import NewtonRaphson from './components/metodos/NewtonRaphson';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/metodos/punto-fijo" element={<PuntoFijo />} />
            <Route path="/metodos/biseccion" element={<Biseccion />} />
            <Route path="/metodos/newton-raphson" element={<NewtonRaphson />} />
            {/* Rutas para futuros métodos */}
            <Route path="/metodos/secante" element={<div>Método de la Secante (Próximamente)</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;