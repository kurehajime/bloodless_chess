import { Board, Cell, Turn } from './board';

const encodeSegment = (values: readonly string[]): string => (values.length > 0 ? values.join(',') : '-');

const encodeWait = (cell: Cell): string =>
  cell.wait.length > 0 ? cell.wait.map((entry) => `${entry.piece}@${entry.remainingSkips}`).join(',') : '-';

const encodeCell = (cell: Cell): string => {
  const base = encodeSegment(cell.base);
  const jail = encodeSegment(cell.jail);
  const wait = encodeWait(cell);
  return `${base}|${jail}|${wait}`;
};

export const serializeBoard = (board: Board): string =>
  board.map((row) => row.map((cell) => encodeCell(cell)).join('~')).join('/');

export const composeBoardCacheKey = (board: Board, perspective: Turn): string => `${serializeBoard(board)}#${perspective}`;
