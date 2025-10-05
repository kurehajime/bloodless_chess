import { Board, BOARD_SIZE, Position } from '../game/board';
import { SelectionState } from '../game/gameManager';
import type { Move } from '../game/rules';
import CellComponent from './CellComponent';
import SelectorComponent from './SelectorComponent';

type BoardComponentProps = {
  board: Board;
  cellSize?: number;
  selection?: SelectionState | null;
  lastMove?: Move | null;
  onCellClick?: (position: Position) => void;
  onPieceSelect?: (pieceIndex: number) => void;
  disabled?: boolean;
};

const BoardComponent = ({
  board,
  cellSize = 144,
  selection,
  lastMove,
  onCellClick,
  onPieceSelect,
  disabled = false,
}: BoardComponentProps) => {
  const boardSize = BOARD_SIZE * cellSize;
  const validMoves = selection && selection.pieceIndex !== null ? selection.validMoves : [];
  const validMoveKeys = new Set(validMoves.map((move) => `${move.row}-${move.column}`));
  const showSelectorOverlay =
    !disabled &&
    !!selection &&
    selection.pieceIndex === null &&
    selection.availablePieceIndexes.length > 1 &&
    typeof onPieceSelect === 'function';

  const selectorOverlay = (() => {
    if (!showSelectorOverlay || !onPieceSelect) {
      return null;
    }
    const { position } = selection;
    const originX = position.column * cellSize;
    const originY = position.row * cellSize;
    const cell = board[position.row][position.column];

    type Direction = 'up' | 'down' | 'left' | 'right';
    const preferredDirections: Direction[] = [];
    const addDirection = (dir: Direction) => {
      if (!preferredDirections.includes(dir)) {
        preferredDirections.push(dir);
      }
    };

    if (position.row === 0) addDirection('down');
    if (position.row === BOARD_SIZE - 1) addDirection('up');
    if (position.column === 0) addDirection('right');
    if (position.column === BOARD_SIZE - 1) addDirection('left');
    addDirection('up');
    addDirection('down');
    addDirection('left');
    addDirection('right');

    return (
      <SelectorComponent
        key="selector-overlay"
        pieces={cell.base}
        availableIndexes={selection.availablePieceIndexes}
        cellSize={cellSize}
        originX={originX}
        originY={originY}
        boardSize={boardSize}
        preferredDirections={preferredDirections}
        onSelect={onPieceSelect}
      />
    );
  })();

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
        row.map((cell, columnIndex) => {
          const positionKey = `${rowIndex}-${columnIndex}`;
          const isSelected =
            !!selection &&
            selection.position.row === rowIndex &&
            selection.position.column === columnIndex;
          const isValidMove = selection?.pieceIndex !== null && validMoveKeys.has(positionKey);
          const availablePieceIndexes = isSelected ? selection.availablePieceIndexes : [];
          const selectedPieceIndex = isSelected ? selection.pieceIndex : null;
          const selectionPending = isSelected && selection.pieceIndex === null;
          const isLastMoveTo = lastMove?.to.row === rowIndex && lastMove?.to.column === columnIndex;

          const handleCellClick = () => {
            if (disabled || !onCellClick) {
              return;
            }
            onCellClick({ row: rowIndex, column: columnIndex });
          };

          const handlePieceSelect = (pieceIndex: number) => {
            if (disabled || !onPieceSelect) {
              return;
            }
            onPieceSelect(pieceIndex);
          };

          return (
            <CellComponent
              key={positionKey}
              cell={cell}
              row={rowIndex}
              column={columnIndex}
              cellSize={cellSize}
              onClick={handleCellClick}
              isSelected={isSelected}
              isValidMove={isValidMove}
              isLastMoveTo={isLastMoveTo}
              selectionPending={selectionPending}
              availablePieceIndexes={availablePieceIndexes}
              selectedPieceIndex={selectedPieceIndex}
              onSelectPiece={isSelected ? handlePieceSelect : undefined}
              disabled={disabled}
            />
          );
        })
      )}
      {selectorOverlay}
      <rect
        x={0}
        y={0}
        width={boardSize}
        height={boardSize}
        fill="none"
        stroke="#0f172a"
        strokeWidth={4}
      />
    </svg>
  );
};

export default BoardComponent;
