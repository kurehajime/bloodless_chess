import type { MouseEvent } from 'react';
import { Piece } from '../game/board';
import PieceComponent from './PieceComponent';

type BaseComponentProps = {
  pieces: Piece[];
  cellSize: number;
  availablePieceIndexes?: number[];
  selectedPieceIndex?: number | null;
  selectionPending?: boolean;
  onSelectPiece?: (pieceIndex: number) => void;
};

const BaseComponent = ({
  pieces,
  cellSize,
  availablePieceIndexes = [],
  selectedPieceIndex = null,
  selectionPending = false,
  onSelectPiece,
}: BaseComponentProps) => {
  if (pieces.length === 0) {
    return null;
  }

  const centerX = cellSize / 2;
  const centerY = cellSize * 0.38;
  const fontSize = cellSize * 0.52;
  const maxSpacing = cellSize * 0.45;
  const spacing = pieces.length > 1 ? Math.min(maxSpacing, (cellSize * 0.9) / (pieces.length - 1)) : 0;
  const startX = centerX - (spacing * (pieces.length - 1)) / 2;

  return (
    <g>
      {pieces.map((piece, index) => {
        const pieceX = pieces.length === 1 ? centerX : startX + index * spacing;
        const fill = '#0f172a';
        const isSelectable = !!onSelectPiece && availablePieceIndexes.includes(index);
        const isSelected = selectedPieceIndex === index;
        const shouldGlow = selectionPending && isSelectable && selectedPieceIndex === null;

        const handleClick = (event: MouseEvent<SVGGElement>) => {
          event.stopPropagation();
          if (isSelectable && onSelectPiece) {
            onSelectPiece(index);
          }
        };

        return (
          <PieceComponent
            key={`${piece}-${index}`}
            piece={piece}
            x={pieceX}
            y={centerY}
            fontSize={fontSize}
            fill={fill}
            onClick={isSelectable ? handleClick : undefined}
            highlight={isSelected}
            glow={shouldGlow}
          />
        );
      })}
    </g>
  );
};

export default BaseComponent;
