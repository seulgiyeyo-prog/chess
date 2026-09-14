import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import { GameMode, AIDifficulty, BoardTheme, PlayerRanking, MatchHistoryItem } from './types';
import { ChessBoard } from './components/ChessBoard';
import { GameHeader } from './components/GameHeader';
import { Leaderboard } from './components/Leaderboard';
import { MathStatsPanel } from './components/MathStatsPanel';
import { GameOverModal } from './components/GameOverModal';
import { ChessRulesModal } from './components/ChessRulesModal';
import { soundEngine } from './utils/audio';
import { getBestMove, getMaterialDifference } from './utils/chessEngine';
import {
  getRankings,
  getMatchHistory,
  recordGameResult,
  resetLeaderboard,
  saveRankings,
  removePlayerFromLeaderboard,
} from './utils/rankingStorage';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function App() {
  // 1. Chess Game State
  const [chess, setChess] = useState<Chess>(() => new Chess());
  const [mode, setMode] = useState<GameMode>('pvp');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');

  // Player Names (customizable for 1:1 match & AI mode)
  const [whiteName, setWhiteName] = useState<string>('김민준');
  const [blackName, setBlackName] = useState<string>('이서연');

  // Board presentation (Default to authentic handcrafted Walnut & Maple wood)
  const [theme, setTheme] = useState<BoardTheme>('walnut');
  const [flipped, setFlipped] = useState<boolean>(false);
  const [showMathVectors, setShowMathVectors] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Turn and moves
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [moveHistory, setMoveHistory] = useState<
    { san: string; from: string; to: string; color: string }[]
  >([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Rankings and Match History (Real-time storage)
  const [rankings, setRankings] = useState<PlayerRanking[]>(() => getRankings());
  const [matches, setMatches] = useState<MatchHistoryItem[]>(() => getMatchHistory());

  // Game over state
  const [gameStartTime, setGameStartTime] = useState<number>(() => Date.now());
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [gameOverInfo, setGameOverInfo] = useState<{
    isOpen: boolean;
    winner: 'w' | 'b' | 'draw' | null;
    winReason: string;
    newRatingWhite?: number;
    newRatingBlack?: number;
  }>({
    isOpen: false,
    winner: null,
    winReason: '',
  });

  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refresh rankings from storage
  const refreshRankings = useCallback(() => {
    setRankings(getRankings());
    setMatches(getMatchHistory());
  }, []);

  // Update sound engine mute status
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Switch game mode
  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    if (newMode === 'ai') {
      setBlackName('인공지능 튜터 (AI)');
    } else if (blackName === '인공지능 튜터 (AI)') {
      setBlackName('이서연');
    }
  };

  // Restart game
  const handleRestart = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
      aiTimeoutRef.current = null;
    }
    const newGame = new Chess();
    setChess(newGame);
    setLastMove(null);
    setMoveHistory([]);
    setIsAiThinking(false);
    setGameStartTime(Date.now());
    setGameOverInfo({ isOpen: false, winner: null, winReason: '' });
  }, []);

  // Check Game Over Conditions
  const checkGameOver = useCallback(
    (currentChess: Chess) => {
      if (!currentChess.isGameOver()) return false;

      let winner: 'w' | 'b' | 'draw' | null = null;
      let winReason = '';

      if (currentChess.isCheckmate()) {
        winner = currentChess.turn() === 'w' ? 'b' : 'w';
        winReason = '체크메이트 (외통수)!';
        soundEngine.playVictory();
      } else if (currentChess.isDraw()) {
        winner = 'draw';
        if (currentChess.isStalemate()) {
          winReason = '스테일메이트 (무승부)';
        } else if (currentChess.isThreefoldRepetition()) {
          winReason = '3회 동형 반복 무승부';
        } else if (currentChess.isInsufficientMaterial()) {
          winReason = '기물 부족 무승부';
        } else {
          winReason = '50수 규칙 무승부';
        }
      }

      if (winner) {
        const durationSeconds = Math.round((Date.now() - gameStartTime) / 1000);
        const result = recordGameResult({
          whiteName,
          blackName,
          winner,
          winReason,
          totalMoves: currentChess.history().length,
          durationSeconds,
          mode,
        });

        refreshRankings();

        setGameOverInfo({
          isOpen: true,
          winner,
          winReason,
          newRatingWhite: result.newRatingWhite,
          newRatingBlack: result.newRatingBlack,
        });
        return true;
      }
      return false;
    },
    [whiteName, blackName, gameStartTime, mode, refreshRankings]
  );

  // Make Move Handler (called by ChessBoard or AI)
  const makeMove = useCallback(
    (moveObj: { from: Square; to: Square; promotion?: string }): boolean => {
      if (chess.isGameOver()) return false;

      try {
        const isCapture = Boolean(chess.get(moveObj.to));
        const pieceMoving = chess.get(moveObj.from);
        const isCastle =
          pieceMoving?.type === 'k' && Math.abs(moveObj.from.charCodeAt(0) - moveObj.to.charCodeAt(0)) === 2;

        const moveResult = chess.move({
          from: moveObj.from,
          to: moveObj.to,
          promotion: moveObj.promotion || 'q',
        });

        if (!moveResult) {
          soundEngine.playIllegal();
          return false;
        }

        // Play appropriate sound effect
        if (chess.inCheck()) {
          soundEngine.playCheck();
        } else if (isCastle) {
          soundEngine.playCastle();
        } else if (isCapture || moveResult.captured) {
          soundEngine.playCapture();
        } else {
          soundEngine.playMove();
        }

        // Update state
        setLastMove({ from: moveObj.from, to: moveObj.to });
        setMoveHistory((prev) => [
          ...prev,
          {
            san: moveResult.san,
            from: moveObj.from,
            to: moveObj.to,
            color: moveResult.color,
          },
        ]);

        // Trigger re-render of chess board
        const nextChess = new Chess(chess.fen());
        setChess(nextChess);

        // Check if this move ended the game
        checkGameOver(nextChess);
        return true;
      } catch {
        soundEngine.playIllegal();
        return false;
      }
    },
    [chess, checkGameOver]
  );

  // AI Turn Handling
  useEffect(() => {
    if (mode !== 'ai') return;
    if (chess.isGameOver()) return;

    // AI plays Black
    if (chess.turn() === 'b') {
      setIsAiThinking(true);

      aiTimeoutRef.current = setTimeout(() => {
        const aiMove = getBestMove(chess, aiDifficulty);
        setIsAiThinking(false);

        if (aiMove) {
          makeMove({
            from: aiMove.from,
            to: aiMove.to,
            promotion: aiMove.promotion,
          });
        }
      }, 350);
    }

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [chess, mode, aiDifficulty, makeMove]);

  // Resignation Handler
  const handleResign = () => {
    if (chess.isGameOver()) return;
    const resigningColor = chess.turn();
    const winner = resigningColor === 'w' ? 'b' : 'w';
    const winReason = `${resigningColor === 'w' ? whiteName : blackName} 기권`;

    const durationSeconds = Math.round((Date.now() - gameStartTime) / 1000);
    const result = recordGameResult({
      whiteName,
      blackName,
      winner,
      winReason,
      totalMoves: chess.history().length,
      durationSeconds,
      mode,
    });

    refreshRankings();
    soundEngine.playVictory();

    setGameOverInfo({
      isOpen: true,
      winner,
      winReason,
      newRatingWhite: result.newRatingWhite,
      newRatingBlack: result.newRatingBlack,
    });
  };

  // Draw Offer Handler
  const handleDraw = () => {
    if (chess.isGameOver()) return;
    const durationSeconds = Math.round((Date.now() - gameStartTime) / 1000);
    const result = recordGameResult({
      whiteName,
      blackName,
      winner: 'draw',
      winReason: '양측 합의 무승부',
      totalMoves: chess.history().length,
      durationSeconds,
      mode,
    });

    refreshRankings();

    setGameOverInfo({
      isOpen: true,
      winner: 'draw',
      winReason: '양측 합의 무승부',
      newRatingWhite: result.newRatingWhite,
      newRatingBlack: result.newRatingBlack,
    });
  };

  // Add new player to leaderboard
  const handleAddPlayer = (name: string) => {
    const current = getRankings();
    if (current.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    const newP: PlayerRanking = {
      id: 'p-' + Date.now(),
      name,
      rating: 1200,
      wins: 0,
      losses: 0,
      draws: 0,
      totalGames: 0,
      winStreak: 0,
      lastPlayed: Date.now(),
    };
    const updated = [...current, newP].sort((a, b) => b.rating - a.rating);
    saveRankings(updated);
    setRankings(updated);
  };

  // Reset Leaderboard
  const handleResetRankings = () => {
    const fresh = resetLeaderboard();
    setRankings(fresh);
    setMatches([]);
  };

  // Delete Player from Leaderboard
  const handleDeletePlayer = (id: string) => {
    const updated = removePlayerFromLeaderboard(id);
    setRankings(updated);
  };

  // Calculate material difference
  const materialData = getMaterialDifference(chess);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              ♟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  수학시간 대형 체스 (Math Chess)
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-800/40">
                  <GraduationCap className="w-3.5 h-3.5" />
                  수학 & 논리 사고력
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                대형 보드 & 착수 사운드 · 1:1 대결 & AI 대전 · 실시간 반 랭킹 시스템
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right text-xs">
              <span className="text-zinc-400 text-[11px] block">현재 차례</span>
              <span className="font-bold flex items-center justify-end gap-1.5">
                {chess.turn() === 'w' ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-xs" />
                    ⚪ {whiteName} (백)
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-zinc-400 inline-block shadow-xs" />
                    ⚫ {blackName} (흑)
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col">
        {/* Game Header Controls: Mode, Player Names, Sound, Theme */}
        <GameHeader
          mode={mode}
          onModeChange={handleModeChange}
          aiDifficulty={aiDifficulty}
          onAIDifficultyChange={setAiDifficulty}
          whiteName={whiteName}
          onWhiteNameChange={setWhiteName}
          blackName={blackName}
          onBlackNameChange={setBlackName}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onFlipBoard={() => setFlipped(!flipped)}
          onRestart={handleRestart}
          theme={theme}
          onThemeChange={setTheme}
          showMathVectors={showMathVectors}
          onToggleMathVectors={() => setShowMathVectors(!showMathVectors)}
          isAiThinking={isAiThinking}
          currentTurn={chess.turn()}
          isGameOver={chess.isGameOver()}
          onOpenRules={() => setIsRulesModalOpen(true)}
        />

        {/* 3-Column Layout: Left Stats, Center Extra-Large Board, Right Live Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start flex-1">
          {/* Left Column: Mathematical Stats & Move History (3 cols) */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-4">
            <MathStatsPanel
              whiteAdvantage={materialData.whiteAdvantage}
              capturedByWhite={materialData.capturedByWhite}
              capturedByBlack={materialData.capturedByBlack}
              moveHistory={moveHistory}
              whiteName={whiteName}
              blackName={blackName}
              onResign={handleResign}
              onDraw={handleDraw}
              isGameOver={chess.isGameOver()}
              aiThinking={isAiThinking}
            />

            {/* Educational Math Tip Card with Guide Launcher */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/60 dark:border-indigo-800/40 rounded-2xl p-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                수학적 체스 기물 가치 체계
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed mb-2.5">
                체스는 좌표평면(8×8) 위에서 펼쳐지는 수학 게임입니다.
                폰(1점) &lt; 나이트(3점) = 비숍(3점) &lt; 룩(5점) &lt; 퀸(9점)의 점수 계산을 통해 최적의 교환을 수식화해 보세요!
              </p>
              <button
                onClick={() => setIsRulesModalOpen(true)}
                className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>체스 규칙 & 말 설명서 열기</span>
              </button>
            </div>
          </div>

          {/* Center Column: Extra-Large Chessboard (6 cols) */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col items-center justify-center">
            <ChessBoard
              chess={chess}
              onMove={makeMove}
              flipped={flipped}
              theme={theme}
              showCoordinates={true}
              showMathVectors={showMathVectors}
              isInteractive={!isAiThinking && !chess.isGameOver()}
              lastMove={lastMove}
            />

            {/* Real-time Status Caption */}
            <div className="mt-3 flex items-center justify-between w-full max-w-[660px] px-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-mono">
                {chess.inCheck() ? (
                  <span className="text-rose-600 dark:text-rose-400 font-bold animate-pulse">
                    ⚠️ {chess.turn() === 'w' ? whiteName : blackName}의 킹이 체크 상태입니다!
                  </span>
                ) : (
                  <span>
                    수학 좌표계: {showMathVectors ? '직교좌표 (x, y)' : '알제브라 체스 표기법 (A~H, 1~8)'}
                  </span>
                )}
              </span>
              <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                착수 시 사운드 {isMuted ? '🔇 꺼짐' : '🔊 켜짐'}
              </span>
            </div>
          </div>

          {/* Right Column: Real-time Leaderboard & Match History (4 cols) */}
          <div className="lg:col-span-4 order-3 flex flex-col h-[580px] lg:h-[680px]">
            <Leaderboard
              rankings={rankings}
              matches={matches}
              onReset={handleResetRankings}
              onAddPlayer={handleAddPlayer}
              onDeletePlayer={handleDeletePlayer}
              activeWhiteName={whiteName}
              activeBlackName={blackName}
              onSelectPlayerForGame={(name, slot) => {
                if (slot === 'white') setWhiteName(name);
                else setBlackName(name);
              }}
            />
          </div>
        </div>
      </main>

      {/* Game Over Modal with Confetti & Score update */}
      <GameOverModal
        isOpen={gameOverInfo.isOpen}
        winner={gameOverInfo.winner}
        winReason={gameOverInfo.winReason}
        whiteName={whiteName}
        blackName={blackName}
        totalMoves={chess.history().length}
        newRatingWhite={gameOverInfo.newRatingWhite}
        newRatingBlack={gameOverInfo.newRatingBlack}
        onRestart={handleRestart}
        onClose={() => setGameOverInfo((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Comprehensive Chess Rules & Pieces Guide Modal */}
      <ChessRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
}
