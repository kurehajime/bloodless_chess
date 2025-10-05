import type { MouseEvent } from 'react';
import type { Piece } from '../game/board';
import PieceComponent from './PieceComponent';

type Direction = 'up' | 'down' | 'left' | 'right';

type SelectorComponentProps = {
  pieces: Piece[];
  availableIndexes: number[];
  cellSize: number;
  originX: number;
  originY: number;
  boardSize: number;
  preferredDirections: Direction[];
  onSelect: (pieceIndex: number) => void;
};

type OverlayRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  orientation: 'horizontal' | 'vertical';
};

const SelectorComponent = ({
  pieces,
  availableIndexes,
  cellSize,
  originX,
  originY,
  boardSize,
  preferredDirections,
  onSelect,
}: SelectorComponentProps) => {
  if (availableIndexes.length <= 1) {
    return null;
  }

  const optionWidth = cellSize * 0.52;
  const optionHeight = cellSize * 0.38;
  const gap = cellSize * 0.06;
  const horizontalOffset = cellSize * 0.08;
  const verticalOffset = cellSize * 0.08;
  const fontSize = cellSize * 0.32;

  const totalWidth = optionWidth * availableIndexes.length + gap * (availableIndexes.length - 1);
  const totalHeight = optionHeight * availableIndexes.length + gap * (availableIndexes.length - 1);

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

  const computeRect = (direction: Direction, clampToBoard: boolean): OverlayRect => {
    const orientation: OverlayRect['orientation'] =
      direction === 'up' || direction === 'down' ? 'horizontal' : 'vertical';
    const width = orientation === 'horizontal' ? totalWidth : optionWidth;
    const height = orientation === 'horizontal' ? optionHeight : totalHeight;

    let x: number;
    let y: number;

    switch (direction) {
      case 'up':
        x = originX + (cellSize - width) / 2;
        y = originY - height - verticalOffset;
        break;
      case 'down':
        x = originX + (cellSize - width) / 2;
        y = originY + cellSize + verticalOffset;
        break;
      case 'left':
        x = originX - width - horizontalOffset;
        y = originY + (cellSize - height) / 2;
        break;
      case 'right':
        x = originX + cellSize + horizontalOffset;
        y = originY + (cellSize - height) / 2;
        break;
    }

    if (clampToBoard) {
      x = clamp(x, 0, boardSize - width);
      y = clamp(y, 0, boardSize - height);
    }

    return { x, y, width, height, direction, orientation };
  };

  const directions = Array.from(
    new Set<Direction>([...preferredDirections, 'up', 'down', 'left', 'right'])
  );

  let overlayRect: OverlayRect | null = null;

  for (const direction of directions) {
    const rect = computeRect(direction, false);
    if (rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= boardSize && rect.y + rect.height <= boardSize) {
      overlayRect = rect;
      break;
    }
  }

  if (!overlayRect) {
    overlayRect = computeRect(directions[0], true);
  }

  const { orientation } = overlayRect;

  return (
    <g style={{ pointerEvents: 'auto' }}>
      {availableIndexes.map((pieceIndex, order) => {
        const piece = pieces[pieceIndex];
        if (!piece) {
          return null;
        }

        const optionX =
          orientation === 'horizontal'
            ? overlayRect.x + order * (optionWidth + gap)
            : overlayRect.x;
        const optionY =
          orientation === 'horizontal'
            ? overlayRect.y
            : overlayRect.y + order * (optionHeight + gap);
        const width = orientation === 'horizontal' ? optionWidth : optionWidth;
        const height = orientation === 'horizontal' ? optionHeight : optionHeight;

        const fill = '#0f172a';

        const handleClick = (event: MouseEvent<SVGGElement>) => {
          event.stopPropagation();
          onSelect(pieceIndex);
        };

        return (
          <g
            key={`${piece}-${pieceIndex}`}
            transform={`translate(${optionX} ${optionY})`}
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={0}
              y={0}
              width={optionWidth}
              height={optionHeight}
              fill="rgba(226, 232, 240, 0.92)"
              stroke="rgba(148, 163, 184, 0.7)"
              strokeWidth={3}
              rx={12}
              ry={12}
            />
            <PieceComponent
              piece={piece}
              x={optionWidth / 2}
              y={optionHeight / 2}
              fontSize={fontSize}
              fill={fill}
            />
          </g>
        );
      })}
    </g>
  );
};

export default SelectorComponent;
