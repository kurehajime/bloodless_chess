import { useTranslation } from 'react-i18next';

export default function RulesDescription() {
  const { t } = useTranslation();
  const pieces = [
    { symbol: '♚', descriptionKey: 'rules.pieces.king' },
    { symbol: '♜', descriptionKey: 'rules.pieces.rook' },
    { symbol: '♝', descriptionKey: 'rules.pieces.bishop' },
    { symbol: '♞', descriptionKey: 'rules.pieces.knight' },
  ];

  return (
    <div className="rounded-lg bg-slate-800/30 p-4 text-sm text-slate-300">
      <h3 className="mb-3 font-semibold text-slate-200">{t('rules.title')}</h3>
      <ul className="space-y-2 mb-4">
        {(t('rules.list', { returnObjects: true }) as string[]).map((rule, index) => (
          <li key={index}>• {rule}</li>
        ))}
      </ul>
      <h3 className="mb-3 font-semibold text-slate-200">{t('rules.pieces.title')}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pieces.map((piece) => (
          <div key={piece.symbol} className="flex flex-col items-center text-center">
            <div className="text-3xl mb-1" style={{ fontFamily: "'Noto Sans Symbols 2', 'Noto Sans Symbols', sans-serif" }}>
              {piece.symbol}
            </div>
            <div className="text-[9px] leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
              {t(piece.descriptionKey)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
