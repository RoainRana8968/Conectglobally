const http = require("http");
require("dotenv").config();
let database=require("./config/db")
database();
const { Server } = require("socket.io");
let app=require("./app");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});


const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
app.set("io", io);
