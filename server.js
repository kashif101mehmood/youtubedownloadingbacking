require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const creditRoutes = require('./routes/credits');
const referralRoutes = require('./routes/referral');
const downloadRoutes = require('./routes/downloadRoutes');
// ...



const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('OK');
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/download', downloadRoutes);

// Test database connection
const pool = require('./config/database');
pool.query('SELECT 1')
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection failed:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});