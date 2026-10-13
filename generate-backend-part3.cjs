const fs = require('fs');
const path = require('path');

const serverJsPath = path.join(__dirname, 'server', 'server.js');
let serverJs = fs.readFileSync(serverJsPath, 'utf8');

if (!serverJs.includes('/api/users')) {
    serverJs = serverJs.replace(
        "app.use('/api/auth', require('./routes/auth'));",
        "app.use('/api/auth', require('./routes/auth'));\\napp.use('/api/users', require('./routes/users'));\\napp.use('/api/dashboard', require('./routes/dashboard'));"
    );
}

if (!serverJs.includes('errorMiddleware')) {
    serverJs = serverJs.replace(
        "const PORT =",
        "const errorMiddleware = require('./middleware/errorMiddleware');\\napp.use(errorMiddleware);\\n\\nconst PORT ="
    );
}

fs.writeFileSync(serverJsPath, serverJs);
console.log("server.js updated");
