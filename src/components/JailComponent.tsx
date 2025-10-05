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

  const centerY = cellSize * 0.85;
  const fontSize = cellSize * 0.28;
  const spacing = fontSize * 1.1;
  const totalWidth = (pieces.length - 1) * spacing;
  const startX = cellSize / 2 - totalWidth / 2;

  return (
    <g>
      {pieces.map((piece, index) => {
        const x = startX + index * spacing;
        const fill = '#0f172a';
        return (
          <PieceComponent
            key={`${piece}-j-${index}`}
            piece={piece}
            x={x}
            y={centerY}
            fontSize={fontSize}
            fill={fill}
            rotation={270}
          />
        );
      })}
    </g>
  );
};

export default JailComponent;
