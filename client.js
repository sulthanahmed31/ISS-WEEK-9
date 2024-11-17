const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto");

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

let username = "";

// Function to verify the integrity of received messages
const verifyMessage = (message, hash) => {
  const recalculatedHash = crypto.createHash("sha256").update(message).digest("hex");
  return recalculatedHash === hash;
};

socket.on("connect", () => {
  console.log("Connected to the server");

  rl.question("Enter your username: ", (input) => {
    username = input;
    console.log(`Welcome, ${username} to the chat`);
    rl.prompt();

    rl.on("line", (message) => {
      if (message.trim()) {
        const hash = crypto.createHash("sha256").update(message).digest("hex");
        socket.emit("message", { username, message, hash });
      }
      rl.prompt();
    });
  });
});

socket.on("message", (data) => {
  const { username: senderUsername, message: senderMessage, hash } = data;

  if (senderUsername !== username) {
    if (verifyMessage(senderMessage, hash)) {
      console.log(`${senderUsername}: ${senderMessage}`);
    } else {
      console.warn(`Warning: Message from ${senderUsername} may have been altered during transmission`);
    }
    rl.prompt();
  }
});

socket.on("disconnect", () => {
  console.log("Server disconnected, Exiting...");
  rl.close();
  process.exit(0);
});

rl.on("SIGINT", () => {
  console.log("\nExiting...");
  socket.disconnect();
  rl.close();
  process.exit(0);
});
