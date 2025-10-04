import { Board, BOARD_SIZE } from '../game/board';
import CellComponent from './CellComponent';

type BoardComponentProps = {
  board: Board;
  cellSize?: number;
};

const BoardComponent = ({ board, cellSize = 96 }: BoardComponentProps) => {
  const boardSize = BOARD_SIZE * cellSize;

  return (
    <svg
      role="img"
      width={boardSize}
      height={boardSize}
      viewBox={`0 0 ${boardSize} ${boardSize}`}
      className="mx-auto block rounded-2xl bg-slate-800/30 shadow-2xl ring-1 ring-slate-900/40"
    >
      <title>無血チェスの盤面</title>
      {board.map((row, rowIndex) =>
        row.map((cell, columnIndex) => (
          <CellComponent
            key={`${rowIndex}-${columnIndex}`}
            cell={cell}
            row={rowIndex}
            column={columnIndex}
            cellSize={cellSize}
          />
        ))
      )}
      <rect
        x={0}
        y={0}
        width={boardSize}
        height={boardSize}
        fill="none"
        stroke="#0f172a"
        strokeWidth={4}
        rx={24}
        ry={24}
      />
    </svg>
  );
};

export default BoardComponent;
