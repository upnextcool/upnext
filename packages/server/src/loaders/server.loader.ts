/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { environment } from '../environment';
import { Logger } from '../util/logger';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework';

export const ServerLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  const log = Logger.for(
    __filename, [ 'SERVER' ]
  );

  if (settings) {
    log.info('Loading Server');
    settings.getData('server').listen(
      environment.app.port, () => {
        log.info(`Server Listening on ${environment.app.port}`);
      }
    );
  }
};
