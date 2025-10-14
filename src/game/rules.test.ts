import { describe, expect, it } from 'vitest';

import { BOARD_SIZE, Board, Cell, createEmptyCell } from './board';
import { Move, enumerateMoves, isInCheck, resolveMove } from './rules';

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
});
