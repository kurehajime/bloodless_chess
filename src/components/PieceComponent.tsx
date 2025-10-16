import type { MouseEvent } from 'react';
import { motion, type Transition } from 'framer-motion';
import { Piece } from '../game/board';

const PIECE_SYMBOLS: Record<Piece, string> = {
  BK: '♚',
  BR: '♜',
  BB: '♝',
  BN: '♞',
  WK: '♔',
  WR: '♖',
  WB: '♗',
  WN: '♘',
};

type PieceComponentProps = {
  piece: Piece;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
  rotation?: number;
  onClick?: (event: MouseEvent<SVGGElement>) => void;
  highlight?: boolean;
  glow?: boolean;
  opacity?: number;
  inCheck?: boolean;
  movementType?: 'normal' | 'capture';
  cursor?: string;
};

const PieceComponent = ({
  piece,
  x,
  y,
  fontSize,
  fill,
  rotation = 0,
  onClick,
  highlight = false,
  glow = false,
  opacity = 1,
  inCheck = false,
  movementType = 'normal',
  cursor = 'default',
}: PieceComponentProps) => {
  const symbol = PIECE_SYMBOLS[piece];
  const radius = fontSize * 0.68;
  const strokeWidth = highlight ? fontSize * 0.08 : fontSize * 0.06;
  const accentFill = highlight ? 'rgba(14, 165, 233, 0.28)' : 'rgba(59, 130, 246, 0.18)';
  const accentStroke = highlight ? 'rgba(14, 165, 233, 0.9)' : 'rgba(59, 130, 246, 0.5)';
  const rotate = rotation ?? 0;

  const transitionPresets: Record<'normal' | 'capture', Transition> = {
    normal: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
    capture: { duration: 0.28, ease: [0.2, 0.65, 0.35, 1] },
  };

  const handleClick = (event: MouseEvent<SVGGElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };

  const isKing = piece === 'WK' || piece === 'BK';
  const shouldShake = isKing && inCheck;

  return (
    <motion.g
      initial={{ x, y, rotate }}
      animate={{ x, y, rotate }}
      transition={transitionPresets[movementType]}
      onClick={onClick ? handleClick : undefined}
      style={{ cursor, transformOrigin: 'center' }}
    >
      <g
        className={shouldShake ? 'animate-shake' : undefined}
        style={{ transformOrigin: 'center' }}
      >
        {(highlight || glow) && (
          <motion.circle
            cx={0}
            cy={0}
            r={radius}
            fill={glow && !highlight ? accentFill : 'rgba(14, 165, 233, 0.34)'}
            stroke={glow && !highlight ? accentStroke : 'rgba(14, 165, 233, 0.95)'}
            strokeWidth={strokeWidth}
            transition={transitionPresets[movementType]}
          />
        )}
        <motion.text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'Noto Sans Symbols 2', 'Noto Sans Symbols', 'Apple Color Emoji', 'Segoe UI Emoji', 'Twemoji Mozilla', 'Noto Color Emoji', sans-serif"
          fontSize={fontSize}
          fontWeight={200}
          fill={fill}
          fillOpacity={opacity}
          opacity={opacity}
          style={{ userSelect: 'none' }}
          transition={transitionPresets[movementType]}
        >
          {symbol}
        </motion.text>
      </g>
    </motion.g>
  );
};

export default PieceComponent;
