import { describe, expect, it } from 'vitest';

import { GameAI } from './GameAI';
import { BOARD_SIZE, Board, Cell, createEmptyCell } from '../game/board';

const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => createEmptyCell()));

const cell = (base: Cell['base'] = [], jail: Cell['jail'] = [], wait: Cell['wait'] = []): Cell => ({
  base,
  jail,
  wait,
});

describe('GameAI.decide', () => {
  it('即勝利が見込める手を選ぶ', () => {
    const board = createEmptyBoard();
    board[0][1] = cell(['BK']);
    board[0][3] = cell(['WR']);
    board[3][2] = cell(['WK']);

    const result = GameAI.decide(board, 'WHITE', { depth: 2, perspective: 'WHITE' });

    expect(result.move).not.toBeNull();
    expect(result.move).toMatchObject({
      from: { row: 0, column: 3 },
      to: { row: 0, column: 1 },
      pieceIndex: 0,
    });
    expect(result.score).toBe(10000);
    expect(result.nodes).toBeGreaterThan(0);
  });

  it('合法手がない場合はnullを返す', () => {
    const board = createEmptyBoard();
    board[0][0] = cell(['BK']);

    const result = GameAI.decide(board, 'WHITE', { depth: 1, perspective: 'WHITE' });

    expect(result.move).toBeNull();
    expect(result.score).toBeLessThan(0);
    expect(result.nodes).toBe(1);
  });
});
