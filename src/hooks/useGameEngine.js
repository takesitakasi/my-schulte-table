import { useState, useCallback } from 'react';

export function useGameEngine() {
  const [gameState, setGameState] = useState('menu');
  const [currentNum, setCurrentNum] = useState(1);
  const [grid, setGrid] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [time, setTime] = useState(null);
  
  const [config, setConfig] = useState({
    gridSize: 5,
    isHardMode: false,
    isDynamicGrid: false,
    alternatingMode: 'none', // 'none' | 'alphabet' | 'hiragana'
  });

  const updateConfig = useCallback((newConfig) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  // ひらがなの配列（五十音順）
  const hiragana = [
    'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ'
  ];

  const getDisplayValue = (index, mode) => {
    if (mode === 'none') return index;
    
    // 奇数番目は数字（1, 2, 3...）
    if (index % 2 === 1) return Math.ceil(index / 2);
    
    // 偶数番目は文字
    const charIndex = (index / 2) - 1;
    if (mode === 'alphabet') {
      return String.fromCharCode(64 + (charIndex + 1)); // A, B, C...
    } else if (mode === 'hiragana') {
      return hiragana[charIndex] || '?'; // あ, い, う...
    }
    return index;
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateGrid = useCallback((gridSize, mode, isHard) => {
    const totalCells = gridSize * gridSize;
    const items = Array.from({ length: totalCells }, (_, i) => ({
      value: getDisplayValue(i + 1, mode),
      order: i + 1,
      color: isHard ? `hsl(${Math.random() * 360}, 70%, 85%)` : '#fff'
    }));
    return shuffleArray(items);
  }, []);

  const startGame = useCallback(() => {
    setGrid(generateGrid(config.gridSize, config.alternatingMode, config.isHardMode));
    setCurrentNum(1);
    setStartTime(Date.now());
    setTime(null);
    setGameState('playing');
  }, [config, generateGrid]);

  const handleClick = useCallback((clickedOrder) => {
    if (gameState !== 'playing') return;

    if (clickedOrder === currentNum) {
      if (clickedOrder === config.gridSize * config.gridSize) {
        setTime(((Date.now() - startTime) / 1000).toFixed(2));
        setGameState('finished');
      } else {
        const nextNum = currentNum + 1;
        setCurrentNum(nextNum);
        if (config.isDynamicGrid) {
          setGrid(prev => shuffleArray(prev));
        }
      }
    }
  }, [gameState, currentNum, config, startTime]);

  return {
    gameState, currentNum, grid, time, config,
    updateConfig, startGame, resetToMenu: () => setGameState('menu'), 
    handleClick,
    getNextLabel: () => getDisplayValue(currentNum, config.alternatingMode)
  };
}