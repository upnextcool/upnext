/**
 * Copyright (c) 2021, Ethan Elliott
 */

import {
  CronLoader,
  ExpressLoader,
  FileLoader,
  GraphqlLoader,
  HomeLoader,
  HttpLoader,
  IocLoader,
  LoggerLoader,
  ServerLoader,
  SwaggerLoader,
  TypeOrmLoader,
} from './loaders';
import { Logger } from './util/logger';
import { bootstrapMicroframework } from 'microframework';

import { banner } from './util/banner';

export class UpNextServer {
  private log = Logger.for(__filename);

  static getInstance(): UpNextServer {
    return new UpNextServer();
  }

  async main(): Promise<void> {
    await bootstrapMicroframework({
      config: {
        debug: true,
        showBootstrapTime: true,
      },
      loaders: [
        LoggerLoader,
        HttpLoader,
        IocLoader,
        TypeOrmLoader,
        ExpressLoader,
        SwaggerLoader,
        HomeLoader,
        FileLoader,
        ServerLoader,
        GraphqlLoader,
        CronLoader
      ],
    });
    await banner(this.log);
  }
}
