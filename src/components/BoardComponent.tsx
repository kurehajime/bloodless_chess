import { Board, BOARD_SIZE, Position, Turn } from '../game/board';
import { SelectionState } from '../game/gameManager';
import type { Move } from '../game/rules';
import { isInCheck } from '../game/rules';
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
  currentTurn?: Turn;
  overlayMessage?: string | null;
};

const BoardComponent = ({
  board,
  cellSize = 144,
  selection,
  lastMove,
  onCellClick,
  onPieceSelect,
  disabled = false,
  currentTurn,
  overlayMessage = null,
}: BoardComponentProps) => {
  const boardSize = BOARD_SIZE * cellSize;
  const validMoves = selection && selection.pieceIndex !== null ? selection.validMoves : [];
  const validMoveKeys = new Set(validMoves.map((move) => `${move.row}-${move.column}`));
  const whiteInCheck = isInCheck(board, 'WHITE');
  const blackInCheck = isInCheck(board, 'BLACK');
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
      width="100%"
      height="100%"
      viewBox={`0 0 ${boardSize} ${boardSize}`}
      className="mx-auto block rounded-2xl bg-slate-800/30 shadow-2xl ring-1 ring-slate-900/40"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
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

          const cellInCheck = (whiteInCheck && cell.base.some(p => p === 'WK')) ||
                              (blackInCheck && cell.base.some(p => p === 'BK'));

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
              inCheck={cellInCheck}
            />
          );
        })
      )}
      {selectorOverlay}
      {overlayMessage ? (
        <g pointerEvents="none">
          <rect
            x={0}
            y={0}
            width={boardSize}
            height={boardSize}
            fill="rgba(15, 23, 42, 0.7)"
          />
          <g opacity={0.85}>
            <text
              x={boardSize / 2}
              y={boardSize / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={cellSize * 0.45}
              fontWeight={700}
              style={{ letterSpacing: '0.08em' }}
            >
              {overlayMessage}
            </text>
          </g>
        </g>
      ) : null}
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
