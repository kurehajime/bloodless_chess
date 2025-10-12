import { Board, Turn } from '../game/board';
import { Move, enumerateMoves, resolveMove, isInCheck } from '../game/rules';
import { evaluateBoard, resetEvaluationCache } from '../game/evaluator';
import { serializeBoard } from '../game/serialize';

export type SearchOptions = {
  depth: number;
  perspective: Turn;
};

export type SearchResult = {
  move: Move | null;
  score: number;
  nodes: number;
};

const transpositionTable = new Map<string, NegamaxResult>();

const composeNegamaxKey = (
  board: Board,
  turn: Turn,
  depth: number,
  perspective: Turn,
  winner: Winner
): string => {
  const winnerKey = winner ?? 'NONE';
  return `${serializeBoard(board)}|${turn}|${depth}|${perspective}|${winnerKey}`;
};

const resetTranspositionTable = (): void => {
  transpositionTable.clear();
};

export class GameAI {
  // AlphaBeta(negamax)で最善手を探索する入口。UI側はここだけ呼べば良い。
  static decide(board: Board, turn: Turn, options: SearchOptions): SearchResult {
    const { depth, perspective } = options;
    resetEvaluationCache();
    resetTranspositionTable();
    const { score, move, nodes } = negamax(board, turn, depth, perspective, null, -Infinity, Infinity);
    return {
      move: move ?? null,
      score,
      nodes,
    };
  }
}

type NegamaxResult = {
  score: number;
  move?: Move;
  nodes: number;
};

type Winner = Turn | null;

// negamax本体。alpha-beta枝刈りで高速化しつつ評価値を再帰的に算出する。
const negamax = (
  board: Board,
  turn: Turn,
  depth: number,
  perspective: Turn,
  winner: Winner,
  alpha: number,
  beta: number
): NegamaxResult => {
  const cacheKey = composeNegamaxKey(board, turn, depth, perspective, winner);
  if (depth > 0) {
    const cached = transpositionTable.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  let nodes = 1;

  if (winner) {
    const score = winner === perspective ? 10000 : -10000;
    const result = { score, nodes };
    if (depth > 0) {
      transpositionTable.set(cacheKey, result);
    }
    return result;
  }

  if (depth === 0) {
    // 葉ノードでは評価関数のみでスコアを返す。
    const score = evaluateBoard(board, turn, { perspective });
    const result = { score, nodes };
    if (depth > 0) {
      transpositionTable.set(cacheKey, result);
    }
    return result;
  }

  let moves = enumerateMoves(board, turn);

  // 王手がかかっている場合は、王手を回避しない手を除外する
  const inCheck = isInCheck(board, turn);
  if (inCheck) {
    moves = moves.filter((move) => {
      const result = resolveMove(board, turn, winner, move);
      // 相手の王を取って勝つ手は常に合法
      if (result.winner === turn) {
        return true;
      }
      // この手を指した後も王手が続くなら違法手として除外
      return !isInCheck(result.board, turn);
    });
  }

  if (moves.length === 0) {
    const score = evaluateBoard(board, turn, { perspective });
    const result = { score, nodes };
    transpositionTable.set(cacheKey, result);
    return result;
  }

  let bestScore = -Infinity;
  let bestMove: Move | undefined;
  let localAlpha = alpha;

  for (const move of moves) {
    const result = resolveMove(board, turn, winner, move);
    if (result.winner) {
      // この手で勝敗が確定する場合は、現在の手番から見た評価を基準にし、
      // root視点（perspective）へ変換して即座に採用する。
      const winnerScoreFromCurrent = result.winner === turn ? 10000 : -10000;
      const scoreForPerspective = turn === perspective ? winnerScoreFromCurrent : -winnerScoreFromCurrent;
      if (scoreForPerspective > bestScore) {
        bestScore = scoreForPerspective;
        bestMove = move;
      }
      nodes += 1;
      localAlpha = Math.max(localAlpha, scoreForPerspective);
      if (localAlpha >= beta) {
        break;
      }
      continue;
    }

    // 相手の応手で即座に自分のキングが捕縛されるなら、大きく減点して避ける。
    const opponent = result.turn;
    const opponentMoves = enumerateMoves(result.board, opponent);
    let immediateLoss = false;
    for (const counter of opponentMoves) {
      const counterResult = resolveMove(result.board, opponent, result.winner, counter);
      if (counterResult.winner === opponent) {
        immediateLoss = true;
        break;
      }
    }

    if (immediateLoss) {
      const lossScoreCurrent = -9999;
      const scoreForPerspective = turn === perspective ? lossScoreCurrent : -lossScoreCurrent;
      if (scoreForPerspective > bestScore) {
        bestScore = scoreForPerspective;
        bestMove = move;
      }
      nodes += opponentMoves.length;
      localAlpha = Math.max(localAlpha, scoreForPerspective);
      if (localAlpha >= beta) {
        break;
      }
      continue;
    }

    const child = negamax(result.board, result.turn, depth - 1, perspective, result.winner, -beta, -localAlpha);
    nodes += child.nodes;
    const score = -child.score;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    localAlpha = Math.max(localAlpha, score);
    if (localAlpha >= beta) {
      break;
    }
  }

  const result = { score: bestScore, move: bestMove, nodes };
  transpositionTable.set(cacheKey, result);
  return result;
};
