export const BOARD_SIZE = 4;

export type Piece =
  | 'BK'
  | 'BR'
  | 'BB'
  | 'BN'
  | 'WK'
  | 'WR'
  | 'WB'
  | 'WN';

export type Base = Piece[];
export type Jail = Piece[];

export type Cell = {
  base: Base;
  jail: Jail;
};

export type Board = Cell[][];

export type Position = {
  row: number;
  column: number;
};

export type Turn = 'WHITE' | 'BLACK';

export const createEmptyCell = (): Cell => ({ base: [], jail: [] });

export const cloneCell = (cell: Cell): Cell => ({
  base: [...cell.base],
  jail: [...cell.jail],
});

export const cloneBoard = (board: Board): Board =>
  board.map((row) => row.map((cell) => cloneCell(cell)));

export const createInitialBoard = (): Board => {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => createEmptyCell())
  );

  board[0][0] = { base: ['WB'], jail: [] };
  board[0][1] = { base: ['WN'], jail: [] };
  board[0][2] = { base: ['WK'], jail: [] };
  board[0][3] = { base: ['WR'], jail: [] };

  board[3][0] = { base: ['BR'], jail: [] };
  board[3][1] = { base: ['BK'], jail: [] };
  board[3][2] = { base: ['BN'], jail: [] };
  board[3][3] = { base: ['BB'], jail: [] };

  return board;
};

export const isInsideBoard = (row: number, column: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && column >= 0 && column < BOARD_SIZE;
};

export const getPieceColor = (piece: Piece): Turn => (piece.startsWith('W') ? 'WHITE' : 'BLACK');

export const getCellOwner = (cell: Cell): Turn | null => {
  if (cell.base.length === 0) {
    return null;
  }
  return getPieceColor(cell.base[0]);
};
