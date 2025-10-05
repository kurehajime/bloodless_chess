import { useCallback, useEffect, useState, useRef } from 'react';
import { useReward } from 'react-rewards';
import BoardComponent from './components/BoardComponent';
import DifficultySelector, { getDifficultyDepth } from './components/DifficultySelector';
import StartDialog from './components/StartDialog';
import RulesDescription from './components/RulesDescription';
import type { Position } from './game/board';
import { GameManager } from './game/gameManager';
import { GameAI } from './ai/GameAI';
import type { Turn } from './game/board';
import bloodlessIcon from './assets/bloodless.png';

function App() {
  const [manager, setManager] = useState(() => GameManager.create());
  const [isThinking, setIsThinking] = useState(false);
  const [difficulty, setDifficulty] = useState(2);
  const [moveCount, setMoveCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const aiTurn: Turn = 'BLACK';
  const searchDepth = getDifficultyDepth(difficulty);
  const prevWinnerRef = useRef<Turn | null>(null);

  const { reward: rewardWin } = useReward('rewardWin', 'confetti', {
    elementCount: 150,
    spread: 90,
    lifetime: 300,
  });

  const { reward: rewardLose } = useReward('rewardLose', 'emoji', {
    emoji: ['😢', '😭'],
    elementCount: 30,
    spread: 60,
    lifetime: 500,
  });

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

  const handleStart = useCallback((level: number) => {
    setDifficulty(level);
    setGameStarted(true);
  }, []);

  const handleResign = useCallback(() => {
    const opponent = manager.turn === 'WHITE' ? 'BLACK' : 'WHITE';
    setManager((prev) => GameManager.from(prev.board, prev.turn, null, opponent));
  }, [manager.turn]);

  const handleReplay = useCallback(() => {
    setManager(GameManager.create());
    setMoveCount(0);
    setGameStarted(false);
    prevWinnerRef.current = null;
  }, []);

  // 勝敗が確定したときに演出を実行
  useEffect(() => {
    if (manager.winner && prevWinnerRef.current !== manager.winner) {
      prevWinnerRef.current = manager.winner;
      if (manager.winner === 'WHITE') {
        // 人間（白）の勝利
        rewardWin();
      } else {
        // AI（黒）の勝利
        rewardLose();
      }
    }
  }, [manager.winner, rewardWin, rewardLose]);

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

    const timer = window.setTimeout(think, 750);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      setIsThinking(false);
    };
  }, [manager, aiTurn, searchDepth]);

  const turnLabel = manager.turn === 'WHITE' ? '白の手番' : '黒の手番';
  const winnerLabel = manager.winner === 'WHITE' ? '白の勝ち' : manager.winner === 'BLACK' ? '黒の勝ち' : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black py-4 px-2 text-slate-100">
      {!gameStarted && <StartDialog onStart={handleStart} />}
      <span id="rewardWin" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50" />
      <span id="rewardLose" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50" />
      <section className="flex w-full max-w-4xl flex-col items-center gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-2xl">
        <header className="text-center">
          <div className="flex items-center justify-center gap-1 mt-2">
            <img src={bloodlessIcon} alt="" className="h-16 w-16" />
            <h1 className="text-6xl font-bold tracking-tight text-white drop-shadow-sm" style={{ fontFamily: "'WDXLL Lubrifont JPN', sans-serif" }}>
              無血チェス
            </h1>
          </div>
          <p className="mt-4 text-xl text-slate-300">{winnerLabel ?? turnLabel}</p>
        </header>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400">
            難易度: レベル{difficulty}
          </div>
          {!manager.winner && gameStarted && (
            <button
              onClick={handleResign}
              className="rounded-lg bg-red-700 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              投了
            </button>
          )}
          {manager.winner && (
            <button
              onClick={handleReplay}
              className="rounded-lg bg-sky-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-sky-500"
            >
              再プレイ
            </button>
          )}
        </div>
        <div className="flex w-full justify-center max-w-full">
          <div className="w-full max-w-[576px]">
            <BoardComponent
              board={manager.board}
              selection={manager.selection}
              lastMove={manager.lastMove}
              onCellClick={handleCellClick}
              onPieceSelect={handlePieceSelect}
              disabled={Boolean(manager.winner) || manager.turn === aiTurn || isThinking}
            />
          </div>
        </div>
        <div className="mt-2">
          <RulesDescription />
        </div>
        {!winnerLabel && (
          <p className={`text-sm text-slate-400 transition-opacity ${isThinking ? 'opacity-100' : 'opacity-0'}`}>
            AIが思考中です…
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
