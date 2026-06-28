/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { environment } from '../environment';
import { Logger } from '../util/logger';
import * as Models from '../api/models';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework';
import { Container } from 'typedi';
import { DataSource, DataSourceOptions } from 'typeorm';

export const TypeOrmLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
  const log = Logger.for(
    __filename, [ 'ORM' ]
  );

  log.info('Loading ORM');
  const options: DataSourceOptions = {
    database: environment.database.database,
    entities: Object.values(Models),
    // The pg driver pool. The party loop and GraphQL field resolvers each open
    // several short-lived queries, so a too-small pool serialises requests and
    // shows up as lag once a few dozen users are active. Size the pool well
    // above the default (10) and fail fast rather than hang when it is drained.
    extra: {
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30_000,
      max: 30,
    },
    host: environment.database.host,
    // Per-query logging is expensive at scale; keep only errors and warnings.
    logging: [ 'error', 'warn' ],
    password: environment.database.password,
    port: environment.database.port,
    ssl: { rejectUnauthorized: false },
    synchronize: true,
    type: environment.database.type as never,
    username: environment.database.username,
  };
  log.info('Connecting to DB');
  const dataSource = await new DataSource(options).initialize();

  // Register the DataSource so services can resolve their repositories from it
  // (TypeORM 0.3 dropped the global getRepository / custom-repository DI).
  Container.set(DataSource, dataSource);

  if (settings) {
    settings.setData(
      'connection', dataSource
    );
    settings.onShutdown(() => dataSource.destroy());
  }
};
