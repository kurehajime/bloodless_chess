import {
  Board,
  BOARD_SIZE,
  Cell,
  Piece,
  Position,
  Turn,
  cloneBoard,
  getCellOwner,
  getPieceColor,
  isInsideBoard,
  WaitPiece,
} from './board';

export type Move = {
  from: Position;
  to: Position;
  pieceIndex: number;
};

export type ResolveMoveResult = {
  board: Board;
  turn: Turn;
  winner: Turn | null;
};

type ResolveMoveOptions = {
  skipCheckmateCheck?: boolean;
  skipLog?: boolean;
};

export const WAIT_SKIP_TURNS = 1;

const enumeratePseudoLegalMoves = (board: Board, turn: Turn): Move[] => {
  const moves: Move[] = [];
  board.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      cell.base.forEach((piece, pieceIndex) => {
        if (getPieceColor(piece) !== turn) {
          return;
        }
        const origin: Position = { row: rowIndex, column: columnIndex };
        const destinations = computeValidMoves(board, origin, pieceIndex, turn);
        destinations.forEach((destination) => {
          const move: Move = { from: origin, to: destination, pieceIndex };
          moves.push(move);
        });
      });
    });
  });
  return moves;
};

// 現在の手番で生成可能な全合法手を返す。
export const enumerateMoves = (board: Board, turn: Turn): Move[] => {
  return enumeratePseudoLegalMoves(board, turn).filter((move) => !doesMoveLeaveKingInCheck(board, turn, move));
};

export const getValidMovesForPiece = (
  board: Board,
  position: Position,
  pieceIndex: number,
  turn: Turn
): Position[] => {
  return computeValidMoves(board, position, pieceIndex, turn).filter((destination) => {
    const move: Move = { from: position, to: destination, pieceIndex };
    return !doesMoveLeaveKingInCheck(board, turn, move);
  });
};

// Moveを適用した先の盤面と次手番、勝者を返す純粋関数。
export const resolveMove = (
  board: Board,
  turn: Turn,
  currentWinner: Turn | null,
  move: Move,
  options: ResolveMoveOptions = {}
): ResolveMoveResult => {
  const { skipCheckmateCheck = false, skipLog = false } = options;
  const boardCopy = cloneBoard(board);
  const sourceCell = boardCopy[move.from.row][move.from.column];
  const movingPiece = sourceCell.base[move.pieceIndex];

  if (!movingPiece) {
    return { board: boardCopy, turn, winner: currentWinner };
  }

  let updatedSourceBase = sourceCell.base.filter((_, index) => index !== move.pieceIndex);
  let updatedSourceJail = [...sourceCell.jail];
  let updatedSourceWait = sourceCell.wait.filter((entry) => getPieceColor(entry.piece) !== turn);

  // 移動元で監視駒がいなくなった場合、捕虜を解放してWaitに入れる
  if (updatedSourceBase.length === 0 && updatedSourceJail.length > 0) {
    const releasedPrisoners: WaitPiece[] = updatedSourceJail.map((piece) => ({
      piece,
      remainingSkips: WAIT_SKIP_TURNS,
    }));
    updatedSourceWait = [...updatedSourceWait, ...releasedPrisoners];
    updatedSourceJail = [];
  }

  boardCopy[move.from.row][move.from.column] = {
    base: updatedSourceBase,
    jail: updatedSourceJail,
    wait: updatedSourceWait,
  };

  const destinationCell = boardCopy[move.to.row][move.to.column];

  const friendlyBase = destinationCell.base.filter((piece) => getPieceColor(piece) === turn);
  const enemyBase = destinationCell.base.filter((piece) => getPieceColor(piece) !== turn);

  const friendlyWait: WaitPiece[] = [];
  const enemyWaitPieces: Piece[] = [];
  for (const entry of destinationCell.wait) {
    if (getPieceColor(entry.piece) === turn) {
      friendlyWait.push(entry);
    } else {
      enemyWaitPieces.push(entry.piece);
    }
  }

  const friendlyPrisoners = destinationCell.jail.filter((piece) => getPieceColor(piece) === turn);
  const enemyPrisoners = destinationCell.jail.filter((piece) => getPieceColor(piece) !== turn);

  const capturedEnemyPieces = [...enemyBase, ...enemyWaitPieces];

  // 敵のコマがいるマスに移動した場合は、捕虜をBaseに戻す（ルール11）
  // 敵のコマがいないマスに移動した場合は、捕虜をWaitに入れる（ルール10）
  const hasEnemyPieces = enemyBase.length > 0 || enemyWaitPieces.length > 0;
  let releasedToBase: Piece[] = [];
  let releasedToWait: WaitPiece[] = [];

  if (hasEnemyPieces) {
    // 敵コマがいる場合：捕虜を直接Baseへ
    releasedToBase = friendlyPrisoners;
  } else {
    // 敵コマがいない場合：捕虜をWaitへ
    releasedToWait = friendlyPrisoners.map((piece) => ({
      piece,
      remainingSkips: WAIT_SKIP_TURNS,
    }));
  }

  const updatedDestinationCell: Cell = {
    base: [movingPiece, ...friendlyBase, ...releasedToBase],
    jail: [...enemyPrisoners, ...capturedEnemyPieces],
    wait: [...friendlyWait, ...releasedToWait],
  };

  boardCopy[move.to.row][move.to.column] = updatedDestinationCell;

  const enemyKing = turn === 'WHITE' ? 'BK' : 'WK';
  const didCaptureKing = updatedDestinationCell.jail.includes(enemyKing as Piece);

  let winner = didCaptureKing ? turn : currentWinner;
  const nextTurn = didCaptureKing ? turn : toggleTurn(turn);

  progressWaitPieces(boardCopy, turn, nextTurn);

  if (!winner && !skipCheckmateCheck) {
    const nextPlayerMoves = enumerateMoves(boardCopy, nextTurn);
    if (nextPlayerMoves.length === 0 && isInCheck(boardCopy, nextTurn)) {
      winner = turn;
    }
  }

  if (!skipLog) {
    logBoard(boardCopy);
  }

  return { board: boardCopy, turn: nextTurn, winner };
};

const computeValidMoves = (
  board: Board,
  position: Position,
  pieceIndex: number,
  turn: Turn
): Position[] => {
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

const toggleTurn = (turn: Turn): Turn => (turn === 'WHITE' ? 'BLACK' : 'WHITE');

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

// 指定した手番のキングが王手（攻撃されている状態）かを判定する。
export const isInCheck = (board: Board, turn: Turn): boolean => {
  // 自分のキングの位置を探す
  const kingPiece = turn === 'WHITE' ? 'WK' : 'BK';
  let kingPosition: Position | null = null;

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const cell = board[row][column];
      if (cell.base.includes(kingPiece as Piece)) {
        kingPosition = { row, column };
        break;
      }
      // Wait状態のキングも考慮
      if (cell.wait.some((entry) => entry.piece === kingPiece)) {
        kingPosition = { row, column };
        break;
      }
    }
    if (kingPosition) break;
  }

  // キングが見つからない（捕虜になっている）場合は王手ではない（既に詰み）
  if (!kingPosition) {
    return false;
  }

  // 相手のすべての合法手を列挙し、キングの位置が含まれているかチェック
  const enemyTurn = turn === 'WHITE' ? 'BLACK' : 'WHITE';
  const enemyMoves = enumeratePseudoLegalMoves(board, enemyTurn);

  for (const move of enemyMoves) {
    if (move.to.row === kingPosition.row && move.to.column === kingPosition.column) {
      return true;
    }
  }

  return false;
};

function doesMoveLeaveKingInCheck(board: Board, turn: Turn, move: Move): boolean {
  const result = resolveMove(board, turn, null, move, { skipCheckmateCheck: true, skipLog: true });
  if (result.winner === turn) {
    return false;
  }
  return isInCheck(result.board, turn);
}

const logBoard = (board: Board): void => {
  const rows = board.map((row) => row.map((cell) => cell.base.join('&')).join(','));
  // eslint-disable-next-line no-console
  console.log(rows.join('\n'));
};
