import React, { useRef, useEffect } from 'react';
import { ChessPiece } from '../utils/pieces';
import { PieceColor, PieceSymbol } from '../types';
import { Flag, Handshake, Brain, Sigma, Activity } from 'lucide-react';

interface MathStatsPanelProps {
  whiteAdvantage: number;
  capturedByWhite: string[];
  capturedByBlack: string[];
  moveHistory: { san: string; from: string; to: string; color: string }[];
  whiteName: string;
  blackName: string;
  onResign: () => void;
  onDraw: () => void;
  isGameOver: boolean;
  aiThinking: boolean;
  evaluationScore?: number;
}

const PIECE_VALS: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
};

export const MathStatsPanel: React.FC<MathStatsPanelProps> = ({
  whiteAdvantage,
  capturedByWhite,
  capturedByBlack,
  moveHistory,
  whiteName,
  blackName,
  onResign,
  onDraw,
  isGameOver,
  aiThinking,
  evaluationScore = 0,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group moves into pairs (White move, Black move)
  const movePairs: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: moveHistory[i].san,
      black: moveHistory[i + 1]?.san,
    });
  }

  // Auto scroll to bottom of notation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg p-4 flex flex-col gap-4">
      {/* 1. Mathematical Material Advantage Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
          <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
            <Sigma className="w-3.5 h-3.5 text-amber-500" />
            수학적 기물 점수 우세도
          </span>
          <span className="font-mono font-bold">
            {whiteAdvantage > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                ⚪ 백 +{whiteAdvantage}점 우세
              </span>
            ) : whiteAdvantage < 0 ? (
              <span className="text-rose-600 dark:text-rose-400">
                ⚫ 흑 +{Math.abs(whiteAdvantage)}점 우세
              </span>
            ) : (
              <span className="text-zinc-500">동점 (±0)</span>
            )}
          </span>
        </div>

        {/* Evaluation balance bar */}
        <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-amber-400 dark:bg-amber-300 transition-all duration-300"
            style={{
              width: `${Math.min(95, Math.max(5, 50 + whiteAdvantage * 3))}%`,
            }}
          />
          <div
            className="h-full bg-zinc-800 dark:bg-zinc-900 transition-all duration-300"
            style={{
              width: `${Math.min(95, Math.max(5, 50 - whiteAdvantage * 3))}%`,
            }}
          />
        </div>
      </div>

      {/* 2. Captured Pieces breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
        <div>
          <div className="font-semibold text-zinc-600 dark:text-zinc-400 text-[11px] mb-1 flex items-center justify-between">
            <span>⚪ 백이 획득한 기물</span>
            {whiteAdvantage > 0 && <span className="text-emerald-600 font-bold">+{whiteAdvantage}</span>}
          </div>
          <div className="flex flex-wrap gap-1 min-h-[26px] items-center">
            {capturedByWhite.length === 0 ? (
              <span className="text-[11px] text-zinc-400">-</span>
            ) : (
              capturedByWhite.map((type, idx) => (
                <div key={idx} className="w-5 h-5" title={`가치: ${PIECE_VALS[type]}점`}>
                  <ChessPiece type={type as PieceSymbol} color="b" size="100%" />
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="font-semibold text-zinc-600 dark:text-zinc-400 text-[11px] mb-1 flex items-center justify-between">
            <span>⚫ 흑이 획득한 기물</span>
            {whiteAdvantage < 0 && <span className="text-rose-600 font-bold">+{Math.abs(whiteAdvantage)}</span>}
          </div>
          <div className="flex flex-wrap gap-1 min-h-[26px] items-center">
            {capturedByBlack.length === 0 ? (
              <span className="text-[11px] text-zinc-400">-</span>
            ) : (
              capturedByBlack.map((type, idx) => (
                <div key={idx} className="w-5 h-5" title={`가치: ${PIECE_VALS[type]}점`}>
                  <ChessPiece type={type as PieceSymbol} color="w" size="100%" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Mathematical Notation Record (체스 기보 기록) */}
      <div className="flex-1 flex flex-col min-h-[140px] max-h-[220px]">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-indigo-500" />
            수학 기보 (기록표)
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">
            총 {moveHistory.length}수
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 font-mono text-xs divide-y divide-zinc-100 dark:divide-zinc-800/50"
        >
          {movePairs.length === 0 ? (
            <div className="text-center py-6 text-zinc-400 text-[11px]">
              말을 움직이면 표준 체스 기보가 기록됩니다.
            </div>
          ) : (
            movePairs.map((pair) => (
              <div
                key={pair.num}
                className="py-1 px-1 flex items-center hover:bg-zinc-100 dark:hover:bg-zinc-800/40 rounded transition-colors"
              >
                <span className="w-8 text-zinc-400 text-[11px]">{pair.num}.</span>
                <span className="w-20 font-bold text-zinc-800 dark:text-zinc-200">
                  {pair.white}
                </span>
                <span className="w-20 text-zinc-600 dark:text-zinc-400">
                  {pair.black || ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Action buttons: Resign and Draw */}
      {!isGameOver && (
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onResign}
            className="flex-1 py-1.5 px-3 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            기권 (기권패)
          </button>
          <button
            onClick={onDraw}
            className="flex-1 py-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Handshake className="w-3.5 h-3.5" />
            무승부 합의
          </button>
        </div>
      )}
    </div>
  );
};
