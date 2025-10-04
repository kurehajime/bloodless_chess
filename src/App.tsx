import { useCallback, useEffect, useState } from 'react';
import BoardComponent from './components/BoardComponent';
import DifficultySelector, { getDifficultyDepth } from './components/DifficultySelector';
import type { Position } from './game/board';
import { GameManager } from './game/gameManager';
import { GameAI } from './ai/GameAI';
import type { Turn } from './game/board';

function App() {
  const [manager, setManager] = useState(() => GameManager.create());
  const [isThinking, setIsThinking] = useState(false);
  const [difficulty, setDifficulty] = useState(2);
  const [moveCount, setMoveCount] = useState(0);
  const aiTurn: Turn = 'BLACK';
  const searchDepth = getDifficultyDepth(difficulty);

  const handleCellClick = useCallback((position: Position) => {
    setManager((prev) => {
      const next = GameManager.handleCellClick(prev, position);
      // 手が進んだ場合はカウント増加
      if (next.turn !== prev.turn) {
        setMoveCount((count) => count + 1);
      }
      return next;
    });
  }, []);

  const handlePieceSelect = useCallback((pieceIndex: number) => {
    setManager((prev) => GameManager.selectPiece(prev, pieceIndex));
  }, []);

  const handleDifficultyChange = useCallback((level: number) => {
    setDifficulty(level);
  }, []);

  useEffect(() => {
    if (manager.winner || manager.turn !== aiTurn || manager.selection || isThinking) {
      return;
    }

    let cancelled = false;
    setIsThinking(true);

    const think = () => {
      const { move } = GameAI.decide(manager.board, manager.turn, {
        depth: searchDepth,
        perspective: aiTurn,
      });

      if (!cancelled) {
        if (move) {
          setManager((prev) => GameManager.applyMove(prev, move));
          setMoveCount((count) => count + 1);
        } else {
          // 合法手がない場合はチェックメイト（負け）
          const opponent = manager.turn === 'WHITE' ? 'BLACK' : 'WHITE';
          setManager((prev) => GameManager.from(prev.board, prev.turn, null, opponent));
        }
        setIsThinking(false);
      }
    };

    const timer = window.setTimeout(think, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      setIsThinking(false);
    };
  }, [manager, aiTurn, isThinking]);

  const turnLabel = manager.turn === 'WHITE' ? '白の手番' : '黒の手番';
  const winnerLabel = manager.winner === 'WHITE' ? '白の勝ち' : manager.winner === 'BLACK' ? '黒の勝ち' : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 text-slate-100">
      <section className="flex w-full max-w-4xl flex-col items-center gap-8 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-10 shadow-2xl">
        <header className="text-center">
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-sky-300 drop-shadow-sm">
            無血チェス
          </h1>
          <p className="mt-4 text-base text-slate-300">{winnerLabel ?? turnLabel}</p>
          {!winnerLabel && (
            <p className="mt-1 text-sm text-slate-400">
              駒を選択して移動先のマスをクリックしてください。
            </p>
          )}
        </header>
        <DifficultySelector
          level={difficulty}
          onLevelChange={handleDifficultyChange}
          disabled={isThinking || moveCount > 0}
        />
        <div className="flex w-full justify-center">
          <BoardComponent
            board={manager.board}
            selection={manager.selection}
            onCellClick={handleCellClick}
            onPieceSelect={handlePieceSelect}
            disabled={Boolean(manager.winner) || manager.turn === aiTurn || isThinking}
          />
        </div>
        {!winnerLabel && isThinking && (
          <p className="text-sm text-slate-400">AIが思考中です…</p>
        )}
      </section>
    </main>
  );
}

export default App;
