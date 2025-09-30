# Social Appliance

A console-based social network with a MongoDB-powered backend, implementing a wiki-like structure with entities and relationships.

## Running

1. Install server dependencies:
```bash
cd server
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
```

3. Configure environment:
Edit `server/.env` to set your MongoDB connection string and port.

4. Start MongoDB (if running locally):
```bash
mongod
brew services start mongodb-community
```

5. Start the server:
```bash
cd server
npm start
```

6. In another terminal, start the console client:
```bash
cd client-console
npm start
```

7. In another terminal, start the console web:
```bash
cd client-web
npm start
```

8. Tests can be run also
```bash
cd server
npm test
```

## Console Commands for console mode

- `help` - Show available commands
- `register <username>` - Create a new user account
- `login <username>` - Login as an existing user
- `ls` - List entities in current directory
- `cd <path>` - Navigate to a group or entity
- `create <group|post> <title>` - Create a new group or post
- `edit <slug>` - Edit an existing entity
- `view <slug>` - View entity details
- `delete <slug>` - Delete an entity
- `exit` - Exit the console
