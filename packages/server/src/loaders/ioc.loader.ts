/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Logger } from '../util/logger';
import { useContainer as classValidatorUseContainer } from 'class-validator';
import { useContainer as cronUseContainer } from 'cron-decorators';
import { MicroframeworkLoader } from 'microframework';
import { useContainer as routingUseContainer } from 'routing-controllers';
import { Container } from 'typedi';


export const IocLoader: MicroframeworkLoader = () => {
  const log = Logger.for(
    __filename, [ 'IOC' ]
  );
  log.info('Loading Containers');
  // TypeORM 0.3 removed useContainer; repositories now come from the
  // DataSource registered in the container by the TypeOrm loader.
  routingUseContainer(Container);
  cronUseContainer(Container);
  classValidatorUseContainer(Container);
};
