import { Board, BOARD_SIZE, Position } from '../game/board';
import { SelectionState } from '../game/gameManager';
import CellComponent from './CellComponent';

type BoardComponentProps = {
  board: Board;
  cellSize?: number;
  selection?: SelectionState | null;
  onCellClick?: (position: Position) => void;
  onPieceSelect?: (pieceIndex: number) => void;
  disabled?: boolean;
};

const BoardComponent = ({
  board,
  cellSize = 144,
  selection,
  onCellClick,
  onPieceSelect,
  disabled = false,
}: BoardComponentProps) => {
  const boardSize = BOARD_SIZE * cellSize;
  const validMoves = selection && selection.pieceIndex !== null ? selection.validMoves : [];
  const validMoveKeys = new Set(validMoves.map((move) => `${move.row}-${move.column}`));

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
              selectionPending={selectionPending}
              availablePieceIndexes={availablePieceIndexes}
              selectedPieceIndex={selectedPieceIndex}
              onSelectPiece={isSelected ? handlePieceSelect : undefined}
              disabled={disabled}
            />
          );
        })
      )}
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
