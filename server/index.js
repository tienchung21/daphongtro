const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const tinDangRoutes = require('./routes/tinDangRoutes');
const khuVucRoutes = require('./routes/khuVucRoutes'); // <-- thêm
const yeuThichRoutes = require('./routes/yeuThichRoutes');
const app = express();
app.use(cors());
app.use(express.json());

// Định nghĩa API
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);
app.use('/api/tindangs', tinDangRoutes); 
app.use('/api/khuvucs', khuVucRoutes);
app.use('/api/yeuthich', yeuThichRoutes);

app.get('/', (req, res) => {
  res.send('API server đang chạy ');
});

app.listen(5000, () => {
  console.log('✅ Server chạy tại http://localhost:5000');
});
