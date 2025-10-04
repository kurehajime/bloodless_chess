import { useMemo } from 'react';
import BoardComponent from './components/BoardComponent';
import { createInitialBoard } from './game/board';

function App() {
  const board = useMemo(() => createInitialBoard(), []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 text-slate-100">
      <section className="flex w-full max-w-4xl flex-col items-center gap-8 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-10 shadow-2xl">
        <header className="text-center">
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-sky-300 drop-shadow-sm">
            無血チェス
          </h1>
        </header>
        <div className="flex w-full justify-center">
          <BoardComponent board={board} />
        </div>
      </section>
    </main>
  );
}

export default App;
