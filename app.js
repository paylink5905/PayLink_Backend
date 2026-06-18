require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/services.routes');
const paymentLinkRoutes = require('./routes/payment_links.routes');

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payment-links', paymentLinkRoutes);

const errorMiddleware = require('./middlewares/error.middleware');
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});