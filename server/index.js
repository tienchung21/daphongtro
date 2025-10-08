const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Định nghĩa API
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('API server đang chạy ');
});

app.listen(5000, () => {
  console.log('✅ Server chạy tại http://localhost:5000');
});
