const net = require("net");
const Parser = require("redis-parser");

// Initialize an in-memory store object
const store = {
  _sets: {},
  _lists: {},
};

// Create a new TCP server
const server = net.createServer((connection) => {
  console.log("Client Connected....");

  // Create a Redis parser 
  const parser = new Parser({
    returnReply: (reply) => {
      const command = reply[0];
      switch (command) {
        case "set": {
          const key = reply[1];
          const value = reply[2];
          store[key] = value;
          connection.write("+OK\r\n");
          break;
        }
        case "get": {
          const key = reply[1];
          const value = store[key];
          if (value === undefined) {
            connection.write("$-1\r\n"); 
          } else {
            connection.write(`$${value.length}\r\n${value}\r\n`);
          }
          break;
        }
        case "del": {
          const key = reply[1];
          if (store[key] !== undefined) {
            delete store[key];
            connection.write(":1\r\n"); 
          } else {
            connection.write(":0\r\n"); 
          }
          break;
        }
        case "exists": {
          const key = reply[1];
          if (store[key] !== undefined) {
            connection.write(":1\r\n");
          } else {
            connection.write(":0\r\n");
          }
          break;
        }
        case "keys": {
          const pattern = reply[1];
          const regex = new RegExp(pattern.replace("*", ".*"));
          const matchedKeys = Object.keys(store).filter((key) =>
            regex.test(key)
          );
          const response =
            `*${matchedKeys.length}\r\n` +
            matchedKeys.map((key) => `$${key.length}\r\n${key}\r\n`).join("");
          connection.write(response);
          break;
        }
        case "setnx": {
          const key = reply[1];
          const value = reply[2];
          if (store[key] === undefined) {
            store[key] = value;
            connection.write(":1\r\n"); 
          } else {
            connection.write(":0\r\n"); 
          }
          break;
        }
        case "expire": {
          const key = reply[1];
          const seconds = reply[2];
          store[`_expires_${key}`] = Date.now() + seconds * 1000;
          connection.write(":1\r\n"); 
          break;
        }
        case "ttl": {
          const key = reply[1];
          const expiry = store[`_expires_${key}`];
          if (expiry) {
            const ttl = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
            connection.write(`:${ttl}\r\n`); 
          } else {
            connection.write(":-1\r\n"); 
          }
          break;
        }
        case "lpush": {
          const key = reply[1];
          const values = reply.slice(2);
          if (!store._lists[key]) store._lists[key] = [];
          store._lists[key].unshift(...values);
          connection.write(`:${values.length}\r\n`); 
          break;
        }
        case "rpush": {
          const key = reply[1];
          const values = reply.slice(2);
          if (!store._lists[key]) store._lists[key] = [];
          store._lists[key].push(...values);
          connection.write(`:${values.length}\r\n`); 
          break;
        }
        case "lpop": {
          const key = reply[1];
          const list = store._lists[key];
          if (list && list.length > 0) {
            const value = list.shift();
            connection.write(`$${value.length}\r\n${value}\r\n`);
          } else {
            connection.write("$-1\r\n"); 
          }
          break;
        }
        case "rpop": {
          const key = reply[1];
          const list = store._lists[key];
          if (list && list.length > 0) {
            const value = list.pop();
            connection.write(`$${value.length}\r\n${value}\r\n`);
          } else {
            connection.write("$-1\r\n");
          }
          break;
        }
        case "lrange": {
          const key = reply[1];
          const start = parseInt(reply[2], 10);
          const end = parseInt(reply[3], 10);
          const list = store._lists[key];
          if (list) {
            const result = list
              .slice(start, end + 1)
              .map((value) => `$${value.length}\r\n${value}\r\n`)
              .join("");
            connection.write(
              `*${result.split("\r\n").length / 2}\r\n${result}`
            );
          } else {
            connection.write("*0\r\n"); 
          }
          break;
        }
        case "sadd": {
          const key = reply[1];
          const values = reply.slice(2);
          if (!store._sets[key]) store._sets[key] = new Set();
          const added = values.filter((value) => !store._sets[key].has(value));
          added.forEach((value) => store._sets[key].add(value));
          connection.write(`:${added.length}\r\n`); 
          break;
        }
        case "smembers": {
          const key = reply[1];
          const set = store._sets[key];
          if (set) {
            const members = Array.from(set)
              .map((value) => `$${value.length}\r\n${value}\r\n`)
              .join("");
            connection.write(`*${set.size}\r\n${members}`);
          } else {
            connection.write("*0\r\n"); 
          }
          break;
        }
        case "srem": {
          const key = reply[1];
          const values = reply.slice(2);
          const set = store._sets[key];
          if (set) {
            const removed = values.filter((value) => set.delete(value));
            connection.write(`:${removed.length}\r\n`); 
          } else {
            connection.write(":0\r\n"); 
          }
          break;
        }
        case "sismember": {
          const key = reply[1];
          const value = reply[2];
          const set = store._sets[key];
          if (set && set.has(value)) {
            connection.write(":1\r\n"); 
          } else {
            connection.write(":0\r\n"); 
          }
          break;
        }
        case "setex": {
          const key = reply[1];
          const seconds = reply[2];
          const value = reply[3];
          store[key] = value;
          store[`_expires_${key}`] = Date.now() + seconds * 1000;
          connection.write("+OK\r\n");
          break;
        }
        default:
          connection.write("-ERR unknown command\r\n");
      }
    },
    returnError: (err) => {
      console.log("Error:", err);
    },
  });

  // Process incoming data
  connection.on("data", (data) => {
    parser.execute(data);
  });

  connection.on("end", () => {
    console.log("Client Disconnected....");
  });
});

// Listen on port 8000
server.listen(8000, () => {
  console.log("Custom Redis Server listening on port 8000");
});
