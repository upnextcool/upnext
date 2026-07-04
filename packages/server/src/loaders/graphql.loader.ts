/**
 * Copyright (c) 2021, Ethan Elliott
 */
import { authChecker } from '../api/auth/auth';
import { context } from '../api/auth/context';
import { validateTokenAndGetState } from '../api/auth/util';
import { environment } from '../environment';
import { Logger } from '../util/logger';
import * as Resolvers from '../api/resolvers';
import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { execute, subscribe } from 'graphql';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { buildSchema } from 'type-graphql';
import { Container } from 'typedi';
import {UpNextPubSubEngine} from "../api/pubsub/pubsub";

export const GraphqlLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
  const log = Logger.for(
    __filename, [ 'GRAPHQL' ]
  );
  if (settings && environment.graphql.enabled) {
    log.info('Starting graphql');
    const app: Express = settings.getData('express_app');
    const schema = await buildSchema({
      authChecker,
      container: Container,
      dateScalarMode: 'isoDate',
      resolvers: Object.values(Resolvers) as never,
      pubSub: UpNextPubSubEngine.instance.engine
    });

    const apolloServer = new ApolloServer({
      context,
      introspection: !environment.isProduction,
      logger: log,
      playground: !environment.isProduction,
      plugins: [
        {
          requestDidStart: () => ({
            willSendResponse(requestContext) {
              Container.reset(requestContext.context.requestId);
            },
          }),
        },
      ],
      schema,
    });
    apolloServer.applyMiddleware({
      app,
      path: `/${environment.graphql.route}`,
    });

    const server = settings.getData('server');
    const ss = new SubscriptionServer(
      {
        execute,
        // Keep intermediary proxies and mobile connections from silently
        // dropping idle sockets.
        keepAlive: 15_000,
        // Authenticate the websocket once at connection time; the resolved
        // state becomes the context for every subscription on this socket,
        // which the per-party subscription filters rely on.
        onConnect: (connectionParams: { Authorization?: string }) =>
          validateTokenAndGetState(connectionParams?.Authorization),
        schema,
        subscribe,
      }, {
        path: `/${environment.graphql.route}`,
        server,
      }
    );
    log.info(ss.server.path);
  }
};
