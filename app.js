require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const { razorpayWebhookController } = require('./controllers/payment_link.controller');

const allowedOrigins = [
  "http://localhost:5173",
  "https://mpoket.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.post('/api/payment-links/webhook/razorpay', express.raw({ type: 'application/json' }), razorpayWebhookController);
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const serviceRoutes = require('./routes/services.routes');
const paymentLinkRoutes = require('./routes/payment_links.routes');
const razorpayRoutes = require('./routes/razorpay.routes');

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payment-links', paymentLinkRoutes);
app.use('/api/razorpay', razorpayRoutes);

const errorMiddleware = require('./middlewares/error.middleware');
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
