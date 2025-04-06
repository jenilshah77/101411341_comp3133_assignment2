import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache, ApolloLink, HttpLink } from '@apollo/client/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { createHttpLink } from '@apollo/client/link/http';

export function createApollo(httpClient: HttpClient): ApolloClientOptions<any> {
  const httpLink = createHttpLink({
    uri: environment.apiUrl
  });

  return {
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    }
  };
}

export const graphqlProvider = [
  Apollo,
  {
    provide: APOLLO_OPTIONS,
    useFactory: createApollo,
    deps: [HttpClient],
  },
]; 