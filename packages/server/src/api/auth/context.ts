/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { validateTokenAndGetState } from './util';
import { Context } from '../types';
import { createLoaders } from '../dataloaders';
import { Request } from 'express';
import { Container } from 'typedi';
import { v4 } from 'uuid';

// HTTP (query/mutation) context built per request by Apollo's express middleware.
export const context = async ({ req }: { req: Request }): Promise<Context> => {
  const token = req.headers.authorization;
  const { user, member, party } = await validateTokenAndGetState(token);
  const requestId = v4();
  const container = Container.of(requestId);
  const c: Context = {
    container,
    loaders: createLoaders(),
    member,
    party,
    requestId,
    user,
  };
  container.set(
    'context', c
  );
  return c;
};

// WebSocket (subscription) context. graphql-ws delivers payloads outside the
// express request lifecycle, so we provide fresh DataLoaders for the field
// resolvers that run on the published entities. Auth, when present, is read
// from the connection params sent by the client on connect.
export const wsContext = async (
  connectionParams?: Record<string, unknown>
): Promise<Context> => {
  const token =
    typeof connectionParams?.Authorization === 'string'
      ? (connectionParams.Authorization as string)
      : undefined;
  const { user, member, party } = await validateTokenAndGetState(token);
  return {
    container: Container.of(undefined),
    loaders: createLoaders(),
    member,
    party,
    requestId: v4(),
    user,
  } as Context;
};
