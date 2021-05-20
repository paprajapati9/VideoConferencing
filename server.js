//require dependencies
const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
      origin: '*'
    }
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
app.use("/peerjs", peerServer);

//declare application of dependencies
app.use(express.json());

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.set("view engine", "ejs");
app.use(express.static("assets"));

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
      socket.join(roomId);
      socket.to(roomId).broadcast.emit("user-connected", userId);
      socket.on("message", (message) => {
        io.to(roomId).emit("createMessage", message, userName);
      });
    });
});

//start server
const port = process.env.PORT || 3030;
server.listen(port, ()=>{
    console.log("Listening to the port "+ port);
})