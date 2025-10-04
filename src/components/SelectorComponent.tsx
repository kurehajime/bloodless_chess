import type { MouseEvent } from 'react';
import type { Piece } from '../game/board';
import PieceComponent from './PieceComponent';

type SelectorComponentProps = {
  pieces: Piece[];
  availableIndexes: number[];
  cellSize: number;
  row: number;
  column: number;
  onSelect: (pieceIndex: number) => void;
};

const SelectorComponent = ({
  pieces,
  availableIndexes,
  cellSize,
  row,
  column,
  onSelect,
}: SelectorComponentProps) => {
  if (availableIndexes.length <= 1) {
    return null;
  }

  const optionWidth = cellSize * 0.52;
  const optionHeight = cellSize * 0.38;
  const verticalGap = cellSize * 0.08;
  const horizontalGap = cellSize * 0.08;
  const gap = cellSize * 0.06;
  const totalWidth = optionWidth * availableIndexes.length + gap * (availableIndexes.length - 1);
  const startX = (cellSize - totalWidth) / 2;
  const fontSize = cellSize * 0.32;

  const isTopRow = row === 0;
  const isBottomRow = row === 3;
  const isLeftColumn = column === 0;
  const isRightColumn = column === 3;

  const verticalPreferred = -optionHeight - verticalGap;
  const verticalFallback = cellSize + verticalGap;
  const horizontalPreferred = -optionWidth - horizontalGap;
  const horizontalFallback = cellSize + horizontalGap;

  const translate = () => {
    if (!isTopRow) {
      return { x: startX, y: verticalPreferred, layout: 'horizontal' } as const;
    }
    if (!isBottomRow) {
      return { x: startX, y: verticalFallback, layout: 'horizontal' } as const;
    }
    if (!isLeftColumn) {
      return { x: horizontalPreferred, y: cellSize / 2 - optionWidth / 2, layout: 'vertical-left' } as const;
    }
    return { x: horizontalFallback, y: cellSize / 2 - optionWidth / 2, layout: 'vertical-right' } as const;
  };

  const position = translate();

  return (
    <g style={{ pointerEvents: 'auto' }}>
      {availableIndexes.map((pieceIndex, order) => {
        const piece = pieces[pieceIndex];
        if (!piece) {
          return null;
        }
        const x =
          position.layout === 'horizontal'
            ? position.x + order * (optionWidth + gap)
            : position.x;
        const y =
          position.layout === 'horizontal'
            ? position.y
            : position.y + order * (optionWidth + gap);
        const width = position.layout === 'horizontal' ? optionWidth : optionHeight;
        const height = position.layout === 'horizontal' ? optionHeight : optionWidth;
        const pieceFontSize =
          position.layout === 'horizontal' ? fontSize : fontSize * (optionHeight / optionWidth);
        const isWhite = piece.startsWith('W');
        const fill = isWhite ? '#1f2937' : '#0f172a';

        const handleClick = (event: MouseEvent<SVGGElement>) => {
          event.stopPropagation();
          onSelect(pieceIndex);
        };

        return (
          <g key={`${piece}-${pieceIndex}`} transform={`translate(${x} ${y})`} onClick={handleClick} style={{ cursor: 'pointer' }}>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="rgba(15, 23, 42, 0.92)"
              stroke="rgba(148, 163, 184, 0.7)"
              strokeWidth={3}
              rx={12}
              ry={12}
            />
            <PieceComponent
              piece={piece}
              x={width / 2}
              y={height / 2}
              fontSize={pieceFontSize}
              fill={fill}
            />
          </g>
        );
      })}
    </g>
  );
};

export default SelectorComponent;
