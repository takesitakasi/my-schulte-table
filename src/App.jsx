import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // --- 設定用の状態 ---
  const [gridSize, setGridSize] = useState(5); 
  const [isHardMode, setIsHardMode] = useState(false);

  // --- ゲームの状態 ---
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing' | 'finished'
  const [grid, setGrid] = useState([]);
  const [currentNum, setCurrentNum] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [time, setTime] = useState(null);

  // --- ハイスコア管理 (オブジェクトで管理) ---
  // 例: { "5-normal": "10.00", "5-hard": "15.00" } という形式で保存
  const [bestScores, setBestScores] = useState({});

  // アプリ起動時にLocalStorageからスコアを読み込む
  useEffect(() => {
    const savedScores = localStorage.getItem('schulteBestScores');
    if (savedScores) {
      setBestScores(JSON.parse(savedScores));
    }
  }, []);

  // 現在の設定に基づいたキーを作成する関数 (例: "5-hard")
  const getCurrentKey = () => {
    return `${gridSize}-${isHardMode ? 'hard' : 'normal'}`;
  };

  // ゲーム開始
  const startGame = () => {
    const totalCells = gridSize * gridSize;
    const numbers = Array.from({ length: totalCells }, (_, i) => i + 1);

    // シャッフル
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    const newGrid = numbers.map(num => ({
      value: num,
      color: isHardMode ? getRandomColor() : '#fff'
    }));

    setGrid(newGrid);
    setCurrentNum(1);
    setStartTime(Date.now());
    setGameState('playing');
  };

  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 85%)`;
  };

  const handleClick = (num) => {
    if (gameState !== 'playing') return;

    if (num === currentNum) {
      if (num === gridSize * gridSize) {
        // ゲームクリア処理
        const endTime = Date.now();
        const clearTime = ((endTime - startTime) / 1000).toFixed(2);
        setTime(clearTime);
        setGameState('finished');
        
        // ベストスコア更新判定
        updateBestScore(clearTime);
      } else {
        setCurrentNum(prev => prev + 1);
      }
    }
  };

  // スコア保存ロジック
  const updateBestScore = (newTime) => {
    const key = getCurrentKey(); // 現在の設定のキーを取得
    const currentBest = bestScores[key];

    // まだ記録がない、または新記録の場合
    if (!currentBest || parseFloat(newTime) < parseFloat(currentBest)) {
      const newScores = { ...bestScores, [key]: newTime };
      setBestScores(newScores);
      // LocalStorageに永続保存
      localStorage.setItem('schulteBestScores', JSON.stringify(newScores));
    }
  };

  const backToMenu = () => {
    setGameState('menu');
  };

  // メニュー画面で表示するベストスコアを取得
  const currentSettingBest = bestScores[getCurrentKey()];

  return (
    <div className="container">
      <h1>Schulte Table</h1>

      {/* --- メニュー画面 --- */}
      {gameState === 'menu' && (
        <div className="menu">
          <div className="settings">
            <label>
              グリッドサイズ: 
              <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))}>
                <option value={3}>3 x 3</option>
                <option value={4}>4 x 4</option>
                <option value={5}>5 x 5</option>
                <option value={6}>6 x 6</option>
                <option value={7}>7 x 7</option>
              </select>
            </label>
            
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={isHardMode} 
                onChange={(e) => setIsHardMode(e.target.checked)} 
              />
              カラフルモード（妨害色）
            </label>
            
            {/* 現在の設定のベストスコアを表示 */}
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

      {/* --- プレイ画面 --- */}
      {gameState === 'playing' && (
        <>
          <div className="status-bar">
            Next: <strong>{currentNum}</strong>
          </div>
          
          <div 
            className="grid" 
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {grid.map((cell, index) => (
              <button
                key={index}
                className={`cell ${cell.value < currentNum ? 'clicked' : ''}`}
                style={{ backgroundColor: cell.value < currentNum ? '#eee' : cell.color }}
                onClick={() => handleClick(cell.value)}
                disabled={cell.value < currentNum}
              >
                {cell.value}
              </button>
            ))}
          </div>
        </>
      )}

      {/* --- 結果画面 --- */}
      {gameState === 'finished' && (
        <div className="result-screen">
          <h2 className="result-time">{time}s</h2>
          
          {/* 新記録かどうかの表示 */}
          {time === bestScores[getCurrentKey()] && (
            <p className="new-record">🎉 New Record! 🎉</p>
          )}
          
          <div className="button-group">
            <button className="restart-btn" onClick={startGame}>もう一度</button>
            <button className="menu-btn" onClick={backToMenu}>設定へ戻る</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;