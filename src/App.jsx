import { useState, useEffect } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import './App.css';

function App() {
  const {
    gameState,
    currentNum,
    grid,
    time,
    config,
    updateConfig,
    startGame,
    resetToMenu,
    handleClick,
    getNextLabel
  } = useGameEngine();

  const [bestScores, setBestScores] = useState({});

  useEffect(() => {
    const savedScores = localStorage.getItem('schulteBestScores');
    if (savedScores) setBestScores(JSON.parse(savedScores));
  }, []);

  const getCurrentKey = () => {
    return `${config.gridSize}-${config.isHardMode ? 'hard' : 'normal'}-${config.alternatingMode}-${config.isDynamicGrid ? 'dyn' : 'stat'}`;
  };

  useEffect(() => {
    if (gameState === 'finished' && time) {
      const key = getCurrentKey();
      const currentBest = bestScores[key];
      if (!currentBest || parseFloat(time) < parseFloat(currentBest)) {
        const newScores = { ...bestScores, [key]: time };
        setBestScores(newScores);
        localStorage.setItem('schulteBestScores', JSON.stringify(newScores));
      }
    }
  }, [gameState, time]);

  const currentSettingBest = bestScores[getCurrentKey()];

  return (
    <div className="container">
      <h1>Schulte Table</h1>

      {gameState === 'menu' && (
        <div className="menu">
          <div className="settings">
            <label>
              グリッドサイズ: 
              <select 
                value={config.gridSize} 
                onChange={(e) => updateConfig({ gridSize: Number(e.target.value) })}
              >
                {[3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} x {n}</option>)}
              </select>
            </label>
            
            <label>
              交互モード: 
              <select 
                value={config.alternatingMode} 
                onChange={(e) => updateConfig({ alternatingMode: e.target.value })}
              >
                <option value="none">なし（数字のみ）</option>
                <option value="alphabet">数字とアルファベット</option>
                <option value="hiragana">数字とひらがな</option>
              </select>
            </label>

            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={config.isHardMode} 
                onChange={(e) => updateConfig({ isHardMode: e.target.checked })} 
              />
              カラフルモード（妨害色）
            </label>

            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={config.isDynamicGrid} 
                onChange={(e) => updateConfig({ isDynamicGrid: e.target.checked })} 
              />
              動的グリッド（全シャッフル）
            </label>
            
            <div className="current-best">
              この設定のベスト: 
              <span className="best-time-value">
                {currentSettingBest ? `${currentSettingBest}s` : ' -- '}
              </span>
            </div>
          </div>
          <button className="start-btn" onClick={startGame}>START</button>
        </div>
      )}

      {gameState === 'playing' && (
        <>
          <div className="status-bar">
            Next: <strong>{getNextLabel()}</strong>
          </div>
          <div 
            className="grid" 
            style={{ 
              gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
              // 1マス80px + 隙間8px で最大幅を計算。これより画面が狭い場合は1fr（等分）で自動縮小される
              maxWidth: `calc(${config.gridSize} * 80px + ${config.gridSize - 1} * 8px)`
            }}
          >
            {grid.map((cell, index) => (
              <button
                key={`${cell.order}-${index}`}
                className={`cell ${cell.order < currentNum ? 'clicked' : ''}`}
                style={{ backgroundColor: cell.order < currentNum ? '#eee' : cell.color }}
                onClick={() => handleClick(cell.order)}
                disabled={cell.order < currentNum}
              >
                {cell.value}
              </button>
            ))}
          </div>
        </>
      )}

      {gameState === 'finished' && (
        <div className="result-screen">
          <h2 className="result-time">{time}s</h2>
          {time === bestScores[getCurrentKey()] && (
            <p className="new-record">🎉 New Record! 🎉</p>
          )}
          <div className="button-group">
            <button className="restart-btn" onClick={startGame}>もう一度</button>
            <button className="menu-btn" onClick={resetToMenu}>設定へ戻る</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;