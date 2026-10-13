const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("Starting Migration to MERN Stack...");

// 1. Move everything (except client/server/node_modules/etc) to client
const root = __dirname;
const client = path.join(root, 'client');
const server = path.join(root, 'server');

const keepInRoot = ['client', 'server', 'node_modules', '.git', 'migrate.js', 'package-lock.json'];
const files = fs.readdirSync(root);

files.forEach(f => {
    if (!keepInRoot.includes(f)) {
        const oldPath = path.join(root, f);
        const newPath = path.join(client, f);
        try {
            fs.renameSync(oldPath, newPath);
            console.log(`Moved ${f} to client/`);
        } catch (e) {
            console.log(`Failed to move ${f}: ${e.message}`);
        }
    }
});

// 2. Setup Server
console.log("Setting up Server...");
const serverFiles = {
    'server.js': `
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mern-app')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port', PORT));
    `,
    '.env': 'PORT=5000\nMONGO_URI=mongodb://localhost:27017/mern-app\nJWT_SECRET=supersecret\n'
};

for (const [filename, content] of Object.entries(serverFiles)) {
    fs.writeFileSync(path.join(server, filename), content);
}

// Ensure server package.json exists (already created by previous step)

console.log("Migration script complete. Reviewing client configuration...");
