import React from 'react'
import {observer} from 'mobx-react';
import {Stage, Layer} from 'react-konva';
import Board from '../assets/chessBoard.png'
import Piece from './piece'
import piecemap from './piecemap'
import {StoreContext} from '../../../stores';


@observer
class ChessGame extends React.Component {
  static contextType = StoreContext;

  startDragging = (e) => {
    this.context.GameStore.setDragged(e.target.attrs.id);
  }

  endDragging = (e) => {
    const currentGame = this.context.GameStore.gameState;
    const currentBoard = currentGame.getBoard();
    const finalPosition = this.inferCoord(e.target.x() + 90, e.target.y() + 90, currentBoard);
    const selectedId = this.context.GameStore.draggedPieceTargetId;
    this.context.GameStore.movePiece(selectedId, finalPosition, currentGame, true);
  }

  inferCoord = (x, y, chessBoard) => {
    const hashmap = {};
    let shortestDistance = Infinity;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const canvasCoord = chessBoard[i][j].getCanvasCoord()
        const delta_x = canvasCoord[0] - x
        const delta_y = canvasCoord[1] - y
        const newDistance = Math.sqrt(delta_x ** 2 + delta_y ** 2)

        hashmap[newDistance] = canvasCoord

        if(newDistance < shortestDistance) {
          shortestDistance = newDistance
        }
      }
    }

    return hashmap[shortestDistance]
  }

  render() {
    return (
      <React.Fragment>
        <div style={{
          backgroundImage: `url(${Board})`,
          width: "720px",
          height: "720px"
        }}
        >
          <Stage width={720} height={720}>
            <Layer>
              {
                this.context.GameStore?.gameState?.getBoard()?.map(
                  (row) => {
                    return (
                      <React.Fragment>
                        {
                          row.map(
                            (square) => {
                              if(square.isOccupied()) {
                                return (
                                  <Piece
                                    x={square.getCanvasCoord()[0]}
                                    y={square.getCanvasCoord()[1]}
                                    imgurls={piecemap[square.getPiece().name]}
                                    isWhite={square.getPiece().color === "white"}
                                    draggedPieceTargetId={this.context.GameStore.draggedPieceTargetId}
                                    onDragStart={this.startDragging}
                                    onDragEnd={this.endDragging}
                                    id={square.getPieceIdOnThisSquare()}
                                    thisPlayersColorIsWhite={this.context.GameStore.color}
                                    playerTurnToMoveIsWhite={this.context.GameStore.playerTurnToMoveIsWhite}
                                    whiteKingInCheck={this.context.GameStore.whiteKingInCheck}
                                    blackKingInCheck={this.context.GameStore.blackKingInCheck}
                                  />
                                );
                              }
                            }
                          )
                        }
                      </React.Fragment>
                    )
                  }
                )
              }
            </Layer>
          </Stage>
        </div>
      </React.Fragment>
    );
  }
}

export default ChessGame;
