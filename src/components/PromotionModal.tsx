import React from 'react';
import { PieceColor, PieceSymbol } from '../types';
import { ChessPiece } from '../utils/pieces';

interface PromotionModalProps {
  color: PieceColor;
  onSelect: (piece: PieceSymbol) => void;
  isOpen: boolean;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect, isOpen }) => {
  if (!isOpen) return null;

  const choices: { type: PieceSymbol; label: string; mathVal: string }[] = [
    { type: 'q', label: '퀸 (Queen)', mathVal: '9점' },
    { type: 'r', label: '룩 (Rook)', mathVal: '5점' },
    { type: 'b', label: '비숍 (Bishop)', mathVal: '3점' },
    { type: 'n', label: '나이트 (Knight)', mathVal: '3점' },
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs rounded-xl animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl rounded-2xl p-5 max-w-sm w-11/12 text-center">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
          ♟️ 폰 프로모션 (승급)
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          폰이 끝까지 도달했습니다! 변신할 말을 선택하세요.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {choices.map((item) => (
            <button
              key={item.type}
              onClick={() => onSelect(item.type)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-1">
                <ChessPiece type={item.type} color={color} size="100%" />
              </div>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {item.label}
              </span>
              <span className="text-[11px] text-zinc-400">
                가치: {item.mathVal}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
