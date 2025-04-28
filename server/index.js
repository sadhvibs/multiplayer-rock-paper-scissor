const express = require("express")
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors())

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

const playersInRooms = {};
const tournamentRounds = {}; 

const playerMoves = {};

const roundsPerRoom = {}; // { roomId: totalRounds }
const scores = {}; // { room: { player1Id: score, player2Id: score } }

let currentRounds = {}; // Store current round for each room

playAgainVotes = {};

function determineWinner(move1, move2) {
    if (move1 === move2) return 'Draw!';
    if ((move1 === 'rock' && move2 === 'scissors') ||
        (move1 === 'paper' && move2 === 'rock') ||
        (move1 === 'scissors' && move2 === 'paper')) {
        return 'You Won!'
    }
    return 'You Lost!'
}

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // joinRoom
    socket.on('joinRoom', ({ name, room }) => {
        console.log(`${name} joined room ${room}`)
        socket.join(room);
        if (!playersInRooms[room]) {
            playersInRooms[room] = [];
        }
        playersInRooms[room].push({ id: socket.id, name });

        console.log(`${name} joined room ${room}`)

        //notifying other players in the room
        socket.to(room).emit('playerJoined', { name });
    });

    //startTournament
    socket.on('startTournament', ({ room, rounds }) => {
        if (!roundsPerRoom[room]) {
            roundsPerRoom[room] = rounds;
            tournamentRounds[room] = rounds;
        }

        const players = playersInRooms[room];
        console.log('🕹️ Starting tournament for:', room);

        if (!players || players.length < 2) return;

        const matches = [];

        //pair players
        for (let i = 0; i < players.length; i++) {
            if (players[i + 1]) {
                matches.push([players[i], players[i + 1]]);
            }
            else {
                matches.push([players[i], null]);
            }
        }
        matches.forEach(([p1, p2]) => {
            if (p2) {
                io.to(p1.id).emit('tournamentStarted', { opponent: p2.name });
                io.to(p2.id).emit('tournamentStarted', { opponent: p1.name});
            }
            else {
                io.to(p1.id).emit('autoAdvance');
            }
        });
    });

    //player move
    socket.on('playerMove', ({ move, room }) => {
        console.log(' Received move:', move, 'from:', socket.id, 'Room:', room);

        if (!currentRounds[room]) {
            currentRounds[room] = 1; // start from round 1
        }

        if (!playerMoves[room]) {
            playerMoves[room] = {}
        }
        playerMoves[room][socket.id] = move;

        const moves = playerMoves[room];
        const playerIds = Object.keys(moves);

        if (playerIds.length === 2) {
            const [id1, id2] = playerIds;
            const move1 = moves[id1];
            const move2 = moves[id2];
            const result1 = determineWinner(move1, move2);
            const result2 = determineWinner(move2, move1);

            console.log('Sending to', id1, ':', result1);
            console.log('Sending to', id2, ':', result2);

            // Initialize scores
            if (!scores[room]) {
                scores[room] = { [id1]: 0, [id2]: 0 };
            }

            // Update scores
            if (result1 === 'You Won!')
                scores[room][id1]++;
            if (result2 === 'You Won!')
                scores[room][id2]++;

            io.to(id1).emit('matchResult', { result: result1, yourMove: move1, opponentMove: move2 });
            io.to(id2).emit('matchResult', { result: result2, yourMove: move2, opponentMove: move1 });

            console.log('Sending to', id1, ':', result1);
            console.log('Sending to', id2, ':', result2);

            // Clear for next round
            playerMoves[room] = {};

            const totalRounds = roundsPerRoom[room] || 3;  // default to 3 if not set
            const p1Score = scores[room][id1];
            const p2Score = scores[room][id2];
            const winThreshold = Math.ceil(totalRounds / 2);

            if (p1Score === winThreshold || p2Score === winThreshold) {
                const winnerId = p1Score > p2Score ? id1 : id2;
                const looserId = winnerId === id1 ? id2 : id1;

                io.to(winnerId).emit('finalWinner', { message: '🎉 You are the overall winner!' });
                io.to(looserId).emit('finalWinner', { message: '😢 You lost the match.' });

                // Reset game state
                delete scores[room];
                delete roundsPerRoom[room];
            }
        }
    })

    //playAgain
    socket.on('playNextRound', ({ room }) => {
        console.log('im here')
        const players = playersInRooms[room];
        if (!playAgainVotes[room]) {
            playAgainVotes[room] = new Set();
        }

        playAgainVotes[room].add(socket.id);
       
        if (players && playAgainVotes[room].size === 2) {
            if (!currentRounds[room]) currentRounds[room] = 1;
            
            if (currentRounds[room] < tournamentRounds[room]) {
                currentRounds[room]++;
               
                // Notifying both players
                players.forEach(player => {
                    io.to(player.id).emit('playNextRound', { round: currentRounds[room] });
                    console.log('sending startNextRound to', player.id);

                });
            }
            else {
                io.to(room).emit('gameOver', { message: '🏁 Tournament Over!' })
            }

            // Reset moves and votes
            playerMoves[room] = [];
            playAgainVotes[room].clear();
        }
    })



    // socket disconnect
    socket.on('disconnect', () => {
        console.log(`Socket disconnected ${socket.id}`);
    });
})

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Connected to database with port ${PORT}`)
})