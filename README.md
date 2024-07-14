# Custom Redis Server

A simple implementation of Redis commands in Node.js. This project is designed to mimic basic Redis functionalities, including handling string commands, lists, and sets. It serves as an educational tool for understanding how Redis commands work and how to implement a basic key-value store.

## Features

- **String Commands**: `SET`, `GET`, `SETNX`, `EXPIRE`, `TTL`
- **List Commands**: `LPUSH`, `RPUSH`, `LPOP`, `RPOP`, `LRANGE`
- **Set Commands**: `SADD`, `SMEMBERS`, `SREM`, `SISMEMBER`
- **Key Commands**: `DEL`, `EXISTS`, `KEYS`
- **Command Parsing**: Uses the `redis-parser` library to handle Redis protocol.

## Installation

To run this project on your local machine, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/custom-redis-server.git

   
2. **Navigate to the Project Directory**

   ```bash
   cd custom-redis-server

   
3. **Install Dependencies**
   Ensure you have Node.js installed, then run:

   ```bash
   npm install


## Usage

To start the custom Redis server, run:

```bash
node index.js
```
The server will listen on port 8000. You can connect to it using the redis-cli tool or any Redis client:

```bash
redis-cli -p 8000
```

## Example Commands
```bash
127.0.0.1:8000> set name1 komal
OK
127.0.0.1:8000> get name1
"komal"
127.0.0.1:8000> lpush mylist a b c
:3
127.0.0.1:8000> lrange mylist 0 -1
*3
$a
a
$b
b
$c
c
127.0.0.1:8000> sadd myset a b c
:3
127.0.0.1:8000> smembers myset
*3
$a
a
$b
b
$c
c
127.0.0.1:8000> srem myset a
:1
127.0.0.1:8000> exists name1
:1
127.0.0.1:8000> ttl name1
:10
```

## Acknowledgements
[Redis Documentation](https://redis.io/docs/latest/commands/)
[cNode.js Documentation](https://nodejs.org/docs/latest/api/)
[redis-parser Library](https://www.npmjs.com/package/redis-parser)

