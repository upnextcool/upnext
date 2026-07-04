import router from '../../router';
import VueApollo from 'vue-apollo';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
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
        Authorization: localStorage.getItem('token') || null,
      },
    });
    return forward(operation);
  });

  const wsLink = new WebSocketLink({
    uri: serviceUrl().replace('http', 'ws'),
    options: {
      // Wait for the first subscription before connecting, so the token from
      // joining a party is available when connectionParams is evaluated.
      lazy: true,
      reconnect: true,
      connectionParams: () => ({
        Authorization: localStorage.getItem('token') || null,
      }),
    },
  });

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
    link,
    cache: new InMemoryCache(),
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
    apolloProvider,
    apolloClient,
  };
}
