require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const viajeRoutes = require('./routes/viaje.routes');
const conceptoRoutes = require('./routes/concepto.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/viajes', viajeRoutes);
app.use('/api/conceptos', conceptoRoutes);
app.use('/api/dependencias', require('./routes/dependencia.routes'));
app.use('/api/upload', require('./routes/upload_exceljs'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;