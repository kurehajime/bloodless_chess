import { describe, expect, it } from 'vitest';

import { BOARD_SIZE, Board, Cell, Turn, createEmptyCell } from './board';
import { evaluateBoard } from './evaluator';
import { Move, enumerateMoves, isInCheck, resolveMove } from './rules';
import { serializeBoard } from './serialize';

const createBoard = (): Board =>
  Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => createEmptyCell()));

const cell = (base: Cell['base'] = [], jail: Cell['jail'] = [], wait: Cell['wait'] = []): Cell => ({
  base,
  jail,
  wait,
});

describe('resolveMove', () => {
  it('チェックメイトで勝者を判定する', () => {
    const board = createBoard();
    board[0][0] = cell(['WK']);
    board[0][2] = cell(['BR']);
    board[1][2] = cell(['BB']);
    board[2][2] = cell(['BB']);
    board[3][0] = cell(['BR']);

    const move: Move = { from: { row: 0, column: 2 }, to: { row: 0, column: 1 }, pieceIndex: 0 };
    const result = resolveMove(board, 'BLACK', null, move);

    expect(isInCheck(result.board, 'WHITE')).toBe(true);
    expect(enumerateMoves(result.board, 'WHITE')).toHaveLength(0);
    expect(result.winner).toBe('BLACK');
  });

  it('同一局面が3回出現したら引き分けになる', () => {
    const board = createBoard();
    board[0][0] = cell(['BK']);
    board[3][3] = cell(['WK']);

    let currentBoard = board;
    let turn: Turn = 'WHITE';
    let winner: Turn | 'DRAW' | null = null;
    let counts = new Map<string, number>();
    counts.set(`${serializeBoard(currentBoard)}|${turn}`, 1);

    const playMove = (move: Move) => {
      const result = resolveMove(currentBoard, turn, winner, move, { repetitionCounts: counts, skipLog: true });
      currentBoard = result.board;
      turn = result.turn;
      winner = result.winner;
      counts = result.repetitionCounts;
      return result;
    };

    const whiteMoves: Move[] = [
      { from: { row: 3, column: 3 }, to: { row: 3, column: 2 }, pieceIndex: 0 },
      { from: { row: 3, column: 2 }, to: { row: 3, column: 3 }, pieceIndex: 0 },
    ];
    const blackMoves: Move[] = [
      { from: { row: 0, column: 0 }, to: { row: 0, column: 1 }, pieceIndex: 0 },
      { from: { row: 0, column: 1 }, to: { row: 0, column: 0 }, pieceIndex: 0 },
    ];

    for (let i = 0; i < 3 && winner !== 'DRAW'; i += 1) {
      playMove(whiteMoves[0]);
      playMove(blackMoves[0]);
      playMove(whiteMoves[1]);
      playMove(blackMoves[1]);
    }

    expect(winner).toBe('DRAW');
  });

  it('ステイルメイトは引き分けになる', () => {
    const board = createBoard();
    board[0][0] = cell(['WK']);
    board[0][2] = cell(['BN']);
    board[1][2] = cell(['BB']);
    board[2][1] = cell(['BK']);

    const move: Move = { from: { row: 0, column: 2 }, to: { row: 2, column: 3 }, pieceIndex: 0 };
    const result = resolveMove(board, 'BLACK', null, move, { skipLog: true });

    expect(result.winner).toBe('DRAW');
    expect(isInCheck(result.board, 'WHITE')).toBe(false);
    expect(enumerateMoves(result.board, 'WHITE')).toHaveLength(0);
  });

  it('ステイルメイトの盤面評価は0になる', () => {
    const board = createBoard();
    board[0][0] = cell(['WK']);
    board[1][2] = cell(['BB']);
    board[2][1] = cell(['BK']);
    board[2][3] = cell(['BN']);

    const score = evaluateBoard(board, { perspective: 'WHITE' });
    const enemyScore = evaluateBoard(board, { perspective: 'BLACK' });

    expect(score).toBe(0);
    expect(enemyScore).toBe(0);
  });
});
