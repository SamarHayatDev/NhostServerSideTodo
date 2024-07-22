import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

// Create an http link:
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL,
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL,
  options: {
    reconnect: true,
  },
});

// Using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
