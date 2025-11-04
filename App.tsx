import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOS } from './constants';
import { Board as BoardType, Player, Tetromino, TETROMINO_TYPE } from './types';
import Board from './components/Board';

// Custom hook for game loop using setInterval
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      if(savedCallback.current) savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const createBoard = (): BoardType => Array.from(Array(BOARD_HEIGHT), () => 
    Array(BOARD_WIDTH).fill({ value: 0, color: 'bg-slate-800', state: 'clear' })
);

const StatItem: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div className="bg-slate-800 p-4 rounded-lg shadow-inner flex justify-between items-center">
    <p className="text-sm font-medium text-slate-400">{label}</p>
    <p className="text-2xl font-bold text-white tracking-wider">{value}</p>
  </div>
);

const NextPiece: React.FC<{ tetromino: Tetromino | null }> = ({ tetromino }) => {
  const grid = Array(4).fill(0).map(() => Array(4).fill(0));
  if (tetromino) {
    // Center the piece in the preview box
    const shape = tetromino.shape.filter(row => row.some(cell => cell !== 0));
    const yOffset = Math.floor((4 - shape.length) / 2);
    const xOffset = Math.floor((4 - (shape[0]?.length || 0)) / 2);

    shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          grid[y + yOffset][x + xOffset] = 1;
        }
      });
    });
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-inner flex flex-col items-center w-full">
       <p className="text-sm font-medium text-slate-400 mb-2">NEXT PIECE</p>
       <div className="grid grid-cols-4 grid-rows-4 gap-px bg-slate-900 w-24 h-24">
         {grid.map((row, y) => 
            row.map((cell, x) => (
                <div key={`${y}-${x}`} className={`aspect-square ${cell ? tetromino?.color : 'bg-slate-800'}`} />
            ))
         )}
       </div>
    </div>
  )
}

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardType>(createBoard());
  const [player, setPlayer] = useState<Player>({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0],
    collided: false,
  });
  const [nextTetromino, setNextTetromino] = useState<Tetromino | null>(null);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const getRandomTetromino = useCallback((): Tetromino => {
    const tetrominoTypes: TETROMINO_TYPE[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const randTetrominoType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
    return TETROMINOS[randTetrominoType];
  }, []);

  const resetPlayer = useCallback(() => {
    const newTetromino = nextTetromino || getRandomTetromino();
    const newNextTetromino = getRandomTetromino();

    setNextTetromino(newNextTetromino);
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
      tetromino: newTetromino,
      collided: false,
    });
  }, [getRandomTetromino, nextTetromino]);
  
  const checkCollision = useCallback((p: Player, b: BoardType, { moveX, moveY }: { moveX: number, moveY: number }): boolean => {
    for (let y = 0; y < p.tetromino.shape.length; y += 1) {
      for (let x = 0; x < p.tetromino.shape[y].length; x += 1) {
        if (p.tetromino.shape[y][x] !== 0) {
          const newY = y + p.pos.y + moveY;
          const newX = x + p.pos.x + moveX;
          if (
            newY >= BOARD_HEIGHT ||
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            (b[newY] && b[newY][newX] && b[newY][newX].state === 'merged')
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const startGame = useCallback(() => {
    setBoard(createBoard());
    setNextTetromino(getRandomTetromino());
    setPlayer({
      pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
      tetromino: getRandomTetromino(),
      collided: false,
    });
    setScore(0);
    setLines(0);
    setLevel(0);
    setDropTime(1000);
    setIsGameOver(false);
    setIsPaused(false);
    setGameActive(true);
    gameAreaRef.current?.focus();
  }, [getRandomTetromino]);

  useEffect(() => {
      if (!gameActive) return;
      
      const newLevel = Math.floor(lines / 10);
      if (newLevel > level) {
          setLevel(newLevel);
          setDropTime(1000 / (newLevel + 1) + 200);
      }
  }, [lines, level, gameActive]);

  const updatePlayerPos = ({ x, y, collided }: { x: number; y: number; collided: boolean }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) },
      collided,
    }));
  };

  const drop = useCallback(() => {
    if (!isPaused && !isGameOver && gameActive) {
      if (!checkCollision(player, board, { moveX: 0, moveY: 1 })) {
        updatePlayerPos({ x: 0, y: 1, collided: false });
      } else {
        if (player.pos.y < 1) {
          setIsGameOver(true);
          setDropTime(null);
          setGameActive(false);
        }
        updatePlayerPos({ x: 0, y: 0, collided: true });
      }
    }
  }, [player, board, isPaused, isGameOver, gameActive, checkCollision]);
  
  const hardDrop = useCallback(() => {
    if(isPaused || isGameOver || !gameActive) return;
    let newY = player.pos.y;
    while (!checkCollision(player, board, { moveX: 0, moveY: newY - player.pos.y + 1 })) {
        newY++;
    }
    setPlayer(prev => ({
      ...prev,
      pos: { ...prev.pos, y: newY },
      collided: true,
    }));
  }, [player, board, isPaused, isGameOver, gameActive, checkCollision]);

  const movePlayer = (dir: number) => {
    if (!checkCollision(player, board, { moveX: dir, moveY: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const rotate = (matrix: number[][]): number[][] => {
    const rotatedTetromino = matrix.map((_, index) => matrix.map(col => col[index]));
    return rotatedTetromino.map(row => row.reverse());
  };

  const playerRotate = () => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino.shape = rotate(clonedPlayer.tetromino.shape);

    let offset = 1;
    while(checkCollision(clonedPlayer, board, {moveX: 0, moveY: 0})) {
        clonedPlayer.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > clonedPlayer.tetromino.shape[0].length) {
            return; // Cannot rotate
        }
    }
    setPlayer(clonedPlayer);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!gameActive || isGameOver) return;

    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      e.preventDefault();
      setIsPaused(prev => !prev);
      return;
    }
    if (isPaused) return;
    
    if (e.key === 'ArrowLeft') movePlayer(-1);
    else if (e.key === 'ArrowRight') movePlayer(1);
    else if (e.key === 'ArrowDown') drop();
    else if (e.key === 'ArrowUp') playerRotate();
    else if (e.key === ' ') hardDrop();
  };

  useEffect(() => {
    if (!gameActive && !isGameOver) return;

    if (player.collided) {
        setBoard(prev => {
            const newBoard = JSON.parse(JSON.stringify(prev)) as BoardType;

            player.tetromino.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        newBoard[y + player.pos.y][x + player.pos.x] = {
                            value: player.tetromino.type,
                            color: player.tetromino.color,
                            state: 'merged',
                        };
                    }
                });
            });

            const points = [0, 40, 100, 300, 1200];
            let linesCleared = 0;
            const boardWithoutClearedLines = newBoard.filter(row => row.some(cell => cell.state === 'clear'));
            
            linesCleared = BOARD_HEIGHT - boardWithoutClearedLines.length;

            if (linesCleared > 0) {
                const newEmptyRows = Array.from(Array(linesCleared), () =>
                    Array(BOARD_WIDTH).fill({ value: 0, color: 'bg-slate-800', state: 'clear' })
                );
                setScore(prev => prev + points[linesCleared] * (level + 1));
                setLines(prev => prev + linesCleared);
                return [...newEmptyRows, ...boardWithoutClearedLines];
            }

            return newBoard;
        });
        resetPlayer();
    }
  }, [player.collided, resetPlayer, level, gameActive, isGameOver]);
  
  useInterval(() => {
    if (gameActive) {
      drop();
    }
  }, dropTime);
  
  const handleModalButtonClick = () => {
    if (isGameOver) {
      startGame();
    } else { // isPaused is true
      setIsPaused(false);
      gameAreaRef.current?.focus();
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-mono flex items-center justify-center p-8">
      <main className="flex flex-row gap-12 items-start">
        {/* Game Board Area */}
        <div
          className="relative bg-black rounded-lg shadow-2xl"
          ref={gameAreaRef}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          style={{
            height: '90vh',
            aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}`,
          }}
        >
          {gameActive || isGameOver ? (
            <div className="w-full h-full p-1 bg-slate-700 rounded-lg">
              <Board board={board} player={player} />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 rounded-lg">
               {/* This space is intentionally left blank before the game starts */}
            </div>
          )}
          
          {(isPaused || isGameOver) && (
            <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-10 rounded-lg">
              <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {isGameOver ? 'Game Over' : 'Paused'}
                </h2>
                <button
                  onClick={handleModalButtonClick}
                  className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  {isGameOver ? 'Play Again' : 'Resume'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-64 flex flex-col gap-6">
          <div>
            <h1 className="text-5xl font-extrabold text-white tracking-widest">TETRIS</h1>
          </div>
          
          <div className="flex flex-col gap-4">
            {gameActive || isGameOver ? (
              <>
                <NextPiece tetromino={nextTetromino} />
                <StatItem label="SCORE" value={score} />
                <StatItem label="LINES" value={lines} />
                <StatItem label="LEVEL" value={level} />
              </>
            ) : (
               <button
                  onClick={startGame}
                  className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 text-xl"
                >
                  Start Game
                </button>
            )}
          </div>

          <div className="mt-8 bg-slate-800/50 p-4 rounded-lg text-slate-400 text-sm">
            <h3 className="font-bold text-white mb-2">Controls</h3>
            <ul className="space-y-1">
              <li className="flex justify-between"><span>Move:</span> <span className="font-sans font-bold text-slate-200">← →</span></li>
              <li className="flex justify-between"><span>Soft Drop:</span> <span className="font-sans font-bold text-slate-200">↓</span></li>
              <li className="flex justify-between"><span>Rotate:</span> <span className="font-sans font-bold text-slate-200">↑</span></li>
              <li className="flex justify-between"><span>Hard Drop:</span> <span className="font-sans font-bold text-slate-200">SPACE</span></li>
              <li className="flex justify-between"><span>Pause:</span> <span className="font-sans font-bold text-slate-200">P / ESC</span></li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
