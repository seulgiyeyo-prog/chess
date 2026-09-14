import React from 'react';
import { GameMode, AIDifficulty, BoardTheme } from '../types';
import { Bot, Users, Volume2, VolumeX, RotateCcw, FlipVertical, Palette, Compass, Calculator, BookOpen } from 'lucide-react';

interface GameHeaderProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  aiDifficulty: AIDifficulty;
  onAIDifficultyChange: (diff: AIDifficulty) => void;
  whiteName: string;
  onWhiteNameChange: (name: string) => void;
  blackName: string;
  onBlackNameChange: (name: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onFlipBoard: () => void;
  onRestart: () => void;
  theme: BoardTheme;
  onThemeChange: (t: BoardTheme) => void;
  showMathVectors: boolean;
  onToggleMathVectors: () => void;
  isAiThinking: boolean;
  currentTurn: 'w' | 'b';
  isGameOver: boolean;
  onOpenRules: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  mode,
  onModeChange,
  aiDifficulty,
  onAIDifficultyChange,
  whiteName,
  onWhiteNameChange,
  blackName,
  onBlackNameChange,
  isMuted,
  onToggleMute,
  onFlipBoard,
  onRestart,
  theme,
  onThemeChange,
  showMathVectors,
  onToggleMathVectors,
  isAiThinking,
  currentTurn,
  isGameOver,
  onOpenRules,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg p-3.5 sm:p-4 mb-4">
      {/* Top Bar: Mode selection & Essential action controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        {/* Game Mode Pill Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button
            onClick={() => onModeChange('pvp')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              mode === 'pvp'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            1:1 친구 대결
          </button>
          <button
            onClick={() => onModeChange('ai')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              mode === 'ai'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-600" />
            AI 대전
          </button>
        </div>

        {/* AI Difficulty Selector (if in AI mode) */}
        {mode === 'ai' && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium mr-1">난이도:</span>
            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => {
              const labels = { easy: '초급(1단)', medium: '중급(2단)', hard: '고급(3단)' };
              return (
                <button
                  key={level}
                  onClick={() => onAIDifficultyChange(level)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    aiDifficulty === level
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  {labels[level]}
                </button>
              );
            })}
          </div>
        )}

        {/* Action Tool Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Rules & Pieces Guide Button */}
          <button
            onClick={onOpenRules}
            title="체스 규칙 및 말(기물)별 상세 설명 보기"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 dark:border-amber-400/30 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 dark:hover:bg-amber-400/20 transition-all cursor-pointer shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">체스 규칙 & 말 가이드</span>
            <span className="sm:hidden">규칙</span>
          </button>

          {/* Math Vector coordinate toggle */}
          <button
            onClick={onToggleMathVectors}
            title={showMathVectors ? '일반 체스 기보로 전환' : '수학 좌표계 (x, y) 켜기'}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showMathVectors
                ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>수학좌표 (x,y)</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-200 dark:border-rose-900'
                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
            }`}
            title={isMuted ? '음소거 해제 (착수 효과음 켜기)' : '음소거 (소리 끄기)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Flip Board */}
          <button
            onClick={onFlipBoard}
            className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            title="체스판 상하 회전 (흑/백 시점 전환)"
          >
            <FlipVertical className="w-4 h-4" />
          </button>

          {/* Board Theme Select with Realistic Swatches */}
          <div className="relative group">
            <button
              className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title="실제 체스판 테마 색상 변경"
            >
              <Palette className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-1.5 hidden group-hover:block group-focus-within:block z-30">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                실제 체스판 스타일
              </div>
              <button
                onClick={() => onThemeChange('walnut')}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                  theme === 'walnut' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="w-4 h-4 rounded flex overflow-hidden border border-zinc-400/40 shrink-0">
                  <div className="w-2 h-4 bg-[#ecddc8]" />
                  <div className="w-2 h-4 bg-[#764220]" />
                </div>
                <span>정통 호두나무 원목</span>
              </button>
              <button
                onClick={() => onThemeChange('mahogany')}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                  theme === 'mahogany' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="w-4 h-4 rounded flex overflow-hidden border border-zinc-400/40 shrink-0">
                  <div className="w-2 h-4 bg-[#eedbc5]" />
                  <div className="w-2 h-4 bg-[#893826]" />
                </div>
                <span>고급 마호가니</span>
              </button>
              <button
                onClick={() => onThemeChange('oak')}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                  theme === 'oak' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="w-4 h-4 rounded flex overflow-hidden border border-zinc-400/40 shrink-0">
                  <div className="w-2 h-4 bg-[#ebd5b3]" />
                  <div className="w-2 h-4 bg-[#986438]" />
                </div>
                <span>클래식 오크우드</span>
              </button>
              <button
                onClick={() => onThemeChange('tournament')}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                  theme === 'tournament' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="w-4 h-4 rounded flex overflow-hidden border border-zinc-400/40 shrink-0">
                  <div className="w-2 h-4 bg-[#eeeed2]" />
                  <div className="w-2 h-4 bg-[#628448]" />
                </div>
                <span>토너먼트 그린</span>
              </button>
              <button
                onClick={() => onThemeChange('ebony')}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                  theme === 'ebony' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="w-4 h-4 rounded flex overflow-hidden border border-zinc-400/40 shrink-0">
                  <div className="w-2 h-4 bg-[#f4efe4]" />
                  <div className="w-2 h-4 bg-[#292625]" />
                </div>
                <span>황실 흑단목 (에보니)</span>
              </button>
              <button
                onClick={() => onThemeChange('marble')}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                  theme === 'marble' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="w-4 h-4 rounded flex overflow-hidden border border-zinc-400/40 shrink-0">
                  <div className="w-2 h-4 bg-[#f0f3f6]" />
                  <div className="w-2 h-4 bg-[#3b4754]" />
                </div>
                <span>이탈리안 대리석</span>
              </button>
            </div>
          </div>

          {/* New Game / Restart */}
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            새 경기
          </button>
        </div>
      </div>

      {/* Bottom Bar: Player Names & Real-time Turn Status */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        {/* White Player Card & Input */}
        <div
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
            currentTurn === 'w' && !isGameOver
              ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-400 ring-2 ring-amber-400/40'
              : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-zinc-300 shadow-xs flex items-center justify-center font-bold text-lg text-zinc-900">
            ♟
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-0.5">
              <span>백 플레이어 (선공)</span>
              {currentTurn === 'w' && !isGameOver && (
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                  ● 차례입니다
                </span>
              )}
            </div>
            <input
              type="text"
              value={whiteName}
              onChange={(e) => onWhiteNameChange(e.target.value)}
              placeholder="백 플레이어 이름 (예: 김민준)"
              className="w-full text-xs sm:text-sm font-semibold bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-600 focus:border-amber-500 focus:outline-hidden text-zinc-900 dark:text-white py-0.5"
            />
          </div>
        </div>

        {/* Black Player Card & Input */}
        <div
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
            currentTurn === 'b' && !isGameOver
              ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-400 ring-2 ring-amber-400/40'
              : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 shadow-xs flex items-center justify-center font-bold text-lg text-white">
            ♙
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-0.5">
              <span>흑 플레이어 {mode === 'ai' ? '(컴퓨터 AI)' : '(후공)'}</span>
              {currentTurn === 'b' && !isGameOver && (
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                  {isAiThinking ? 'AI 계산 중...' : '● 차례입니다'}
                </span>
              )}
            </div>
            <input
              type="text"
              value={blackName}
              disabled={mode === 'ai'}
              onChange={(e) => onBlackNameChange(e.target.value)}
              placeholder={mode === 'ai' ? '수학 AI 엔진' : '흑 플레이어 이름 (예: 이서연)'}
              className={`w-full text-xs sm:text-sm font-semibold bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-600 focus:border-amber-500 focus:outline-hidden text-zinc-900 dark:text-white py-0.5 ${
                mode === 'ai' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
