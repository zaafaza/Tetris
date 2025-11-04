
export type TETROMINO_TYPE = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z';

export type CellValue = TETROMINO_TYPE | 0;

export type Cell = {
  value: CellValue;
  color: string;
  state: 'clear' | 'merged';
};

export type Board = Cell[][];

export type Tetromino = {
  shape: number[][];
  color: string;
  // FIX: Add a `type` property to the Tetromino to identify it. This will be used to correctly update the board state.
  type: TETROMINO_TYPE | 0;
};

export type Player = {
  pos: { x: number; y: number };
  tetromino: Tetromino;
  collided: boolean;
};
