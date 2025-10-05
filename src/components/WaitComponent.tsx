import { WaitPiece } from '../game/board';
import PieceComponent from './PieceComponent';

type WaitComponentProps = {
  waitPieces: WaitPiece[];
  cellSize: number;
};

const WaitComponent = ({ waitPieces, cellSize }: WaitComponentProps) => {
  if (waitPieces.length === 0) {
    return null;
  }

  const centerX = cellSize / 2;
  const centerY = cellSize * 0.38;
  const fontSize = cellSize * 0.52;
  const maxSpacing = cellSize * 0.45;
  const spacing = waitPieces.length > 1 ? Math.min(maxSpacing, (cellSize * 0.9) / (waitPieces.length - 1)) : 0;
  const startX = centerX - (spacing * (waitPieces.length - 1)) / 2;

  return (
    <g>
      {waitPieces.map((entry, index) => {
        const pieceX = waitPieces.length === 1 ? centerX : startX + index * spacing;
        const piece = entry.piece;
        const fill = '#0f172a';
        return (
          <PieceComponent
            key={`${piece}-wait-${index}`}
            piece={piece}
            x={pieceX}
            y={centerY}
            fontSize={fontSize}
            fill={fill}
            opacity={0.42}
          />
        );
      })}
    </g>
  );
};

export default WaitComponent;
