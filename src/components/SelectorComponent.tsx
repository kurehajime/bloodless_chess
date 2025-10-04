import type { MouseEvent } from 'react';
import type { Piece } from '../game/board';
import PieceComponent from './PieceComponent';

type SelectorComponentProps = {
  pieces: Piece[];
  availableIndexes: number[];
  cellSize: number;
  onSelect: (pieceIndex: number) => void;
};

const SelectorComponent = ({ pieces, availableIndexes, cellSize, onSelect }: SelectorComponentProps) => {
  if (availableIndexes.length <= 1) {
    return null;
  }

  const optionWidth = cellSize * 0.52;
  const optionHeight = cellSize * 0.38;
  const gap = cellSize * 0.06;
  const totalWidth = optionWidth * availableIndexes.length + gap * (availableIndexes.length - 1);
  const startX = (cellSize - totalWidth) / 2;
  const containerY = -optionHeight - cellSize * 0.08;
  const fontSize = cellSize * 0.32;

  return (
    <g style={{ pointerEvents: 'auto' }}>
      {availableIndexes.map((pieceIndex, order) => {
        const piece = pieces[pieceIndex];
        if (!piece) {
          return null;
        }
        const x = startX + order * (optionWidth + gap);
        const isWhite = piece.startsWith('W');
        const fill = isWhite ? '#1f2937' : '#0f172a';

        const handleClick = (event: MouseEvent<SVGGElement>) => {
          event.stopPropagation();
          onSelect(pieceIndex);
        };

        return (
          <g key={`${piece}-${pieceIndex}`} transform={`translate(${x} ${containerY})`} onClick={handleClick} style={{ cursor: 'pointer' }}>
            <rect
              x={0}
              y={0}
              width={optionWidth}
              height={optionHeight}
              fill="rgba(15, 23, 42, 0.92)"
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
