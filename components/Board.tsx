import React from 'react';
import { Board as BoardType, Player } from '../types';

type Props = {
  board: BoardType;
  player: Player;
};

const Board: React.FC<Props> = ({ board, player }) => {
  const displayBoard = JSON.parse(JSON.stringify(board)) as BoardType;

  player.tetromino.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardY = y + player.pos.y;
        const boardX = x + player.pos.x;
        if (boardY >= 0 && boardY < displayBoard.length && boardX >= 0 && boardX < displayBoard[0].length) {
            displayBoard[boardY][boardX] = {
                value: player.tetromino.type,
                color: player.tetromino.color,
                state: 'clear'
            };
        }
      }
    });
  });

  return (
    <div
      className="grid gap-px h-full"
      style={{
        gridTemplateRows: `repeat(${board.length}, 1fr)`,
        gridTemplateColumns: `repeat(${board[0].length}, 1fr)`,
      }}
    >
      {displayBoard.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`aspect-square ${cell.color} ${cell.value !== 0 ? 'border-t border-l border-white/20' : ''}`}
          />
        ))
      )}
    </div>
  );
};

export default Board;