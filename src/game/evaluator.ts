import { Board, Piece, Turn, getPieceColor } from './board';
import { enumerateMoves } from './rules';

type EvaluationOptions = {
  perspective: Turn;
};

const PIECE_VALUES: Record<string, number> = {
  R: 5,
  B: 2,
  N: 3,
};

export const evaluateBoard = (board: Board, turn: Turn, options: EvaluationOptions): number => {
  const { perspective } = options;
  const baseScore = assessPieces(board, perspective);
  const kingSafety = assessKingMobility(board, perspective);

  const enemyTurn = perspective === 'WHITE' ? 'BLACK' : 'WHITE';
  const perspectiveMoves = enumerateMoves(board, perspective);
  const enemyMoves = enumerateMoves(board, enemyTurn);

  const isPerspectiveCheckmated = perspectiveMoves.length === 0 && isKingCaptured(board, perspective);
  const isEnemyCheckmated = enemyMoves.length === 0 && isKingCaptured(board, enemyTurn);

  if (isPerspectiveCheckmated) {
    return -10000;
  }

  if (isEnemyCheckmated) {
    return 10000;
  }

  return baseScore + kingSafety;
};

const assessPieces = (board: Board, perspective: Turn): number => {
  let score = 0;

  board.forEach((row) => {
    row.forEach((cell) => {
      cell.base.forEach((piece) => {
        const value = getPieceValue(piece, perspective, 2);
        score += value;
      });

      cell.wait.forEach((entry) => {
        const value = getPieceValue(entry.piece, perspective, 1);
        score += value;
      });
    });
  });

  return score;
};

const assessKingMobility = (board: Board, perspective: Turn): number => {
  const enemyTurn = perspective === 'WHITE' ? 'BLACK' : 'WHITE';
  const perspectiveMoves = enumerateMoves(board, perspective);
  const accessibleKingSquares = perspectiveMoves.filter((move) => {
    const piece = board[move.from.row][move.from.column].base[move.pieceIndex];
    return piece?.endsWith('K') ?? false;
  });

  const enemyControlSquares = new Set(
    enumerateMoves(board, enemyTurn).map((move) => `${move.to.row}-${move.to.column}`)
  );

  let mobilityScore = 0;
  accessibleKingSquares.forEach((move) => {
    const key = `${move.to.row}-${move.to.column}`;
    if (!enemyControlSquares.has(key)) {
      mobilityScore += 1;
    }
  });

  return mobilityScore;
};

const getPieceValue = (piece: Piece, perspective: Turn, multiplier: number): number => {
  const isPerspectivePiece = getPieceColor(piece) === perspective;
  const rawValue = PIECE_VALUES[piece.charAt(1)] ?? 0;
  return isPerspectivePiece ? rawValue * multiplier : -rawValue * multiplier;
};

const isKingCaptured = (board: Board, perspective: Turn): boolean => {
  const kingCode = perspective === 'WHITE' ? 'WK' : 'BK';
  let foundOnBoardOrWait = false;
  let captured = false;

  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.base.includes(kingCode) || cell.wait.some((entry) => entry.piece === kingCode)) {
        foundOnBoardOrWait = true;
      }
      if (cell.jail.includes(kingCode)) {
        captured = true;
      }
    });
  });

  if (captured) {
    return true;
  }

  return !foundOnBoardOrWait;
};
