import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal (/) carrega o Login */}
        <Route path="/" element={<Login />} />
        
        {/* Rota interna (/dashboard) carrega a Raspadinha */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;