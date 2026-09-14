import React, { useState, useEffect } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { PieceColor, BoardTheme } from '../types';
import { ChessPiece } from '../utils/pieces';
import { PromotionModal } from './PromotionModal';

interface ChessBoardProps {
  chess: Chess;
  onMove: (move: { from: Square; to: Square; promotion?: string }) => boolean;
  flipped?: boolean;
  theme?: BoardTheme;
  showCoordinates?: boolean;
  showMathVectors?: boolean;
  isInteractive?: boolean;
  lastMove?: { from: Square; to: Square } | null;
}

// Color schemes and authentic frame textures for realistic chessboards
interface ThemeStyle {
  name: string;
  light: string;
  dark: string;
  lightText: string;
  darkText: string;
  outerFrame: string;
  inlayBorder: string;
  selectedHighlight: string;
  lastMoveHighlight: string;
}

const THEME_STYLES: Record<BoardTheme, ThemeStyle> = {
  walnut: {
    name: '정통 원목 (호두나무 & 단풍나무)',
    light: 'bg-[#ecddc8] text-[#6d3b1a]',
    dark: 'bg-[#764220] text-[#ecddc8]',
    lightText: 'text-[#764220]',
    darkText: 'text-[#ecddc8]',
    outerFrame: 'bg-gradient-to-br from-[#3b1d0c] via-[#4d2814] to-[#251206] border-[#251206]',
    inlayBorder: 'border-[#c2965b]/60',
    selectedHighlight: '!bg-amber-400/45 ring-2 ring-amber-400 shadow-inner',
    lastMoveHighlight: '!bg-amber-300/30',
  },
  mahogany: {
    name: '고급 마호가니 (로즈우드 & 자작나무)',
    light: 'bg-[#eedbc5] text-[#863524]',
    dark: 'bg-[#893826] text-[#eedbc5]',
    lightText: 'text-[#893826]',
    darkText: 'text-[#eedbc5]',
    outerFrame: 'bg-gradient-to-br from-[#401510] via-[#561d15] to-[#260c08] border-[#260c08]',
    inlayBorder: 'border-[#d4a373]/60',
    selectedHighlight: '!bg-amber-400/45 ring-2 ring-amber-400 shadow-inner',
    lastMoveHighlight: '!bg-amber-300/30',
  },
  oak: {
    name: '클래식 오크 (내추럴 오크 & 너도밤나무)',
    light: 'bg-[#ebd5b3] text-[#8c582f]',
    dark: 'bg-[#986438] text-[#ebd5b3]',
    lightText: 'text-[#986438]',
    darkText: 'text-[#ebd5b3]',
    outerFrame: 'bg-gradient-to-br from-[#4a2e16] via-[#5e3b1c] to-[#2f1d0d] border-[#2f1d0d]',
    inlayBorder: 'border-[#c79a5e]/60',
    selectedHighlight: '!bg-amber-400/45 ring-2 ring-amber-400 shadow-inner',
    lastMoveHighlight: '!bg-amber-300/30',
  },
  tournament: {
    name: '국제 토너먼트 그린 (전통 경기용)',
    light: 'bg-[#eeeed2] text-[#55773d]',
    dark: 'bg-[#628448] text-[#eeeed2]',
    lightText: 'text-[#628448]',
    darkText: 'text-[#eeeed2]',
    outerFrame: 'bg-gradient-to-br from-[#1c291c] via-[#243524] to-[#121c12] border-[#121c12]',
    inlayBorder: 'border-[#7ea15d]/50',
    selectedHighlight: '!bg-lime-400/40 ring-2 ring-lime-400 shadow-inner',
    lastMoveHighlight: '!bg-lime-300/30',
  },
  ebony: {
    name: '황실 흑단목 (에보니 & 천연 상아)',
    light: 'bg-[#f4efe4] text-[#292625]',
    dark: 'bg-[#292625] text-[#f4efe4]',
    lightText: 'text-[#292625]',
    darkText: 'text-[#f4efe4]',
    outerFrame: 'bg-gradient-to-br from-[#161616] via-[#252525] to-[#0c0c0c] border-[#0c0c0c]',
    inlayBorder: 'border-[#a3a3a3]/50',
    selectedHighlight: '!bg-amber-400/40 ring-2 ring-amber-300 shadow-inner',
    lastMoveHighlight: '!bg-amber-300/25',
  },
  marble: {
    name: '이탈리안 대리석 (카라라 & 네로)',
    light: 'bg-[#f0f3f6] text-[#343f4c]',
    dark: 'bg-[#3b4754] text-[#f0f3f6]',
    lightText: 'text-[#3b4754]',
    darkText: 'text-[#f0f3f6]',
    outerFrame: 'bg-gradient-to-br from-[#1e252d] via-[#2d3744] to-[#131920] border-[#131920]',
    inlayBorder: 'border-[#94a3b8]/50',
    selectedHighlight: '!bg-sky-400/40 ring-2 ring-sky-300 shadow-inner',
    lastMoveHighlight: '!bg-sky-300/30',
  },
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  onMove,
  flipped = false,
  theme = 'walnut',
  showCoordinates = true,
  showMathVectors = false,
  isInteractive = true,
  lastMove = null,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  // Files: a-h, Ranks: 1-8
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = flipped ? [...files].reverse() : files;
  const displayRanks = flipped ? [...ranks].reverse() : ranks;

  // Find King square under check
  const inCheck = chess.inCheck();
  let kingInCheckSquare: Square | null = null;
  if (inCheck) {
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          kingInCheckSquare = `${files[c]}${8 - r}` as Square;
        }
      }
    }
  }

  // Update legal moves whenever selected square changes
  useEffect(() => {
    if (!selectedSquare) {
      setValidMoves([]);
      return;
    }

    const moves = chess.moves({ square: selectedSquare, verbose: true });
    setValidMoves(moves);
  }, [selectedSquare, chess]);

  // Handle Square click
  const handleSquareClick = (square: Square) => {
    if (!isInteractive) return;

    // If already clicked a piece of current turn
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      // Check if target is a legal destination
      const move = validMoves.find((m) => m.to === square);
      if (move) {
        // Check for pawn promotion (pawn moving to 8th rank for white or 1st rank for black)
        const piece = chess.get(selectedSquare);
        if (piece && piece.type === 'p' && (square.endsWith('8') || square.endsWith('1'))) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        const success = onMove({ from: selectedSquare, to: square });
        if (success) {
          setSelectedSquare(null);
          return;
        }
      }

      // If clicked on another piece belonging to current turn player, switch selection
      const clickedPiece = chess.get(square);
      if (clickedPiece && clickedPiece.color === chess.turn()) {
        setSelectedSquare(square);
        return;
      }

      // Deselect if clicked elsewhere
      setSelectedSquare(null);
      return;
    }

    // New selection: only allow selecting pieces of current turn
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
    }
  };

  // Drag and Drop support
  const handleDragStart = (square: Square, e: React.DragEvent) => {
    if (!isInteractive) return;
    const piece = chess.get(square);
    if (!piece || piece.color !== chess.turn()) {
      e.preventDefault();
      return;
    }
    setDraggedSquare(square);
    setSelectedSquare(square);
    e.dataTransfer.setData('text/plain', square);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetSquare: Square, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedSquare) return;

    if (draggedSquare !== targetSquare) {
      const piece = chess.get(draggedSquare);
      if (piece && piece.type === 'p' && (targetSquare.endsWith('8') || targetSquare.endsWith('1'))) {
        // Verify move validity before showing promotion
        const valid = chess.moves({ square: draggedSquare, verbose: true }).some((m) => m.to === targetSquare);
        if (valid) {
          setPendingPromotion({ from: draggedSquare, to: targetSquare });
          setDraggedSquare(null);
          return;
        }
      }

      onMove({ from: draggedSquare, to: targetSquare });
    }

    setSelectedSquare(null);
    setDraggedSquare(null);
  };

  const handlePromotionChoice = (promotionPiece: string) => {
    if (!pendingPromotion) return;
    onMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: promotionPiece,
    });
    setPendingPromotion(null);
    setSelectedSquare(null);
  };

  const currentTheme = THEME_STYLES[theme];

  return (
    <div
      className={`relative w-full max-w-[660px] aspect-square mx-auto select-none rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_4px_18px_rgba(0,0,0,0.5)] p-3 sm:p-4.5 ${currentTheme.outerFrame} border-[3px] transition-all [perspective:1200px]`}
    >
      {/* Precision Inlaid Marquetry Trim (Gold/brass pinstripe groove between frame and playing field) */}
      <div
        className={`relative w-full h-full p-1 sm:p-1.5 rounded-xl border-[1.5px] ${currentTheme.inlayBorder} shadow-[inset_0_2px_5px_rgba(0,0,0,0.6),0_1px_2px_rgba(255,255,255,0.1)]`}
      >
        {/* Board Grid: Inlaid Wooden Parquet Squares */}
        <div className="relative w-full h-full grid grid-rows-8 grid-cols-8 rounded-lg overflow-hidden shadow-2xl border border-black/50">
          {displayRanks.map((rank, rIdx) =>
            displayFiles.map((file, fIdx) => {
              const square = `${file}${rank}` as Square;
              const piece = chess.get(square);
              const isLightSquare = (fIdx + rIdx) % 2 === 0;

              const isSelected = selectedSquare === square;
              const isLegalMove = validMoves.some((m) => m.to === square);
              const isCapture = isLegalMove && Boolean(piece);
              const isLastMoveFrom = lastMove?.from === square;
              const isLastMoveTo = lastMove?.to === square;
              const isCheckedKing = kingInCheckSquare === square;

              // Mathematical vector coords: (x, y) e.g., a1 = (1, 1), h8 = (8, 8)
              const mathX = files.indexOf(file) + 1;
              const mathY = rank;

              return (
                <div
                  key={square}
                  id={`square-${square}`}
                  onClick={() => handleSquareClick(square)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(square, e)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),inset_0_-1px_1px_rgba(0,0,0,0.12)] ${
                    isLightSquare ? currentTheme.light : currentTheme.dark
                  } ${isSelected ? currentTheme.selectedHighlight : ''} ${
                    isLastMoveFrom || isLastMoveTo ? currentTheme.lastMoveHighlight : ''
                  } ${isCheckedKing ? '!bg-rose-600 ring-4 ring-red-500 animate-pulse z-20' : ''}`}
                >
                  {/* Chess Coordinate Labels (Algebraic standard + optional Math Vector coordinates) */}
                  {showCoordinates && (
                    <>
                      {/* Rank label on the leftmost column */}
                      {fIdx === 0 && (
                        <span
                          className={`absolute top-0.5 left-1 text-[11px] sm:text-xs font-bold font-serif pointer-events-none select-none ${
                            isLightSquare ? currentTheme.lightText : currentTheme.darkText
                          } opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]`}
                        >
                          {showMathVectors ? `y=${rank}` : rank}
                        </span>
                      )}

                      {/* File label on the bottommost row */}
                      {rIdx === 7 && (
                        <span
                          className={`absolute bottom-0.5 right-1 text-[11px] sm:text-xs font-bold font-serif pointer-events-none select-none ${
                            isLightSquare ? currentTheme.lightText : currentTheme.darkText
                          } opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]`}
                        >
                          {showMathVectors ? `x=${mathX}` : file}
                        </span>
                      )}
                    </>
                  )}

                  {/* Math Vector coordinate pill (if math vectors active) */}
                  {showMathVectors && (
                    <span className="absolute top-0.5 right-0.5 text-[9px] font-mono font-semibold px-1 rounded bg-black/50 text-amber-200 pointer-events-none border border-amber-500/20">
                      ({mathX},{mathY})
                    </span>
                  )}

                  {/* Chess Piece with high-contrast, realistic 3D carved Staunton look */}
                  {piece && (
                    <div
                      draggable={isInteractive && piece.color === chess.turn()}
                      onDragStart={(e) => handleDragStart(square, e)}
                      className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transition-transform duration-150 hover:-translate-y-1 active:-translate-y-2 hover:scale-[1.03]"
                    >
                      <ChessPiece
                        type={piece.type}
                        color={piece.color as PieceColor}
                        size="94%"
                      />
                    </div>
                  )}

                  {/* Legal Move Indicators (Warm glowing marker) */}
                  {isLegalMove && !isCapture && (
                    <div className="absolute w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full bg-amber-950/40 dark:bg-amber-200/50 border border-amber-900/30 shadow-xs pointer-events-none z-20 animate-scale-in" />
                  )}

                  {/* Legal Capture Indicator (Target Ring) */}
                  {isLegalMove && isCapture && (
                    <div className="absolute inset-0.5 sm:inset-1 rounded-full border-4 border-rose-600/80 shadow-sm pointer-events-none z-20 animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pawn Promotion Dialog */}
      <PromotionModal
        isOpen={Boolean(pendingPromotion)}
        color={chess.turn() as PieceColor}
        onSelect={(pieceSymbol) => handlePromotionChoice(pieceSymbol)}
      />
    </div>
  );
};
