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

export type WaitPiece = {
  piece: Piece;
  remainingSkips: number;
};

export type Wait = WaitPiece[];

export type Cell = {
  base: Base;
  jail: Jail;
  wait: Wait;
};

export type Board = Cell[][];

export type Position = {
  row: number;
  column: number;
};

export type Turn = 'WHITE' | 'BLACK';

export const createEmptyCell = (): Cell => ({ base: [], jail: [], wait: [] });

export const cloneCell = (cell: Cell): Cell => ({
  base: [...cell.base],
  jail: [...cell.jail],
  wait: cell.wait.map((entry) => ({ ...entry })),
});

export const cloneBoard = (board: Board): Board =>
  board.map((row) => row.map((cell) => cloneCell(cell)));

export const createInitialBoard = (playerColor: Turn = 'WHITE'): Board => {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => createEmptyCell())
  );

  if (playerColor === 'WHITE') {
    board[0][0] = { base: ['BR'], jail: [], wait: [] };
    board[0][1] = { base: ['BK'], jail: [], wait: [] };
    board[0][2] = { base: ['BN'], jail: [], wait: [] };
    board[0][3] = { base: ['BB'], jail: [], wait: [] };

    board[3][0] = { base: ['WB'], jail: [], wait: [] };
    board[3][1] = { base: ['WN'], jail: [], wait: [] };
    board[3][2] = { base: ['WK'], jail: [], wait: [] };
    board[3][3] = { base: ['WR'], jail: [], wait: [] };
  } else {
    board[0][0] = { base: ['WR'], jail: [], wait: [] };
    board[0][1] = { base: ['WK'], jail: [], wait: [] };
    board[0][2] = { base: ['WN'], jail: [], wait: [] };
    board[0][3] = { base: ['WB'], jail: [], wait: [] };

    board[3][0] = { base: ['BB'], jail: [], wait: [] };
    board[3][1] = { base: ['BN'], jail: [], wait: [] };
    board[3][2] = { base: ['BK'], jail: [], wait: [] };
    board[3][3] = { base: ['BR'], jail: [], wait: [] };
  }

  return board;
};

export const isInsideBoard = (row: number, column: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && column >= 0 && column < BOARD_SIZE;
};

export const getPieceColor = (piece: Piece): Turn => (piece.startsWith('W') ? 'WHITE' : 'BLACK');

export const getCellOwner = (cell: Cell): Turn | null => {
  if (cell.base.length > 0) {
    return getPieceColor(cell.base[0]);
  }
  if (cell.wait.length > 0) {
    return getPieceColor(cell.wait[0].piece);
  }
  return null;
};
