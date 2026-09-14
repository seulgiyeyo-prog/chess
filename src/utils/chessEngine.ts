import { Chess, Square } from 'chess.js';
import { AIDifficulty } from '../types';

// Standard piece values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables for White (Rank 8 down to Rank 1)
// Higher values encourage good placement (e.g., knights in center, pawns advancing)
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_TABLE_MID = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

export interface AIEvaluationResult {
  from: Square;
  to: Square;
  promotion?: string;
  score: number;
  nodesEvaluated: number;
}

/**
 * Evaluate board from the perspective of White (+ is good for White, - is good for Black)
 */
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw()) {
    return 0;
  }

  let totalScore = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      let posVal = 0;

      // Select table
      const rowIdx = piece.color === 'w' ? r : 7 - r;
      const colIdx = c;

      if (piece.type === 'p') posVal = PAWN_TABLE[rowIdx][colIdx];
      else if (piece.type === 'n') posVal = KNIGHT_TABLE[rowIdx][colIdx];
      else if (piece.type === 'b') posVal = BISHOP_TABLE[rowIdx][colIdx];
      else if (piece.type === 'r') posVal = ROOK_TABLE[rowIdx][colIdx];
      else if (piece.type === 'q') posVal = QUEEN_TABLE[rowIdx][colIdx];
      else if (piece.type === 'k') posVal = KING_TABLE_MID[rowIdx][colIdx];

      const pieceScore = val + posVal;

      if (piece.color === 'w') {
        totalScore += pieceScore;
      } else {
        totalScore -= pieceScore;
      }
    }
  }

  return totalScore;
}

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  counter: { count: number }
): number {
  counter.count++;

  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });

  // Move ordering: sort captures first to improve alpha-beta cutoff
  moves.sort((a, b) => {
    const valA = a.captured ? PIECE_VALUES[a.captured] : 0;
    const valB = b.captured ? PIECE_VALUES[b.captured] : 0;
    return valB - valA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false, counter);
      chess.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cut-off
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true, counter);
      chess.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return minEval;
  }
}

/**
 * Calculates the best move for the AI depending on difficulty
 */
export function getBestMove(chess: Chess, difficulty: AIDifficulty): AIEvaluationResult | null {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const isWhite = chess.turn() === 'w';
  const counter = { count: 0 };

  // 1. Easy Mode: Quick evaluation with human-like variability
  if (difficulty === 'easy') {
    // 40% chance of taking the best immediate 1-ply move, 60% chance of random good move
    if (Math.random() < 0.35) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion,
        score: 0,
        nodesEvaluated: 1,
      };
    }

    let bestMove = legalMoves[0];
    let bestScore = isWhite ? -Infinity : Infinity;

    for (const move of legalMoves) {
      chess.move(move);
      const score = evaluateBoard(chess);
      chess.undo();

      if (isWhite ? score > bestScore : score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion,
      score: bestScore,
      nodesEvaluated: legalMoves.length,
    };
  }

  // 2. Medium Mode: Depth 2 minimax
  if (difficulty === 'medium') {
    const depth = 2;
    let bestMove = legalMoves[0];
    let bestScore = isWhite ? -Infinity : Infinity;

    for (const move of legalMoves) {
      chess.move(move);
      const score = minimax(chess, depth - 1, -Infinity, Infinity, !isWhite, counter);
      chess.undo();

      if (isWhite) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }

    return {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion,
      score: bestScore,
      nodesEvaluated: counter.count,
    };
  }

  // 3. Hard Mode: Depth 3 minimax with Alpha-Beta
  const depth = legalMoves.length < 10 ? 4 : 3;
  let bestMove = legalMoves[0];
  let bestScore = isWhite ? -Infinity : Infinity;

  // Move ordering for root
  legalMoves.sort((a, b) => {
    const valA = a.captured ? PIECE_VALUES[a.captured] : 0;
    const valB = b.captured ? PIECE_VALUES[b.captured] : 0;
    return valB - valA;
  });

  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of legalMoves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, alpha, beta, !isWhite, counter);
    chess.undo();

    if (isWhite) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
    }
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion || 'q',
    score: bestScore,
    nodesEvaluated: counter.count,
  };
}

/**
 * Calculates current material points difference
 */
export function getMaterialDifference(chess: Chess): { whiteAdvantage: number; capturedByWhite: string[]; capturedByBlack: string[] } {
  const initialPieces: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const currentWhite: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
  const currentBlack: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };

  const board = chess.board();
  for (const row of board) {
    for (const sq of row) {
      if (!sq || sq.type === 'k') continue;
      if (sq.color === 'w') {
        currentWhite[sq.type] = (currentWhite[sq.type] || 0) + 1;
      } else {
        currentBlack[sq.type] = (currentBlack[sq.type] || 0) + 1;
      }
    }
  }

  const capturedByWhite: string[] = [];
  const capturedByBlack: string[] = [];

  let whitePoints = 0;
  let blackPoints = 0;

  for (const type of ['q', 'r', 'b', 'n', 'p'] as const) {
    const whiteDiff = (initialPieces[type] || 0) - (currentBlack[type] || 0);
    for (let i = 0; i < whiteDiff; i++) capturedByWhite.push(type);

    const blackDiff = (initialPieces[type] || 0) - (currentWhite[type] || 0);
    for (let i = 0; i < blackDiff; i++) capturedByBlack.push(type);

    const baseVal = { p: 1, n: 3, b: 3, r: 5, q: 9 }[type];
    whitePoints += currentWhite[type] * baseVal;
    blackPoints += currentBlack[type] * baseVal;
  }

  return {
    whiteAdvantage: whitePoints - blackPoints,
    capturedByWhite,
    capturedByBlack,
  };
}
