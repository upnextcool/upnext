/**
 * Copyright (c) 2021, Ethan Elliott
 */

import * as Controllers from '../api/controllers';
import { environment } from '../environment';
import * as CronJobs from '../api/jobs';
import * as Loaders from '../loaders';
import { Logger } from './logger';
import * as Middlewares from '../middleware';
import * as Models from '../api/models';
import * as Resolvers from '../api/resolvers';
import * as Services from '../api/services';

export const banner = (log: Logger): void => {
  const route = () => `${environment.app.schema}://${environment.app.host}:${environment.app.port}/`;
  log.info('-------------------------------------------------------------------------------------------------');
  log.info('');
  log.info(`${environment.app.name}`);
  log.info('');
  log.info('-------------------------------------------------------------------------------------------------');
  log.info(`Environment  : ${environment.node}`);
  log.info(`Version      : ${environment.app.version}`);
  log.info('');
  log.info(`API Info     : ${route()}${environment.api.route}`);
  if (environment.swagger.enabled) {
    log.info(`Swagger      : ${route()}${environment.swagger.route}`);
  }
  if (environment.graphql.enabled) {
    log.info(`Graphql      : ${route()}${environment.graphql.route}`);
  }
  log.info('-------------------------------------------------------');
  log.info(`Loaded Loaders: [${Object.keys(Loaders)}]`);
  log.info(`Loaded Entities: [${Object.keys(Models)}]`);
  log.info(`Loaded Controllers: [${Object.keys(Controllers)}]`);
  log.info(`Loaded Resolvers: [${Object.keys(Resolvers)}]`);
  log.info(`Loaded Middlewares: [${Object.keys(Middlewares)}]`);
  log.info(`Loaded Services: [${Object.keys(Services)}]`);
  log.info(`Loaded Jobs: [${Object.keys(CronJobs)}]`);
  log.info('-------------------------------------------------------');
  log.info('');
};
