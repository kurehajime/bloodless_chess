import { Piece } from '../game/board';
import PieceComponent from './PieceComponent';

type BaseComponentProps = {
  pieces: Piece[];
  cellSize: number;
  darkSquare: boolean;
};

const BaseComponent = ({ pieces, cellSize, darkSquare }: BaseComponentProps) => {
  if (pieces.length === 0) {
    return null;
  }

  const fontSize = cellSize * 0.32;
  const spacing = cellSize * 0.3;
  const centerX = cellSize / 2;
  const centerY = cellSize / 2;
  const totalWidth = spacing * (pieces.length - 1);
  const startX = centerX - totalWidth / 2;

  return (
    <g>
      {pieces.map((piece, index) => {
        const pieceX = pieces.length === 1 ? centerX : startX + index * spacing;
        const isWhite = piece.startsWith('W');
        const fill = isWhite
          ? darkSquare
            ? '#f8fafc'
            : '#1e293b'
          : darkSquare
            ? '#fbbf24'
            : '#b45309';
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
