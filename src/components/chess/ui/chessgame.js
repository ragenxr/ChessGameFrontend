import React from 'react'
import {observer} from 'mobx-react';
import {Stage, Layer} from 'react-konva';
import Board from '../assets/chessBoard.png'
import Piece from './piece'
import piecemap from './piecemap'
import {useParams} from 'react-router-dom'
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
                this.context.GameStore.gameState.getBoard().map(
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


const ChessGameWrapper = observer((props) => {
  /**
   * player 1
   *      - socketId 1
   *      - socketId 2 ???
   * player 2
   *      - socketId 2
   *      - socketId 1
   */



    // get the gameId from the URL here and pass it to the chessGame component as a prop.
  const domainName = 'http://localhost:3000'
  // const color = React.useContext(ColorContext)
  const [opponentSocketId, setOpponentSocketId] = React.useState('')
  const [opponentDidJoinTheGame, didJoinGame] = React.useState(false)
  const [opponentUserName, setUserName] = React.useState('')
  const [gameSessionDoesNotExist, doesntExist] = React.useState(false)

  React.useEffect(() => {
    // socket.on("playerJoinedRoom", statusUpdate => {
    //     console.log("A new player has joined the room! Username: " + statusUpdate.userName + ", Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
    //     if (socket.id !== statusUpdate.mySocketId) {
    //         setOpponentSocketId(statusUpdate.mySocketId)
    //     }
    // })
    //
    // socket.on("status", statusUpdate => {
    //     console.log(statusUpdate)
    //     alert(statusUpdate)
    //     if (statusUpdate === 'This game session does not exist.' || statusUpdate === 'There are already 2 people playing in this room.') {
    //         doesntExist(true)
    //     }
    // })
    //
    //
    // socket.on('start game', (opponentUserName) => {
    //     console.log("START!")
    //     if (opponentUserName !== props.myUserName) {
    //         setUserName(opponentUserName)
    //         didJoinGame(true)
    //     } else {
    //         // in chessGame, pass opponentUserName as a prop and label it as the enemy.
    //         // in chessGame, use reactContext to get your own userName
    //         // socket.emit('myUserName')
    //         socket.emit('request username', gameid)
    //     }
    // })
    //
    //
    // socket.on('give userName', (socketId) => {
    //     if (socket.id !== socketId) {
    //         console.log("give userName stage: " + props.myUserName)
    //         socket.emit('recieved userName', {userName: props.myUserName, gameId: gameid})
    //     }
    // })
    //
    // socket.on('get Opponent UserName', (data) => {
    //     if (socket.id !== data.socketId) {
    //         setUserName(data.userName)
    //         console.log('data.socketId: data.socketId')
    //         setOpponentSocketId(data.socketId)
    //         didJoinGame(true)
    //     }
    // })
  }, [])


  return (
    <div>
      <h4> Opponent: {opponentUserName} </h4>
      <div style={{ display: "flex" }}>
        <ChessGame />
      </div>
      <h4> You: {props.myUserName} </h4>
    </div>
  );
});

export default ChessGameWrapper;
