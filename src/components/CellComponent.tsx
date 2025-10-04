import BaseComponent from './BaseComponent';
import JailComponent from './JailComponent';
import { Cell } from '../game/board';

type CellComponentProps = {
  cell: Cell;
  row: number;
  column: number;
  cellSize: number;
};

const CellComponent = ({ cell, row, column, cellSize }: CellComponentProps) => {
  const x = column * cellSize;
  const y = row * cellSize;
  const isDark = (row + column) % 2 !== 0;
  const fill = isDark ? '#1e293b' : '#f8fafc';
  const stroke = '#0f172a';

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={0}
        y={0}
        width={cellSize}
        height={cellSize}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
        rx={12}
        ry={12}
      />
      <BaseComponent
        pieces={cell.base}
        cellSize={cellSize}
        darkSquare={isDark}
      />
      <JailComponent pieces={cell.jail} cellSize={cellSize} />
    </g>
  );
};

export default CellComponent;
