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
