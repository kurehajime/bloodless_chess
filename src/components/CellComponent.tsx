import BaseComponent from './BaseComponent';
import CellOverlayComponent from './CellOverlayComponent';
import JailComponent from './JailComponent';
import SelectorComponent from './SelectorComponent';
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
  selectionPending?: boolean;
  availablePieceIndexes?: number[];
  selectedPieceIndex?: number | null;
  onSelectPiece?: (pieceIndex: number) => void;
  disabled?: boolean;
};

const CellComponent = ({
  cell,
  row,
  column,
  cellSize,
  onClick,
  isSelected = false,
  isValidMove = false,
  selectionPending = false,
  availablePieceIndexes = [],
  selectedPieceIndex = null,
  onSelectPiece,
  disabled = false,
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

  const showSelector =
    selectionPending && availablePieceIndexes.length > 1 && typeof onSelectPiece === 'function';

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
      {isValidMove && <CellOverlayComponent cellSize={cellSize} variant="move" />}
      <WaitComponent waitPieces={cell.wait} cellSize={cellSize} />
      <BaseComponent
        pieces={cell.base}
        cellSize={cellSize}
        availablePieceIndexes={availablePieceIndexes}
        selectedPieceIndex={selectedPieceIndex}
        selectionPending={selectionPending}
        onSelectPiece={showSelector ? undefined : onSelectPiece}
      />
      <JailComponent pieces={cell.jail} cellSize={cellSize} />
      {showSelector && onSelectPiece && (
        <SelectorComponent
          pieces={cell.base}
          availableIndexes={availablePieceIndexes}
          cellSize={cellSize}
          onSelect={onSelectPiece}
        />
      )}
      {isSelected && <CellOverlayComponent cellSize={cellSize} variant="selected" />}
    </g>
  );
};

export default CellComponent;
