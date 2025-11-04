
import React from 'react';
import { Tetromino } from '../types';

type Props = {
  score: number;
  level: number;
  lines: number;
  nextTetromino: Tetromino | null;
};

const StatItem: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div className="bg-slate-800 p-4 rounded-lg shadow-inner text-center">
    <p className="text-sm font-medium text-slate-400">{label}</p>
    <p className="text-2xl font-bold text-white tracking-wider">{value}</p>
  </div>
);

const NextPiece: React.FC<{ tetromino: Tetromino | null }> = ({ tetromino }) => {
  const grid = Array(4).fill(0).map(() => Array(4).fill(0));
  if (tetromino) {
    tetromino.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          grid[y][x] = 1;
        }
      });
    });
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-inner flex flex-col items-center">
       <p className="text-sm font-medium text-slate-400 mb-2">NEXT</p>
       <div className="grid grid-cols-4 grid-rows-4 gap-px bg-slate-900 w-20 h-20">
         {grid.map((row, y) => 
            row.map((cell, x) => (
                <div key={`${y}-${x}`} className={`aspect-square ${cell ? tetromino?.color : 'bg-slate-800'}`} />
            ))
         )}
       </div>
    </div>
  )
}

const GameStats: React.FC<Props> = ({ score, level, lines, nextTetromino }) => {
  return (
    <div className="w-full md:w-64 flex flex-col gap-4 p-4 bg-slate-900 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center text-white mb-2">TETRIS</h2>
      <NextPiece tetromino={nextTetromino} />
      <StatItem label="SCORE" value={score} />
      <StatItem label="LEVEL" value={level} />
      <StatItem label="LINES" value={lines} />
    </div>
  );
};

export default GameStats;
