/**
 * Copyright (c) 2021, Ethan Elliott
 */
import { authChecker } from '../api/auth/auth';
import { context, wsContext } from '../api/auth/context';
import { Context } from '../api/types';
import { environment } from '../environment';
import { Logger } from '../util/logger';
import * as Resolvers from '../api/resolvers';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { json } from 'body-parser';
import { Express } from 'express';
import { useServer } from 'graphql-ws/lib/use/ws';
import { Server } from 'http';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework';
import { buildSchema } from 'type-graphql';
import { Container } from 'typedi';
import { WebSocketServer } from 'ws';
import { UpNextPubSubEngine } from '../api/pubsub/pubsub';

export const GraphqlLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
  const log = Logger.for(
    __filename, [ 'GRAPHQL' ]
  );
  if (settings && environment.graphql.enabled) {
    log.info('Starting graphql');
    const app: Express = settings.getData('express_app');
    const httpServer: Server = settings.getData('server');
    const path = `/${environment.graphql.route}`;

    const schema = await buildSchema({
      authChecker,
      container: Container,
      pubSub: UpNextPubSubEngine.instance.engine,
      resolvers: Object.values(Resolvers) as never,
    });

    // Subscriptions over the modern graphql-ws protocol (replaces the legacy
    // subscriptions-transport-ws SubscriptionServer).
    const wsServer = new WebSocketServer({ path, server: httpServer });
    const serverCleanup = useServer(
      {
        context: (ctx) => wsContext(ctx.connectionParams as Record<string, unknown>),
        schema,
      },
      wsServer
    );

    const apolloServer = new ApolloServer<Context>({
      introspection: !environment.isProduction,
      plugins: [
        // Drain in-flight HTTP requests, then dispose the websocket server.
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
        // Release the per-request typedi child container once the response is sent.
        {
          async requestDidStart() {
            return {
              async willSendResponse(requestContext) {
                Container.reset(requestContext.contextValue.requestId);
              },
            };
          },
        },
      ],
      schema,
    });
    await apolloServer.start();

    // CORS is already applied globally by routing-controllers; Apollo 4 only
    // needs a JSON body parser on its own route.
    app.use(path, json(), expressMiddleware(apolloServer, { context }));
    log.info(`GraphQL ready at ${path} (HTTP + ws)`);
  }
};
