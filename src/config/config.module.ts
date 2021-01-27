import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';

export default ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    SECRET: Joi.string().required(),
    PAGE_SIZE: Joi.number().default(15),
    COVER_IMG_DOMAIN: Joi.string().required(),
    CONTENT_IMG_DOMAINS: Joi.string().required(),
    RANK_TYPES: Joi.string().required(),
    MYSQL_HOST: Joi.string().required(),
    MYSQL_PORT: Joi.number().required(),
    MYSQL_USERNAME: Joi.string().required(),
    MYSQL_PASSWORD: Joi.string().required(),
    MYSQL_DATABASE: Joi.string().required(),
  }),
  envFilePath: ['.env.default', '.env.database'],
});
