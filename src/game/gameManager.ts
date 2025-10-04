import {
  Board,
  BOARD_SIZE,
  Cell,
  Piece,
  Position,
  Turn,
  cloneBoard,
  createInitialBoard,
  getCellOwner,
  getPieceColor,
  isInsideBoard,
  WaitPiece,
} from './board';

export type SelectionState = {
  position: Position;
  availablePieceIndexes: number[];
  pieceIndex: number | null;
  validMoves: Position[];
};

const WAIT_SKIP_TURNS = 1;

export class GameManager {
  private constructor(
    public readonly board: Board,
    public readonly turn: Turn,
    public readonly selection: SelectionState | null,
    public readonly winner: Turn | null
  ) {}

  static create(initialBoard?: Board): GameManager {
    const board = initialBoard ? cloneBoard(initialBoard) : createInitialBoard();
    return new GameManager(board, 'WHITE', null, null);
  }

  static from(board: Board, turn: Turn, selection: SelectionState | null, winner: Turn | null) {
    return new GameManager(cloneBoard(board), turn, selection, winner);
  }

  static handleCellClick(manager: GameManager, position: Position): GameManager {
    if (manager.winner) {
      return manager;
    }

    const selection = manager.selection;
    if (selection && selection.pieceIndex !== null) {
      const isValidMove = selection.validMoves.some((move) => positionsEqual(move, position));
      if (isValidMove) {
        return this.moveTo(manager, position);
      }
    }

    if (selection && positionsEqual(selection.position, position)) {
      return this.deselect(manager);
    }

    return this.selectCell(manager, position);
  }

  static selectPiece(manager: GameManager, pieceIndex: number): GameManager {
    if (manager.winner || !manager.selection) {
      return manager;
    }

    const { board, selection, turn } = manager;
    const { position, availablePieceIndexes } = selection;
    if (!availablePieceIndexes.includes(pieceIndex)) {
      return manager;
    }

    const validMoves = computeValidMoves(board, position, pieceIndex, turn);
    const nextSelection: SelectionState = {
      position,
      availablePieceIndexes,
      pieceIndex,
      validMoves,
    };
    return new GameManager(manager.board, manager.turn, nextSelection, manager.winner);
  }

  private static selectCell(manager: GameManager, position: Position): GameManager {
    const { board, turn } = manager;
    const cell = board[position.row][position.column];
    if (!cell) {
      return this.deselect(manager);
    }

    const availablePieceIndexes = cell.base.reduce<number[]>((acc, piece, index) => {
      if (getPieceColor(piece) === turn) {
        acc.push(index);
      }
      return acc;
    }, []);

    if (availablePieceIndexes.length === 0) {
      return this.deselect(manager);
    }

    if (availablePieceIndexes.length === 1) {
      const pieceIndex = availablePieceIndexes[0];
      const validMoves = computeValidMoves(board, position, pieceIndex, turn);
      const selection: SelectionState = {
        position,
        availablePieceIndexes,
        pieceIndex,
        validMoves,
      };
      return new GameManager(board, turn, selection, manager.winner);
    }

    const selection: SelectionState = {
      position,
      availablePieceIndexes,
      pieceIndex: null,
      validMoves: [],
    };
    return new GameManager(board, turn, selection, manager.winner);
  }

  private static moveTo(manager: GameManager, destination: Position): GameManager {
    const selection = manager.selection;
    if (!selection || selection.pieceIndex === null) {
      return manager;
    }

    const source = selection.position;
    const pieceIndex = selection.pieceIndex;
    const boardCopy = cloneBoard(manager.board);
    const sourceCell = boardCopy[source.row][source.column];
    const movingPiece = sourceCell.base[pieceIndex];

    if (!movingPiece) {
      return this.deselect(manager);
    }

    const updatedSourceBase = sourceCell.base.filter((_, index) => index !== pieceIndex);
    let updatedSourceJail = [...sourceCell.jail];
    let updatedSourceWait = [...sourceCell.wait];

    if (updatedSourceBase.length === 0 && updatedSourceJail.length > 0) {
      updatedSourceWait = [
        ...updatedSourceWait,
        ...updatedSourceJail.map((piece) => createWaitPiece(piece)),
      ];
      updatedSourceJail = [];
    }

    boardCopy[source.row][source.column] = {
      base: updatedSourceBase,
      jail: updatedSourceJail,
      wait: updatedSourceWait,
    };

    const destinationCell = boardCopy[destination.row][destination.column];

    const friendlyBase = destinationCell.base.filter((piece) => getPieceColor(piece) === manager.turn);
    const enemyBase = destinationCell.base.filter((piece) => getPieceColor(piece) !== manager.turn);

    const friendlyWait = destinationCell.wait.filter(
      (entry) => getPieceColor(entry.piece) === manager.turn
    );
    const enemyWait = destinationCell.wait.filter(
      (entry) => getPieceColor(entry.piece) !== manager.turn
    );

    const friendlyPrisoners = destinationCell.jail.filter(
      (piece) => getPieceColor(piece) === manager.turn
    );
    const enemyPrisoners = destinationCell.jail.filter(
      (piece) => getPieceColor(piece) !== manager.turn
    );

    const capturedEnemyPieces = [
      ...enemyBase,
      ...enemyWait.map((entry) => entry.piece),
    ];

    const updatedDestinationCell: Cell = {
      base: [movingPiece, ...friendlyBase],
      jail: [...enemyPrisoners, ...capturedEnemyPieces],
      wait: [
        ...friendlyWait,
        ...friendlyPrisoners.map((piece) => createWaitPiece(piece)),
      ],
    };

    boardCopy[destination.row][destination.column] = updatedDestinationCell;

    const enemyKing = manager.turn === 'WHITE' ? 'BK' : 'WK';
    const didCaptureKing = updatedDestinationCell.jail.includes(enemyKing as Piece);

    const winner = didCaptureKing ? manager.turn : manager.winner;
    const nextTurn = didCaptureKing ? manager.turn : toggleTurn(manager.turn);

    progressWaitPieces(boardCopy, manager.turn, nextTurn);

    return new GameManager(boardCopy, nextTurn, null, winner);
  }

  private static deselect(manager: GameManager): GameManager {
    if (!manager.selection) {
      return manager;
    }
    return new GameManager(manager.board, manager.turn, null, manager.winner);
  }
}

const toggleTurn = (turn: Turn): Turn => (turn === 'WHITE' ? 'BLACK' : 'WHITE');

const positionsEqual = (a: Position, b: Position): boolean => a.row === b.row && a.column === b.column;

const computeValidMoves = (board: Board, position: Position, pieceIndex: number, turn: Turn): Position[] => {
  const cell = board[position.row][position.column];
  const piece = cell.base[pieceIndex];
  if (!piece) {
    return [];
  }

  const pieceType = piece.charAt(1);
  switch (pieceType) {
    case 'K':
      return computeKingMoves(board, position, turn);
    case 'R':
      return computeSlidingMoves(board, position, turn, [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]);
    case 'B':
      return computeSlidingMoves(board, position, turn, [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]);
    case 'N':
      return computeKnightMoves(board, position, turn);
    default:
      return [];
  }
};

const computeKingMoves = (board: Board, position: Position, turn: Turn): Position[] => {
  const moves: Position[] = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) {
        continue;
      }
      const row = position.row + dr;
      const column = position.column + dc;
      if (!isInsideBoard(row, column)) {
        continue;
      }
      const cell = board[row][column];
      const owner = getCellOwner(cell);
      if (owner === turn) {
        continue;
      }
      moves.push({ row, column });
    }
  }
  return moves;
};

const computeKnightMoves = (board: Board, position: Position, turn: Turn): Position[] => {
  const moves: Position[] = [];
  const candidates = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];

  for (const [dr, dc] of candidates) {
    const row = position.row + dr;
    const column = position.column + dc;
    if (!isInsideBoard(row, column)) {
      continue;
    }
    const cell = board[row][column];
    const owner = getCellOwner(cell);
    if (owner === turn) {
      continue;
    }
    moves.push({ row, column });
  }
  return moves;
};

const computeSlidingMoves = (
  board: Board,
  position: Position,
  turn: Turn,
  directions: Array<[number, number]>
): Position[] => {
  const moves: Position[] = [];

  for (const [dr, dc] of directions) {
    let row = position.row + dr;
    let column = position.column + dc;

    while (isInsideBoard(row, column)) {
      const cell = board[row][column];
      const owner = getCellOwner(cell);

      if (owner === turn) {
        break;
      }

      moves.push({ row, column });

      if (owner && owner !== turn) {
        break;
      }

      row += dr;
      column += dc;
    }
  }

  return moves;
};

const createWaitPiece = (piece: Piece): WaitPiece => ({
  piece,
  remainingSkips: WAIT_SKIP_TURNS,
});

const progressWaitPieces = (board: Board, currentPlayer: Turn, nextPlayer: Turn): void => {
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const cell = board[row][column];
      if (cell.wait.length === 0) {
        continue;
      }

      const stillWaiting: WaitPiece[] = [];
      const readyPieces: Piece[] = [];

      for (const entry of cell.wait) {
        const owner = getPieceColor(entry.piece);
        if (owner === currentPlayer && entry.remainingSkips <= 0) {
          readyPieces.push(entry.piece);
        } else {
          stillWaiting.push(entry);
        }
      }

      const decrementedWait = stillWaiting.map((entry) => {
        const owner = getPieceColor(entry.piece);
        if (owner === nextPlayer) {
          return {
            piece: entry.piece,
            remainingSkips: Math.max(entry.remainingSkips - 1, 0),
          };
        }
        return entry;
      });

      cell.base = [...cell.base, ...readyPieces];
      cell.wait = decrementedWait;
    }
  }
};
