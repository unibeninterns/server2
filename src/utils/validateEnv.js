import dotenv from 'dotenv';
import { cleanEnv, str, port, url, email, num } from 'envalid';
dotenv.config();

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
    PORT: num({ default: 3000 }),
    MONGODB_URI: url(),
    FRONTEND_URL: url(),
    LOG_LEVEL: str({
      choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    }),
    SMTP_HOST: str(),
    SMTP_PORT: port(),
    SMTP_USER: str(),
    SMTP_PASS: str(),
    EMAIL_FROM: email(),
    REVIEWER_EMAIL: email(),
    API_URL: url(),
  });
};

export default validateEnv;
