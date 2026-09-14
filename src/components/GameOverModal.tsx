import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, X } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  winner: 'w' | 'b' | 'draw' | null;
  winReason: string;
  whiteName: string;
  blackName: string;
  totalMoves: number;
  newRatingWhite?: number;
  newRatingBlack?: number;
  onRestart: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  winReason,
  whiteName,
  blackName,
  totalMoves,
  newRatingWhite,
  newRatingBlack,
  onRestart,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen && winner && winner !== 'draw') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback if canvas-confetti is not loaded
      }
    }
  }, [isOpen, winner]);

  if (!isOpen) return null;

  const winnerName =
    winner === 'w'
      ? whiteName || '백 플레이어'
      : winner === 'b'
      ? blackName || '흑 플레이어'
      : '무승부';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl rounded-2xl max-w-md w-full p-6 text-center relative overflow-hidden">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Icon */}
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-amber-500/10 text-amber-500">
          {winner === 'draw' ? (
            <Award className="w-8 h-8 text-zinc-500" />
          ) : (
            <Trophy className="w-8 h-8 text-amber-500 animate-bounce" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">
          {winner === 'draw' ? '무승부 게임' : `${winnerName} 승리!`}
        </h2>

        {/* Reason */}
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">
          {winReason} (총 {totalMoves}수)
        </p>

        {/* Players & Elo Rating Updates */}
        <div className="bg-zinc-50 dark:bg-zinc-800/70 rounded-xl p-3 mb-6 border border-zinc-200 dark:border-zinc-700 text-xs">
          <div className="text-[11px] font-semibold text-zinc-400 mb-2">
            🏆 실시간 랭킹 점수 반영 결과
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div
              className={`p-2 rounded-lg ${
                winner === 'w'
                  ? 'bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <div className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                ⚪ {whiteName || '백'}
              </div>
              <div className="font-mono font-bold text-sm text-zinc-900 dark:text-white mt-0.5">
                {newRatingWhite ? `${newRatingWhite}점` : '레이팅 갱신'}
              </div>
              <div className="text-[10px] text-zinc-500">
                {winner === 'w' ? '승리 (+점수)' : winner === 'draw' ? '무승부' : '패배 (-점수)'}
              </div>
            </div>

            <div
              className={`p-2 rounded-lg ${
                winner === 'b'
                  ? 'bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <div className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                ⚫ {blackName || '흑'}
              </div>
              <div className="font-mono font-bold text-sm text-zinc-900 dark:text-white mt-0.5">
                {newRatingBlack ? `${newRatingBlack}점` : '레이팅 갱신'}
              </div>
              <div className="text-[10px] text-zinc-500">
                {winner === 'b' ? '승리 (+점수)' : winner === 'draw' ? '무승부' : '패배 (-점수)'}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              onClose();
              onRestart();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            한 판 더 하기 (재경기)
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold transition-colors cursor-pointer"
          >
            기보 보기
          </button>
        </div>
      </div>
    </div>
  );
};
