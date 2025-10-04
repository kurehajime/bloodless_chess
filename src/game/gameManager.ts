import { Board, Position, Turn, cloneBoard, createInitialBoard, getPieceColor } from './board';
import type { Move } from './rules';
import {
  enumerateMoves as enumerateLegalMoves,
  getValidMovesForPiece as rulesGetValidMovesForPiece,
  resolveMove as resolveBoardMove,
} from './rules';

export type SelectionState = {
  position: Position;
  availablePieceIndexes: number[];
  pieceIndex: number | null;
  validMoves: Position[];
};

export class GameManager {
  private constructor(
    public readonly board: Board,
    public readonly turn: Turn,
    public readonly selection: SelectionState | null,
    public readonly winner: Turn | null
  ) {}

  static create(initialBoard?: Board): GameManager {
    const board = initialBoard ? cloneBoard(initialBoard) : createInitialBoard();
    return new GameManager(board, 'WHITE', null, null);
  }

  static from(board: Board, turn: Turn, selection: SelectionState | null, winner: Turn | null) {
    return new GameManager(cloneBoard(board), turn, selection, winner);
  }

  static handleCellClick(manager: GameManager, position: Position): GameManager {
    if (manager.winner) {
      return manager;
    }

    const selection = manager.selection;
    if (selection && selection.pieceIndex !== null) {
      const isValidMove = selection.validMoves.some((move) => positionsEqual(move, position));
      if (isValidMove) {
        return this.moveTo(manager, position);
      }
    }

    if (selection && positionsEqual(selection.position, position)) {
      return this.deselect(manager);
    }

    return this.selectCell(manager, position);
  }

  static selectPiece(manager: GameManager, pieceIndex: number): GameManager {
    if (manager.winner || !manager.selection) {
      return manager;
    }

    const { board, selection, turn } = manager;
    const { position, availablePieceIndexes } = selection;
    if (!availablePieceIndexes.includes(pieceIndex)) {
      return manager;
    }

    const validMoves = rulesGetValidMovesForPiece(board, position, pieceIndex, turn);
    const nextSelection: SelectionState = {
      position,
      availablePieceIndexes,
      pieceIndex,
      validMoves,
    };
    return new GameManager(manager.board, manager.turn, nextSelection, manager.winner);
  }

  static applyMove(manager: GameManager, move: Move): GameManager {
    const result = resolveBoardMove(manager.board, manager.turn, manager.winner, move);
    return new GameManager(result.board, result.turn, null, result.winner);
  }

  static enumerateMoves(manager: GameManager): Move[] {
    return enumerateLegalMoves(manager.board, manager.turn);
  }

  static getValidMovesForPiece(
    board: Board,
    position: Position,
    pieceIndex: number,
    turn: Turn
  ): Position[] {
    return rulesGetValidMovesForPiece(board, position, pieceIndex, turn);
  }

  private static selectCell(manager: GameManager, position: Position): GameManager {
    const { board, turn } = manager;
    const cell = board[position.row][position.column];
    if (!cell) {
      return this.deselect(manager);
    }

    const availablePieceIndexes = cell.base.reduce<number[]>((acc, piece, index) => {
      if (getPieceColor(piece) === turn) {
        acc.push(index);
      }
      return acc;
    }, []);

    if (availablePieceIndexes.length === 0) {
      return this.deselect(manager);
    }

    if (availablePieceIndexes.length === 1) {
      const pieceIndex = availablePieceIndexes[0];
      const validMoves = rulesGetValidMovesForPiece(board, position, pieceIndex, turn);
      const selection: SelectionState = {
        position,
        availablePieceIndexes,
        pieceIndex,
        validMoves,
      };
      return new GameManager(board, turn, selection, manager.winner);
    }

    const selection: SelectionState = {
      position,
      availablePieceIndexes,
      pieceIndex: null,
      validMoves: [],
    };
    return new GameManager(board, turn, selection, manager.winner);
  }

  private static moveTo(manager: GameManager, destination: Position): GameManager {
    const selection = manager.selection;
    if (!selection || selection.pieceIndex === null) {
      return manager;
    }

    const move: Move = {
      from: selection.position,
      to: destination,
      pieceIndex: selection.pieceIndex,
    };

    const result = resolveBoardMove(manager.board, manager.turn, manager.winner, move);
    return new GameManager(result.board, result.turn, null, result.winner);
  }

  private static deselect(manager: GameManager): GameManager {
    if (!manager.selection) {
      return manager;
    }
    return new GameManager(manager.board, manager.turn, null, manager.winner);
  }
}

const positionsEqual = (a: Position, b: Position): boolean =>
  a.row === b.row && a.column === b.column;
