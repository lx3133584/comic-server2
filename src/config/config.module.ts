import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

export default ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    // .env.default
    SECRET: Joi.string().required(),
    PAGE_SIZE: Joi.number().default(15),
    COVER_IMG_DOMAIN: Joi.string().required(),
    CONTENT_IMG_DOMAINS: Joi.string().required(),
    RANK_TYPES: Joi.string().required(),
    // .env.database
    MYSQL_HOST: Joi.string().required(),
    MYSQL_PORT: Joi.number().default(3306),
    MYSQL_USERNAME: Joi.string().required(),
    MYSQL_PASSWORD: Joi.string().required(),
    MYSQL_DATABASE: Joi.string().required(),
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_DB: Joi.number().default(0),
    REDIS_PASSWORD: Joi.string().required(),
  }),
  envFilePath: ['.env.default', '.env.database'],
});
