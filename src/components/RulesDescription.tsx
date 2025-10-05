export default function RulesDescription() {
  const pieces = [
    { symbol: '♚', description: '全方位に1マス動ける。取られたら負け' },
    { symbol: '♜', description: 'タテとヨコに無限に動ける' },
    { symbol: '♝', description: 'ナナメに無限に動ける' },
    { symbol: '♞', description: '全方位に桂馬跳び' },
  ];

  return (
    <div className="rounded-lg bg-slate-800/30 p-4 text-sm text-slate-300">
      <h3 className="mb-3 font-semibold text-slate-200">ルール</h3>
      <ul className="space-y-2 mb-4">
        <li>• 無血チェスは血の流れない人道的なチェスです</li>
        <li>• 負けたコマは死なずに捕虜になります</li>
        <li>• 敵のキングを捕虜にすると勝利です</li>
        <li>• 捕虜は捕まってるあいだは動けません</li>
        <li>• 監視しているコマがいなくなると捕虜は解放されます</li>
        <li>• 解放直後のターンは移動できません</li>
      </ul>
      <h3 className="mb-3 font-semibold text-slate-200">コマの動き</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pieces.map((piece) => (
          <div key={piece.symbol} className="flex flex-col items-center text-center">
            <div className="text-3xl mb-1" style={{ fontFamily: "'Noto Sans Symbols 2', 'Noto Sans Symbols', sans-serif" }}>
              {piece.symbol}
            </div>
            <div className="text-[9px] leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
              {piece.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
