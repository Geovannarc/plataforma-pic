import Chess from '/.chess';

let board = null
let dificuldade = 2
let game = new Chess()

/*The "AI" part starts here */

let minimaxRoot =function(depth, game, isMaximisingPlayer) {

let newGameMoves = game.ugly_moves();
let bestMove = -9999;
let bestMoveFound;

for(let i = 0; i < newGameMoves.length; i++) {
    let newGameMove = newGameMoves[i]
    game.ugly_move(newGameMove);
    let value = minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
    game.undo();
    if(value >= bestMove) {
        bestMove = value;
        bestMoveFound = newGameMove;
    }
}
return bestMoveFound;
};

let minimax = function (depth, game, alpha, beta, isMaximisingPlayer) {
positionCount++;
if (depth === 0) {
    return -evaluateBoard(game.board());
}

let newGameMoves = game.ugly_moves();

if (isMaximisingPlayer) {
    let bestMove = -9999;
    for (let i = 0; i < newGameMoves.length; i++) {
        game.ugly_move(newGameMoves[i]);
        bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
        game.undo();
        alpha = Math.max(alpha, bestMove);
        if (beta <= alpha) {
            return bestMove;
        }
    }
    return bestMove;
} else {
    let bestMove = 9999;
    for (let i = 0; i < newGameMoves.length; i++) {
        game.ugly_move(newGameMoves[i]);
        bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
        game.undo();
        beta = Math.min(beta, bestMove);
        if (beta <= alpha) {
            return bestMove;
        }
    }
    return bestMove;
}
};

let evaluateBoard = function (board) {
let totalEvaluation = 0;
for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i ,j);
    }
}
return totalEvaluation;
};

let getPieceValue = function (piece, x, y) {
if (piece === null) {
    return 0;
}
let getAbsoluteValue = function (piece) {
    if (piece.type === 'p') {
        return 10;
    } else if (piece.type === 'r') {
        return 50;
    } else if (piece.type === 'n') {
        return 30;
    } else if (piece.type === 'b') {
        return 30;
    } else if (piece.type === 'q') {
        return 90;
    } else if (piece.type === 'k') {
        return 900;
    }
    throw "Unknown piece type: " + piece.type;
};

let absoluteValue = getAbsoluteValue(piece);
return piece.color === 'w' ? absoluteValue : -absoluteValue;
};


/* board visualization and games state handling */

let onDragStart = function (source, piece, position, orientation) {
if (game.in_checkmate() === true || game.in_draw() === true ||
    piece.search(/^b/) !== -1) {
    return false;
}
};

let makeBestMove = function () {
let bestMove = getBestMove(game);
game.ugly_move(bestMove);
board.position(game.fen());
renderMoveHistory(game.history());
if (game.game_over()) {
    alert('Game over');
}
};


let positionCount;
let getBestMove = function (game) {
if (game.game_over()) {
    alert('Game over');
}

positionCount = 0;
let depth = dificuldade;
//parseInt(jQuery('#search-depth').find(':selected').text());

let d = new Date().getTime();
let bestMove = minimaxRoot(depth, game, true);
let d2 = new Date().getTime();
let moveTime = (d2 - d);
let positionsPerS = ( positionCount * 1000 / moveTime);

jQuery('#position-count').text(positionCount);
jQuery('#time').text(moveTime/1000 + 's');
jQuery('#positions-per-s').text(positionsPerS);
return bestMove;
};

let renderMoveHistory = function (moves) {
let historyElement = jQuery('#move-history').empty();
historyElement.empty();
for (let i = 0; i < moves.length; i = i + 2) {
    historyElement.append('<span>' + moves[i] + ' ' + ( moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
}
historyElement.scrollTop(historyElement[0].scrollHeight);

};

let onDrop = function (source, target) {

let move = game.move({
    from: source,
    to: target,
    promotion: 'q'
});

removeGreySquares();
if (move === null) {
    return 'snapback';
}

renderMoveHistory(game.history());
window.setTimeout(makeBestMove, 250);
};

let onSnapEnd = function () {
board.position(game.fen());
};

let onMouseoverSquare = function(square, piece) {
let moves = game.moves({
    square: square,
    verbose: true
});

if (moves.length === 0) return;

greySquare(square);

for (let i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
}
};

let onMouseoutSquare = function(square, piece) {
removeGreySquares();
};

let removeGreySquares = function() {
jQuery('#board .square-55d63').css('background', '');
};

let greySquare = function(square) {
let squareEl = jQuery('#board .square-' + square);

let background = '#a9a9a9';
if (squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
}

squareEl.css('background', background);
};

let cfg = {
    position: 'start',
    draggable: true,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd,  
};
board = ChessBoard('board', cfg);

