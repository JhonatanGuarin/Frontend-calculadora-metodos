import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import PuntoFijo from './components/metodos/PuntoFijo';
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
            {/* Rutas para futuros métodos */}
            <Route path="/metodos/biseccion" element={<div>Método de Bisección (Próximamente)</div>} />
            <Route path="/metodos/secante" element={<div>Método de la Secante (Próximamente)</div>} />
            <Route path="/metodos/newton-raphson" element={<div>Método de Newton-Raphson (Próximamente)</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;