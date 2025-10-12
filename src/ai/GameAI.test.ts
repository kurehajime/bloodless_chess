import { describe, expect, it } from 'vitest';

import { GameAI } from './GameAI';
import { BOARD_SIZE, Board, Cell, createEmptyCell } from '../game/board';
import { GameManager } from '../game/gameManager';
import { getDifficultyDepth } from '../components/DifficultySelector';

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

  it('レベル5相当の深さで白の初手に対して黒ルークを一段下げる', () => {
    const manager = GameManager.create();
    const whiteOpening = {
      from: { row: 3, column: 3 },
      to: { row: 0, column: 3 },
      pieceIndex: 0,
    } as const;

    const nextManager = GameManager.applyMove(manager, whiteOpening);
    expect(nextManager.turn).toBe('BLACK');

    const depth = getDifficultyDepth(5);
    const result = GameAI.decide(nextManager.board, nextManager.turn, {
      depth,
      perspective: 'BLACK',
    });

    expect(result.move).not.toBeNull();
    expect(result.move).toMatchObject({
      from: { row: 0, column: 0 },
      to: { row: 1, column: 0 },
      pieceIndex: 0,
    });
  });
});
