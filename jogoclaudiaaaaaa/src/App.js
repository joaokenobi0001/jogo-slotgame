import React from 'react';
import SlotMachine from './SlotMachine';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1 className="header-text">A Casa Sempre Ganha - Slot Machine Educativa</h1>
        <p className="subtitle">Demonstração das probabilidades em jogos de azar</p>
      </header>
      
      <SlotMachine />
      
      <div className="footer">
        <p>Projeto educativo sobre probabilidade e estatística</p>
        <p>Desenvolvido com React</p>
      </div>
    </div>
  );
}

export default App;
export default App;
