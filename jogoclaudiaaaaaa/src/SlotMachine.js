import React, { useState, useRef } from 'react';
import './SlotMachine.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SlotMachine = () => {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
  const [result, setResult] = useState('');
  const [balanceHistory, setBalanceHistory] = useState([1000]);
  const [betCount, setBetCount] = useState(0);
  const [winAmount, setWinAmount] = useState(0);
  const [jackpotProbabilityHistory, setJackpotProbabilityHistory] = useState([0]);

  const spinIntervalRef = useRef(null);

  const symbols = [
    { symbol: '🍒', name: 'CEREJA', multiplier: 2, probability: 0.4 },
    { symbol: '🍋', name: 'LIMAO', multiplier: 3, probability: 0.3 },
    { symbol: '🍊', name: 'LARANJA', multiplier: 5, probability: 0.15 },
    { symbol: '🔔', name: 'SINO', multiplier: 10, probability: 0.1 },
    { symbol: '⭐', name: 'ESTRELA', multiplier: 20, probability: 0.04 },
    { symbol: '💎', name: 'DIAMANTE', multiplier: 50, probability: 0.01 }
  ];

  const calculateJackpotProbability = (spins) => {
    const singleJackpotProb = 0.01; // Probabilidade do diamante (jackpot)
    const threeJackpotsProb = singleJackpotProb * singleJackpotProb * singleJackpotProb;
    return (1 - Math.pow(1 - threeJackpotsProb, Math.max(1, spins))) * 100;
  };

  const getRandomSymbol = () => {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const sym of symbols) {
      cumulative += sym.probability;
      if (rand <= cumulative) {
        return sym;
      }
    }
    return symbols[0];
  };

  const calculateWinnings = (reelSymbols) => {
    const symbolNames = reelSymbols.map(symbol => {
      const found = symbols.find(s => s.symbol === symbol);
      return found ? found.name : symbol;
    });
    
    const [a, b, c] = symbolNames;
    
    // Três iguais
    if (a === b && b === c) {
      const symbol = symbols.find(s => s.name === a);
      return betAmount * symbol.multiplier;
    }
    
    // Dois iguais
    if (a === b || a === c || b === c) {
      return betAmount * 1.5;
    }
    
    return 0;
  };

  const spinReels = () => {
    if (betAmount <= 0 || betAmount > balance) {
      alert('Aposta inválida! Verifique o valor.');
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setResult('');
    setWinAmount(0);

    const newBalance = balance - betAmount;
    setBalance(newBalance);
    const newBetCount = betCount + 1;
    setBetCount(newBetCount);

    const jackpotProbability = calculateJackpotProbability(newBetCount);
    setJackpotProbabilityHistory(prev => [...prev, jackpotProbability]);

    const spinDuration = 2000;
    const spinInterval = 100;
    const spins = spinDuration / spinInterval;
    let currentSpin = 0;

    // Limpar intervalo anterior se existir
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
    }

    spinIntervalRef.current = setInterval(() => {
      const newReels = [
        getRandomSymbol().symbol,
        getRandomSymbol().symbol,
        getRandomSymbol().symbol
      ];
      setReels(newReels);
      currentSpin++;

      if (currentSpin >= spins) {
        clearInterval(spinIntervalRef.current);
        
        const finalReels = [
          getRandomSymbol().symbol,
          getRandomSymbol().symbol,
          getRandomSymbol().symbol
        ];
        setReels(finalReels);
        
        const winnings = calculateWinnings(finalReels);
        setWinAmount(winnings);
        
        setTimeout(() => {
          setIsSpinning(false);
          
          if (winnings > 0) {
            const finalBalance = newBalance + winnings;
            setBalance(finalBalance);
            setBalanceHistory(prev => [...prev, finalBalance]);
            setResult(`Você ganhou $${winnings}! 🎉`);
          } else {
            setBalanceHistory(prev => [...prev, newBalance]);
            setResult('Tente novamente!');
            
            if (newBalance === 0) {
              setTimeout(() => {
                alert('Você perdeu tudo! A casa sempre ganha. 💸');
              }, 500);
            }
          }
        }, 500);
      }
    }, spinInterval);
  };

  const BalanceChart = () => {
    const data = {
      labels: balanceHistory.map((_, index) => `Jogada ${index}`),
      datasets: [
        {
          label: 'Histórico do Saldo',
          data: balanceHistory,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          tension: 0.1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Evolução do Seu Saldo',
        },
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    return <Line data={data} options={options} />;
  };

  const JackpotProbabilityChart = () => {
    const data = {
      labels: jackpotProbabilityHistory.map((_, index) => `Jogada ${index}`),
      datasets: [
        {
          label: 'Chance de Jackpot Acumulada',
          data: jackpotProbabilityHistory,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          fill: true,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Probabilidade de Jackpot por Número de Jogadas',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Chance: ${context.parsed.y.toFixed(2)}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          },
          title: {
            display: true,
            text: 'Probabilidade'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Número de Jogadas'
          }
        }
      }
    };

    return <Line data={data} options={options} />;
  };

  const resetGame = () => {
    setBalance(1000);
    setBetAmount(10);
    setReels(['🍒', '🍒', '🍒']);
    setResult('');
    setBalanceHistory([1000]);
    setBetCount(0);
    setWinAmount(0);
    setJackpotProbabilityHistory([0]);
  };

  return (
    <div className="slot-machine-container">
      <div className="slot-main-content">
        <div className="slot-machine">
          <div className="reels-container">
            <div className={`reel ${isSpinning ? 'spinning' : ''}`}>
              <div className="reel-symbol">{reels[0]}</div>
            </div>
            <div className={`reel ${isSpinning ? 'spinning' : ''}`}>
              <div className="reel-symbol">{reels[1]}</div>
            </div>
            <div className={`reel ${isSpinning ? 'spinning' : ''}`}>
              <div className="reel-symbol">{reels[2]}</div>
            </div>
          </div>
          
          <div className="payline"></div>
          
          <div className="slot-controls">
            <div className="betting-panel">
              <h3>Faça sua aposta</h3>
              <input
                type="number"
                placeholder="Valor da aposta"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                min="1"
                max={balance}
                disabled={isSpinning}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  onClick={spinReels} 
                  disabled={isSpinning || betAmount <= 0 || betAmount > balance}
                  className="spin-button"
                >
                  {isSpinning ? '🎰 Girando...' : '🎰 GIRAR!'}
                </button>
                <button 
                  onClick={resetGame}
                  className="spin-button"
                  style={{ background: 'linear-gradient(145deg, #3498db, #2980b9)' }}
                >
                  🔄 Reiniciar
                </button>
              </div>
            </div>
            
            <div className="balance-info">
              <h3>Saldo: ${balance}</h3>
              {winAmount > 0 && (
                <div className="win-display">+${winAmount}</div>
              )}
            </div>
            
            {result && (
              <div className="result-message">
                {result}
              </div>
            )}

            <div className="probability-info" style={{ color: 'white', marginTop: '15px' }}>
              <h4>Chance de Jackpot: {calculateJackpotProbability(betCount).toFixed(2)}%</h4>
              <p>Após {betCount} jogadas</p>
            </div>
          </div>
        </div>

        <div className="probabilities-panel">
          <h4>Probabilidades de Pagamento</h4>
          <div className="probabilities-list">
            {symbols.map((sym, index) => (
              <div key={index} className="probability-item">
                <span className="symbol">{sym.symbol} {sym.name}</span>
                <span className="multiplier">{sym.multiplier}x</span>
                <span className="probability">{(sym.probability * 100).toFixed(1)}%</span>
              </div>
            ))}
            <div className="probability-item">
              <span className="symbol">🎰 DOIS IGUAIS</span>
              <span className="multiplier">1.5x</span>
              <span className="probability">~30%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="slot-chart-container">
        <div className="chart-section">
          <h4>Evolução do Saldo</h4>
          <BalanceChart />
        </div>
        
        <div className="chart-section">
          <h4>Probabilidade de Jackpot</h4>
          <JackpotProbabilityChart />
        </div>
        
        <div className="educational-note">
          <h4>📊 A Casa Sempre Ganha</h4>
          <p>
            Mesmo com vitórias ocasionais, as probabilidades estão matematicamente 
            a favor da casa. Quanto mais você joga, maior a chance de perder tudo!
          </p>
          <p>
            <strong>Probabilidade atual de jackpot:</strong> {calculateJackpotProbability(betCount).toFixed(2)}%
          </p>
          <p>
            <strong>Valor esperado por aposta:</strong> -5% a -15%
          </p>
          <p>
            <strong>Dica:</strong> Use valores baixos para jogar mais tempo e ver as probabilidades em ação!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
