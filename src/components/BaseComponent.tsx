import { Piece } from '../game/board';
import PieceComponent from './PieceComponent';

type BaseComponentProps = {
  pieces: Piece[];
  cellSize: number;
};

const BaseComponent = ({ pieces, cellSize }: BaseComponentProps) => {
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
        const isWhite = piece.startsWith('W');
        const fill = isWhite ? '#1f2937' : '#0f172a';
        return (
          <PieceComponent
            key={`${piece}-${index}`}
            piece={piece}
            x={pieceX}
            y={centerY}
            fontSize={fontSize}
            fill={fill}
          />
        );
      })}
    </g>
  );
};

export default BaseComponent;
