
import { TETROMINO_TYPE } from './types';
import { Tetromino } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

type Tetrominos = {
  [key in TETROMINO_TYPE | 0]: Tetromino;
};

// FIX: Added the 'type' property to each tetromino to align with the updated Tetromino type.
export const TETROMINOS: Tetrominos = {
  0: { shape: [[0]], color: 'bg-transparent', type: 0 },
  I: {
    shape: [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    color: 'bg-cyan-500',
    type: 'I',
  },
  J: {
    shape: [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    color: 'bg-blue-500',
    type: 'J',
  },
  L: {
    shape: [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    color: 'bg-orange-500',
    type: 'L',
  },
  O: {
    shape: [[1, 1], [1, 1]],
    color: 'bg-yellow-500',
    type: 'O',
  },
  S: {
    shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    color: 'bg-green-500',
    type: 'S',
  },
  T: {
    shape: [[1, 1, 1], [0, 1, 0], [0, 0, 0]],
    color: 'bg-purple-500',
    type: 'T',
  },
  Z: {
    shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    color: 'bg-red-500',
    type: 'Z',
  },
};
