import type { JSX, MouseEvent } from 'react';
import { Board, BOARD_SIZE, Piece, Position, Turn, getPieceColor } from '../game/board';
import { SelectionState } from '../game/gameManager';
import type { Move } from '../game/rules';
import { isInCheck } from '../game/rules';
import CellComponent from './CellComponent';
import SelectorComponent from './SelectorComponent';
import PieceComponent from './PieceComponent';

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
  onOverlayClick?: (() => void) | null;
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
  onOverlayClick = null,
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

  const cellElements: JSX.Element[] = [];
  const pieceEntries: {
    key: string;
    piece: Piece;
    x: number;
    y: number;
    fontSize: number;
    fill: string;
    highlight: boolean;
    glow: boolean;
    onClick?: (event: MouseEvent<SVGGElement>) => void;
    cursor: string;
    inCheck: boolean;
    movementType: 'normal' | 'capture';
    opacity: number;
    rotation?: number;
  }[] = [];

  board.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
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

      const cellInCheck = (whiteInCheck && cell.base.some((p) => p === 'WK')) ||
        (blackInCheck && cell.base.some((p) => p === 'BK'));

      const originX = columnIndex * cellSize;
      const originY = rowIndex * cellSize;
      const centerX = originX + cellSize / 2;
      const centerY = originY + cellSize * 0.38;
      const maxSpacing = cellSize * 0.45;
      const spacing = cell.base.length > 1 ? Math.min(maxSpacing, (cellSize * 0.9) / (cell.base.length - 1)) : 0;
      const startX = centerX - (spacing * (cell.base.length - 1)) / 2;

      const movingPieceColor = isLastMoveTo && cell.base.length > 0 ? getPieceColor(cell.base[0]) : null;
      const hasEnemyInJail =
        !!movingPieceColor && cell.jail.some((piece) => getPieceColor(piece) !== movingPieceColor);

      const showSelector =
        selectionPending && availablePieceIndexes.length > 1 && typeof onPieceSelect === 'function';

      cellElements.push(
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
          disabled={disabled}
          inCheck={cellInCheck}
        />
      );

      if (cell.wait.length > 0) {
        const waitPieces = cell.wait;
        const waitFontSize = cellSize * 0.52;
        const waitMaxSpacing = cellSize * 0.45;
        const waitSpacing = waitPieces.length > 1 ? Math.min(waitMaxSpacing, (cellSize * 0.9) / (waitPieces.length - 1)) : 0;
        const waitStartX = centerX - (waitSpacing * (waitPieces.length - 1)) / 2;

        waitPieces.forEach((entry, waitIndex) => {
          const waitX = waitPieces.length === 1 ? centerX : waitStartX + waitIndex * waitSpacing;
          pieceEntries.push({
            key: `wait-${entry.piece}`,
            piece: entry.piece,
            x: waitX,
            y: centerY,
            fontSize: waitFontSize,
            fill: '#0f172a',
            highlight: false,
            glow: false,
            onClick: undefined,
            cursor: 'default',
            inCheck: false,
            movementType: 'normal',
            opacity: 0.42,
          });
        });
      }

      cell.base.forEach((piece, pieceIndex) => {
        const pieceX = cell.base.length === 1 ? centerX : startX + pieceIndex * spacing;
        const pieceY = centerY;
        const isSelectable =
          !disabled &&
          !showSelector &&
          typeof onPieceSelect === 'function' &&
          availablePieceIndexes.includes(pieceIndex);
        const isSelectedPiece = selectedPieceIndex === pieceIndex;
        const shouldGlow = selectionPending && isSelectable && selectedPieceIndex === null;
        const movementType = isLastMoveTo && pieceIndex === 0 && hasEnemyInJail ? 'capture' : 'normal';

        const canTriggerCell = !disabled && typeof onCellClick === 'function';
        const canSelectPiece = isSelectable && typeof onPieceSelect === 'function';

        const handleClick = (canTriggerCell || canSelectPiece)
          ? (event: MouseEvent<SVGGElement>) => {
            event.stopPropagation();
            if (canSelectPiece) {
              handlePieceSelect(pieceIndex);
              return;
            }
            if (canTriggerCell) {
              handleCellClick();
            }
          }
          : undefined;

        const cursor = handleClick ? 'pointer' : 'default';

        pieceEntries.push({
          key: `base-${piece}`,
          piece,
          x: pieceX,
          y: pieceY,
          fontSize: cellSize * 0.52,
          fill: '#0f172a',
          highlight: isSelectedPiece,
          glow: shouldGlow,
          onClick: handleClick,
          cursor,
          inCheck: cellInCheck,
          movementType,
          opacity: 1,
        });
      });

      if (cell.jail.length > 0) {
        const jailPieces = cell.jail;
        const jailFontSize = cellSize * 0.28;
        const jailSpacing = jailPieces.length > 1 ? jailFontSize * 1.1 : 0;
        const jailTotalWidth = (jailPieces.length - 1) * jailSpacing;
        const jailStartX = centerX - jailTotalWidth / 2;
        const jailY = originY + cellSize * 0.78;

        jailPieces.forEach((piece, jailIndex) => {
          const jailX = jailPieces.length === 1 ? centerX : jailStartX + jailIndex * jailSpacing;
          pieceEntries.push({
            key: `jail-${piece}`,
            piece,
            x: jailX,
            y: jailY,
            fontSize: jailFontSize,
            fill: '#0f172a',
            highlight: false,
            glow: false,
            onClick: undefined,
            cursor: 'default',
            inCheck: false,
            movementType: 'normal',
            opacity: 1,
            rotation: 90,
          });
        });
      }
    });
  });

  return (
    <svg
      role="img"
      width="100%"
      height="100%"
      viewBox={`0 0 ${boardSize} ${boardSize}`}
      className="mx-auto block rounded-2xl bg-slate-800/30 shadow-2xl ring-1 ring-slate-900/40"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {cellElements}
      <g>
        {pieceEntries.map((entry) => (
          <PieceComponent
            key={entry.key}
            piece={entry.piece}
            x={entry.x}
            y={entry.y}
            fontSize={entry.fontSize}
            fill={entry.fill}
            rotation={entry.rotation}
            onClick={entry.onClick}
            highlight={entry.highlight}
            glow={entry.glow}
            opacity={entry.opacity}
            inCheck={entry.inCheck}
            movementType={entry.movementType}
            cursor={entry.cursor}
          />
        ))}
      </g>
      {selectorOverlay}
      {overlayMessage ? (
        <g
          onClick={onOverlayClick ?? undefined}
          role={onOverlayClick ? 'button' : undefined}
          aria-label={overlayMessage ?? undefined}
          style={{ cursor: onOverlayClick ? 'pointer' : 'default' }}
        >
          <rect
            x={0}
            y={0}
            width={boardSize}
            height={boardSize}
            fill="rgba(15, 23, 42, 0.7)"
          />
          <g opacity={0.85} pointerEvents="none">
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
