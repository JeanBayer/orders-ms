import 'dotenv/config';
import z from 'zod';

const EnvSchema = z.object({
  PORT: z.number({ coerce: true }),
  DATABASE_URL: z.string(),
  NATS_SERVERS: z.string().transform((val) => val.split(',')),
});

const env = EnvSchema.safeParse(process.env);

if (!env.success) {
  console.error('Invalid environment variables:', env.error.format());
  process.exit(1);
}

export const envs = env.data;
