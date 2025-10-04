import { Piece } from '../game/board';
import PieceComponent from './PieceComponent';

type JailComponentProps = {
  pieces: Piece[];
  cellSize: number;
};

const JailComponent = ({ pieces, cellSize }: JailComponentProps) => {
  if (pieces.length === 0) {
    return null;
  }

  const centerX = cellSize / 2;
  const startY = cellSize * 0.7;
  const fontSize = cellSize * 0.28;
  const spacing = fontSize * 0.9;

  return (
    <g>
      {pieces.map((piece, index) => {
        const y = startY + index * spacing;
        const fill = piece.startsWith('W') ? '#1f2937' : '#0f172a';
        return (
          <PieceComponent
            key={`${piece}-j-${index}`}
            piece={piece}
            x={centerX}
            y={y}
            fontSize={fontSize}
            fill={fill}
            rotation={90}
          />
        );
      })}
    </g>
  );
};

export default JailComponent;
