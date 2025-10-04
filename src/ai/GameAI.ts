import { Board, Turn } from '../game/board';
import { Move, enumerateMoves, resolveMove } from '../game/rules';
import { evaluateBoard } from '../game/evaluator';

export type SearchOptions = {
  depth: number;
  perspective: Turn;
};

export type SearchResult = {
  move: Move | null;
  score: number;
  nodes: number;
};

export class GameAI {
  // AlphaBeta(negamax)で最善手を探索する入口。UI側はここだけ呼べば良い。
  static decide(board: Board, turn: Turn, options: SearchOptions): SearchResult {
    const { depth, perspective } = options;
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
  let nodes = 1;

  if (winner) {
    const score = winner === perspective ? 10000 : -10000;
    return { score, nodes };
  }

  if (depth === 0) {
    // 葉ノードでは評価関数のみでスコアを返す。
    const score = evaluateBoard(board, turn, { perspective });
    return { score, nodes };
  }

  const moves = enumerateMoves(board, turn);
  if (moves.length === 0) {
    const score = evaluateBoard(board, turn, { perspective });
    return { score, nodes };
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

  return { score: bestScore, move: bestMove, nodes };
};
