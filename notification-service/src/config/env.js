const { z } = require('zod');
const dotenv = require('dotenv');

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3006'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AWS_REGION: z.string().default('us-east-1'),
  NOTIFICATION_TABLE: z.string(),
  EMAIL_PROVIDER: z.enum(['MOCK', 'SES']).default('MOCK'),
  SMS_PROVIDER: z.enum(['MOCK', 'SNS']).default('MOCK'),
  EVENT_PROVIDER: z.enum(['SNS', 'SQS', 'EVENTBRIDGE', 'NONE']).default('NONE'),
  SNS_TOPIC_ARN: z.string().optional(),
  QUEUE_URL: z.string().optional(),
  EVENT_BUS_NAME: z.string().optional(),
  SES_FROM_EMAIL: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:\n', _env.error.format());
  process.exit(1);
}

module.exports = _env.data;
