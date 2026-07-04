/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { environment } from '../environment';
import { Logger } from '../util/logger';
import { getMetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUi from 'swagger-ui-express';

export const SwaggerLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  const log = Logger.for(
    __filename, [ 'SWAGGER' ]
  );
  const url = `${environment.app.publicUrl}`;

  if (settings && environment.swagger.enabled) {
    log.info('Loading Swagger');
    // API docs are non-essential: if spec generation blows up (historically
    // from a class-validator / class-validator-jsonschema version mismatch in
    // a stale install), log it and boot without docs instead of crashing.
    try {
      const expressApp = settings.getData('express_app');
      // Pass the storage from the same class-validator instance the models
      // registered with, rather than letting the library look it up.
      const schemas = validationMetadatasToSchemas({
        classValidatorMetadataStorage: getMetadataStorage(),
      });
      const swaggerFile = routingControllersToSpec(
        getMetadataArgsStorage(),
        {},
        {
          components: {
            schemas,
          },
          info: {
            description: environment.app.description,
            title: environment.app.name,
            version: environment.app.version,
          },
          servers: [
            {
              url: `${url}/${environment.api.route}`,
            },
          ],
        },
      );
      expressApp.use(
        `/${environment.swagger.route}`,
        (
          request, response, next
        ) => next(),
        swaggerUi.serve,
        swaggerUi.setup(swaggerFile),
      );
    } catch (error) {
      log.error('Swagger failed to initialize; continuing without API docs.', error);
    }
  }
};
