import CellOverlayComponent from './CellOverlayComponent';
import JailComponent from './JailComponent';
import WaitComponent from './WaitComponent';
import { Cell } from '../game/board';

type CellComponentProps = {
  cell: Cell;
  row: number;
  column: number;
  cellSize: number;
  onClick?: () => void;
  isSelected?: boolean;
  isValidMove?: boolean;
  isLastMoveTo?: boolean;
  disabled?: boolean;
  inCheck?: boolean;
};

const CellComponent = ({
  cell,
  row,
  column,
  cellSize,
  onClick,
  isSelected = false,
  isValidMove = false,
  isLastMoveTo = false,
  disabled = false,
  inCheck = false,
}: CellComponentProps) => {
  const x = column * cellSize;
  const y = row * cellSize;
  const isDark = (row + column) % 2 !== 0;
  const fill = isDark ? '#e2e8f0' : '#ffffff';
  const stroke = '#cbd5f5';
  const cursor = onClick && !disabled ? 'pointer' : 'default';

  const handleClick = () => {
    if (disabled || !onClick) {
      return;
    }
    onClick();
  };

  return (
    <g transform={`translate(${x} ${y})`} onClick={handleClick} style={{ cursor }}>
      <rect
        x={0}
        y={0}
        width={cellSize}
        height={cellSize}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
      {isLastMoveTo && (
        <rect
          x={0}
          y={0}
          width={cellSize}
          height={cellSize}
          fill="rgb(250, 204, 21)"
          opacity={0.25}
        />
      )}
      {isValidMove && <CellOverlayComponent cellSize={cellSize} variant="move" />}
      <WaitComponent waitPieces={cell.wait} cellSize={cellSize} />
      <JailComponent pieces={cell.jail} cellSize={cellSize} />
      {isSelected && <CellOverlayComponent cellSize={cellSize} variant="selected" />}
    </g>
  );
};

export default CellComponent;
