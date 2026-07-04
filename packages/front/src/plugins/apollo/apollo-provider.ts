import router from '../../router';
import VueApollo from 'vue-apollo';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, split } from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import {Environment} from "../../environment";

export function getProvider() {
  const serviceUrl = () => `${Environment.instance.config.serverUrl}/graphql`

  const httpLink = new HttpLink({
    uri: serviceUrl(),
  });

  // Read the token per-request instead of once at startup, so a login/join
  // that happens after the app boots is picked up without a page reload.
  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext({
      headers: {
        Authorization: localStorage.getItem('token') || '',
      },
    });
    return forward(operation);
  });

  // Subscriptions over the modern graphql-ws protocol to match the server.
  // The auth token is sent as a connection param the server reads on connect;
  // graphql-ws connects lazily (on the first subscription), so the token from
  // joining a party is available by the time connectionParams is evaluated.
  const wsLink = new GraphQLWsLink(
    createClient({
      connectionParams: () => ({
        Authorization: localStorage.getItem('token') || '',
      }),
      url: serviceUrl().replace('http', 'ws'),
    })
  );

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    authLink.concat(httpLink)
  );

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });

  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    errorHandler: (error) => {
      const parsedError = JSON.parse(JSON.stringify(error)).gqlError;
      if (
        parsedError &&
        parsedError.extensions.code === 'INTERNAL_SERVER_ERROR' &&
        localStorage.getItem('token') !== null &&
        parsedError.message.includes('permission')
      ) {
        router.push('/logout');
      }
    },
  });

  return {
    apolloClient,
    apolloProvider,
  };
}
