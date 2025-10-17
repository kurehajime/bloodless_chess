import { Board, Piece, Turn, getPieceColor } from './board';
import { enumerateMoves, isInCheck, Move } from './rules';
import { composeBoardCacheKey } from './serialize';

const evaluationCache = new Map<string, number>();

export const resetEvaluationCache = (): void => {
  evaluationCache.clear();
};

type EvaluationOptions = {
  perspective: Turn;
  gentle?: boolean;
};

// コマ種別ごとの基本ポイント。チェスの一般的な価値を目安に採用。
const PIECE_VALUES: Record<string, number> = {
  R: 5,
  B: 2,
  N: 3,
};

export const evaluateBoard = (board: Board, options: EvaluationOptions): number => {
  const { perspective, gentle = false } = options;
  const cacheKey = `${composeBoardCacheKey(board, perspective)}|${gentle ? 'gentle' : 'standard'}`;
  const cached = evaluationCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const enemyTurn = perspective === 'WHITE' ? 'BLACK' : 'WHITE';

  // キングが捕縛されているなら詰みとして極端なスコアを返す。
  if (!gentle) {
    const isPerspectiveCheckmated = isKingCaptured(board, perspective);
    const isEnemyCheckmated = isKingCaptured(board, enemyTurn);

    if (isPerspectiveCheckmated) {
      evaluationCache.set(cacheKey, -10000);
      return -10000;
    }

    if (isEnemyCheckmated) {
      evaluationCache.set(cacheKey, 10000);
      return 10000;
    }
  }

  const baseScore = assessPieces(board, perspective);

  // 王手がかかっている場合は大幅に減点
  const perspectiveInCheck = isInCheck(board, perspective);
  const enemyInCheck = isInCheck(board, enemyTurn);

  let checkPenalty = 0;
  if (!gentle) {
    if (perspectiveInCheck) {
      checkPenalty -= 5;
    }
    if (enemyInCheck) {
      checkPenalty += 5;
    }
  }

  const perspectiveMoves = enumerateMoves(board, perspective);
  const enemyMoves = enumerateMoves(board, enemyTurn);

  if (!gentle) {
    if (perspectiveMoves.length === 0 && perspectiveInCheck) {
      evaluationCache.set(cacheKey, -10000);
      return -10000;
    }
    if (enemyMoves.length === 0 && enemyInCheck) {
      evaluationCache.set(cacheKey, 10000);
      return 10000;
    }
  }

  const kingSafety = gentle ? 0 : assessKingMobility(board, perspectiveMoves, enemyMoves);

  const total = baseScore + kingSafety + checkPenalty;
  evaluationCache.set(cacheKey, total);
  return total;
};

// Base/Waitにある駒数からスコアを算出する。
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

// キングが安全に移動できるマス数を評価。逃げ道が多いほどプラス。
const assessKingMobility = (
  board: Board,
  perspectiveMoves: Move[],
  enemyMoves: Move[]
): number => {
  const accessibleKingSquares = perspectiveMoves.filter((move) => {
    const piece = board[move.from.row][move.from.column].base[move.pieceIndex];
    return piece?.endsWith('K') ?? false;
  });

  const enemyControlSquares = new Set(enemyMoves.map((move) => `${move.to.row}-${move.to.column}`));

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
