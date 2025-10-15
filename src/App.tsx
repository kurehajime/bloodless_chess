import { useCallback, useEffect, useState, useRef } from 'react';
import { useReward } from 'react-rewards';
import { useTranslation } from 'react-i18next';
import BoardComponent from './components/BoardComponent';
import { getDifficultyDepth } from './components/DifficultySelector';
import StartDialog from './components/StartDialog';
import RulesDescription from './components/RulesDescription';
import { createInitialBoard } from './game/board';
import type { Position, Turn } from './game/board';
import { GameManager } from './game/gameManager';
import { GameAI } from './ai/GameAI';
import { serializeBoard } from './game/serialize';
import bloodlessIcon from './assets/bloodless.png';

function App() {
  const { t } = useTranslation();
  const [playerColor, setPlayerColor] = useState<Turn>('WHITE');
  const [manager, setManager] = useState(() => GameManager.create(createInitialBoard('WHITE')));
  const [isThinking, setIsThinking] = useState(false);
  const [difficulty, setDifficulty] = useState(2);
  const [moveCount, setMoveCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const aiTurn: Turn = playerColor === 'WHITE' ? 'BLACK' : 'WHITE';
  const searchDepth = getDifficultyDepth(difficulty);
  const prevWinnerRef = useRef<Turn | 'DRAW' | null>(null);

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

  const handleCellClick = useCallback(
    (position: Position) => {
      if (!gameStarted) {
        return;
      }
      setManager((prev) => {
        const next = GameManager.handleCellClick(prev, position);
        if (next.turn !== prev.turn) {
          setMoveCount((count) => count + 1);
        }
        return next;
      });
    },
    [gameStarted]
  );

  const handlePieceSelect = useCallback((pieceIndex: number) => {
    if (!gameStarted) {
      return;
    }
    setManager((prev) => GameManager.selectPiece(prev, pieceIndex));
  }, [gameStarted]);

  const handleDifficultyChange = useCallback((level: number) => {
    setDifficulty(level);
  }, []);

  const handleColorChange = useCallback((color: Turn) => {
    setPlayerColor(color);
  }, []);

  const handleStart = useCallback(
    (level: number, color: Turn) => {
      setPlayerColor(color);
      setDifficulty(level);
      setManager(GameManager.create(createInitialBoard(color)));
      setMoveCount(0);
      setGameStarted(true);
      prevWinnerRef.current = null;
    },
    []
  );

  const handleResign = useCallback(() => {
    const opponent = manager.turn === 'WHITE' ? 'BLACK' : 'WHITE';
    setManager((prev) => GameManager.from(prev.board, prev.turn, null, opponent, prev.lastMove, prev.repetitionCounts));
  }, [manager.turn]);

  const handleReplay = useCallback(() => {
    setManager(GameManager.create(createInitialBoard(playerColor)));
    setMoveCount(0);
    setGameStarted(false);
    prevWinnerRef.current = null;
  }, [playerColor]);

  // 勝敗が確定したときに演出を実行
  useEffect(() => {
    if (manager.winner && prevWinnerRef.current !== manager.winner) {
      prevWinnerRef.current = manager.winner;
      if (manager.winner === 'WHITE') {
        // 人間（白）の勝利
        rewardWin();
      } else if (manager.winner === 'BLACK') {
        // AI（黒）の勝利
        rewardLose();
      }
    }
  }, [manager.winner, rewardWin, rewardLose]);

  useEffect(() => {
    if (!gameStarted || manager.winner || manager.turn !== aiTurn || manager.selection || isThinking) {
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
          setManager((prev) =>
            GameManager.from(prev.board, prev.turn, null, opponent, prev.lastMove, prev.repetitionCounts)
          );
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
  }, [manager, aiTurn, searchDepth, gameStarted]);

  const turnLabel = manager.turn === 'WHITE' ? t('turn.white') : t('turn.black');
  const winnerLabel =
    manager.winner === 'WHITE'
      ? t('winner.white')
      : manager.winner === 'BLACK'
      ? t('winner.black')
      : manager.winner === 'DRAW'
      ? t('winner.draw')
      : null;
  const winnerOverlayMessage =
    manager.winner === 'WHITE'
      ? 'White Wins!'
      : manager.winner === 'BLACK'
      ? 'Black Wins!'
      : manager.winner === 'DRAW'
      ? 'Draw Game'
      : null;
  const repetitionKey = `${serializeBoard(manager.board)}|${manager.turn}`;
  const repetitionCount = manager.repetitionCounts.get(repetitionKey) ?? 0;
  const repetitionLabel =
    !manager.winner && repetitionCount >= 2 ? t('repetition.label', { count: repetitionCount }) : '';
  const statusLabel = winnerLabel ?? `${turnLabel}${repetitionLabel ? ` ${repetitionLabel}` : ''}`;
  const overlayClickHandler = manager.winner ? handleReplay : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black px-0 sm:px-2 text-slate-100">
      {!gameStarted && (
        <StartDialog
          playerColor={playerColor}
          onColorChange={handleColorChange}
          onStart={handleStart}
        />
      )}
      <span id="rewardWin" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50" />
      <span id="rewardLose" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50" />
      <section className="flex w-full max-w-4xl flex-col items-center gap-4 border border-slate-800/70 bg-slate-900/60 px-4 shadow-2xl">
        <header className="text-center">
          <div className="flex items-center justify-center gap-1 mt-2">
            <img src={bloodlessIcon} alt="" className="h-16 w-16" />
            <h1 className="text-6xl font-bold tracking-tight text-white drop-shadow-sm" style={{ fontFamily: "'WDXLL Lubrifont JPN', sans-serif" }}>
              {t('title')}
            </h1>
          </div>
          <p className="mt-4 text-xl text-slate-300">{statusLabel}</p>
        </header>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400">
            {t('difficulty.label', { level: difficulty })}
          </div>
          {!manager.winner && gameStarted && (
            <button
              onClick={handleResign}
              className="rounded-lg bg-red-700 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-red-600"
            >
              {t('buttons.resign')}
            </button>
          )}
          {manager.winner && (
            <button
              onClick={handleReplay}
              className="rounded-lg bg-sky-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-sky-500"
            >
              {t('buttons.replay')}
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
              currentTurn={manager.turn}
              overlayMessage={winnerOverlayMessage}
              onOverlayClick={overlayClickHandler}
            />
          </div>
        </div>
        <div className="mt-2">
          <RulesDescription />
        </div>
        {!winnerLabel && (
          <p className={`text-sm text-slate-400 transition-opacity ${isThinking ? 'opacity-100' : 'opacity-0'}`}>
            {t('ai.thinking')}
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
