import { Piece } from '../game/board';

type PieceComponentProps = {
  piece: Piece;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
};

const PieceComponent = ({ piece, x, y, fontSize, fill }: PieceComponentProps) => {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
      fontSize={fontSize}
      fontWeight={600}
      fill={fill}
    >
      {piece}
    </text>
  );
};

export default PieceComponent;
