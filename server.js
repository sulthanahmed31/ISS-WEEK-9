const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");

const server = http.createServer();
const io = socketIo(server);

// Function to generate a hash for a given message
const generateHash = (message) => {
  return crypto.createHash("sha256").update(message).digest("hex");
};

io.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected`);

  socket.on("message", (data) => {
    const { username, message } = data;

    // Generate hash for the message
    const hash = generateHash(message);

    // Emit the message along with its hash to all clients
    io.emit("message", { username, message, hash });
  });

  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected`);
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
