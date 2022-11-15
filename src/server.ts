import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import accountRoutes from './routes/account';
import appRoutes from './routes/app';
import providerRoutes from './routes/provider';
import eventRoutes from './routes/event';
import webhookRoutes from './routes/webhook';
import authRoutes from './routes/auth';
import notificationRoutes from './routes/notifications';
import userRoutes from './routes/user';
import sendRoutes, { sendEventArgs, sendEventFromApiKey } from './routes/send';
import { RabbitMqConnection } from './rabbitmq';
import { Message } from 'amqplib';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
const port = 3000;

function setUpParsing(app: Express): void {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.text({ type: 'text/html' }));
}

function setUpSecurityHeaders(app: Express): void {
  app.use((_, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    next();
  });
}

var whitelist = ['http://localhost:3000' /** other domains if any */];
var corsOptions = {
  credentials: true,
  origin: true
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/images', express.static(path.join(__dirname, 'static', 'provider')));

setUpSecurityHeaders(app);
setUpParsing(app);

app.use('/account', accountRoutes);
app.use('/auth', authRoutes);
app.use('/providers', providerRoutes);
app.use('/events', eventRoutes);
app.use('/apps', appRoutes, sendRoutes);
app.use('/send', sendRoutes);
app.use('/notifications', notificationRoutes);
app.use('/users', userRoutes);
app.use(webhookRoutes);

app.listen(port, async () => {
  console.log(`Near notification platform is running on port ${port}.`);

  const rabbitMqConnection = new RabbitMqConnection();
  await rabbitMqConnection.setUp();
  await rabbitMqConnection.channel.consume('nnp-msg-queue', async (msg) => {
    if (msg?.content) {
      const sendParams = JSON.parse(msg?.content.toString()) as sendEventArgs;
      await sendEventFromApiKey(sendParams);
    }
    rabbitMqConnection.channel.ack(msg as Message);
  });
});
