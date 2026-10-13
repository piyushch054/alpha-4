const fs = require('fs');

const content = `
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

dotenv.config();

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration (Strict for production)
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json({ limit: '10kb' })); // Limit body payload

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/register requests
  message: { success: false, message: 'Too many authentication attempts, please try again after an hour.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mern-app')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/kpi', require('./routes/kpi'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const errorMiddleware = require('./middleware/errorMiddleware');
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port', PORT));
`;
fs.writeFileSync('server/server.js', content.trim() + '\n');
