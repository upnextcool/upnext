import router from '../../router';
import VueApollo from 'vue-apollo';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import {Environment} from "../../environment";

export function getProvider() {
  const serviceUrl = () => `${Environment.instance.config.serverUrl}/graphql`

  const httpLink = new HttpLink({
    uri: serviceUrl(),
    headers: {
      Authorization: localStorage.getItem('token') || null,
    },
  });

  const wsLink = new WebSocketLink({
    uri: serviceUrl().replace('http', 'ws'),
    options: {
      reconnect: true,
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
    httpLink
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
