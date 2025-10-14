import { describe, expect, it } from 'vitest';

import { GameAI } from './GameAI';
import { BOARD_SIZE, Board, Cell, createEmptyCell } from '../game/board';
import { getDifficultyDepth } from '../components/DifficultySelector';
import { resolveMove, isInCheck, Move, enumerateMoves } from '../game/rules';

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
    if (result.move) {
      const resolved = resolveMove(board, 'WHITE', null, result.move as Move);
      expect(isInCheck(resolved.board, 'WHITE')).toBe(false);
    }
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

  it('レベル5相当の深さでも自玉を晒さない応手を選ぶ', () => {
    const board = createEmptyBoard();
    board[0][1] = cell(['BK']);
    board[0][0] = cell(['BR']);
    board[0][3] = cell(['WR']);
    board[3][2] = cell(['WK']);

    const depth = getDifficultyDepth(5);
    const result = GameAI.decide(board, 'BLACK', {
      depth,
      perspective: 'BLACK',
    });

    expect(result.move).not.toBeNull();
    if (result.move) {
      const resolved = resolveMove(board, 'BLACK', null, result.move as Move);
      expect(isInCheck(resolved.board, 'BLACK')).toBe(false);
    }
  });

  it('自分のキングが即時王手になる手を避ける', () => {
    const board = createEmptyBoard();
    board[0][1] = cell(['BK']);
    board[1][1] = cell(['BB']);
    board[0][0] = cell(['BR']);
    board[3][1] = cell(['WR']);
    board[3][2] = cell(['WK']);

    const illegalMove: Move = { from: { row: 1, column: 1 }, to: { row: 1, column: 0 }, pieceIndex: 0 };
    const illegalResult = resolveMove(board, 'BLACK', null, illegalMove);
    expect(isInCheck(illegalResult.board, 'BLACK')).toBe(true);

    const candidateMoves = enumerateMoves(board, 'BLACK');
    expect(candidateMoves).not.toContainEqual(illegalMove);
    const illegalCandidates = candidateMoves.filter(
      (move) => move.from.row === 1 && move.from.column === 1
    );
    expect(illegalCandidates).toHaveLength(0);

    const result = GameAI.decide(board, 'BLACK', { depth: 2, perspective: 'BLACK' });

    expect(result.move).not.toBeNull();
    expect(result.move).not.toMatchObject({ from: { row: 1, column: 1 } });

    if (result.move) {
      const resolved = resolveMove(board, 'BLACK', null, result.move as Move);
      expect(isInCheck(resolved.board, 'BLACK')).toBe(false);
    }
  });
});
