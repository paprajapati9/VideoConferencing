//require dependencies
const { Socket } = require("dgram");
const express = require("express");
const app = express();
const server = require("http").Server(app); //create http server
const port = process.env.PORT || 5000;
const io = require('socket.io')(server); //create a socket io server
const { v4: uuidv4 } = require("uuid"); //used to create unique room id

const { ExpressPeerServer } = require("peer"); //create express peer server
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/',
});
app.use('/', peerServer); 

//declare application of dependencies

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`); //redirect to unique room
});

app.set("view engine", "ejs"); // setting default template use to ejs
app.use(express.static("assets")); // delaring assets folder as static to include it's files

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room }); //pass room.ejs template
});

io.on("connection", socket=>{ //on establishing a socket connection
	socket.on("join-room", (roomId, userId, userName) => { //when peer joins the room
		socket.join(roomId); //assign peer's socket in the room
		socket.broadcast.emit("user-connected", userId); //send message of the peer joining to every other peer
		socket.on("message", message => { //when a peer send's a message
			io.to(roomId).emit("serverMessage", message, userName); //emit message to all peer clients
		})
	});
	
});

//start server
server.listen(port, ()=>{
    console.log("Listening to the port "+ port);
})