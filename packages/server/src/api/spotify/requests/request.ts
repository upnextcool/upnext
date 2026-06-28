/**
 * Copyright (c) 2021, Ethan Elliott
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import http from 'http';
import https from 'https';

import { GenericError } from '../error';
import { HttpMethods } from '../types';
import { RequestBuilder } from './request-builder';

/**
 * A single shared axios instance with keep-alive enabled. The party loop polls
 * Spotify once per second per party, so without connection reuse every call
 * pays for a fresh TCP + TLS handshake. Re-using sockets keeps latency and
 * file-descriptor usage low when many parties are active at once.
 */
const keepAliveHttpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const keepAliveHttpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

const spotifyHttpClient: AxiosInstance = axios.create({
  httpAgent: keepAliveHttpAgent,
  httpsAgent: keepAliveHttpsAgent,
  timeout: 10_000,
});

export class Request {
    private readonly method: HttpMethods;

    private readonly host: string;

    private readonly scheme: string;

    private readonly path: string;

    private readonly headers: Record<string, unknown>;

    private readonly queryParameters: Record<string, unknown>;

    private readonly bodyParameters: Record<string, unknown>;

    constructor(builder: RequestBuilder) {
      // eslint-disable-next-line immutable/no-mutation
      this.method = builder.method;
      // eslint-disable-next-line immutable/no-mutation
      this.host = builder.host;
      // eslint-disable-next-line immutable/no-mutation
      this.scheme = builder.scheme;
      // eslint-disable-next-line immutable/no-mutation
      this.path = builder.path;
      // eslint-disable-next-line immutable/no-mutation
      this.headers = builder.headers;
      // eslint-disable-next-line immutable/no-mutation
      this.queryParameters = builder.queryParameters;
      // eslint-disable-next-line immutable/no-mutation
      this.bodyParameters = builder.bodyParameters;
    }

    public async execute<T>(): Promise<T> {
      try {
        return (await this.makeAxios()).data as T;
      } catch (error) {
        const spotifyError = error?.response?.data?.error;
        if (spotifyError) {
          throw new GenericError(
            spotifyError.status, spotifyError.message, error.stack
          );
        }
        // Network failures and timeouts have no Spotify error payload to unwrap.
        throw new GenericError(
          error?.response?.status ?? 503, error?.message ?? 'Spotify request failed', error?.stack
        );
      }
    }

    private getURI(): string {
      return `${this.scheme}://${this.host}${this.path}`;
    }

    private makeAxios(): Promise<AxiosResponse> {
      switch (this.method) {
      case HttpMethods.DELETE:
        return spotifyHttpClient.request({
          headers: this.headers,
          method: 'delete',
          params: this.queryParameters,
          url: this.getURI()
        });
      case HttpMethods.GET:
        return spotifyHttpClient.request({
          headers: this.headers,
          method: 'get',
          params: this.queryParameters,
          url: this.getURI()
        });
      case HttpMethods.POST:
        if (this.bodyParameters) {
          return spotifyHttpClient.request({
            data: this.bodyParameters,
            headers: this.headers,
            method: 'post',
            params: this.queryParameters,
            url: this.getURI()
          });
        }
        return spotifyHttpClient.request({
          headers: this.headers,
          method: 'post',
          params: this.queryParameters,
          url: this.getURI()
        });

      case HttpMethods.PUT:
        return spotifyHttpClient.request({
          data: this.bodyParameters,
          headers: this.headers,
          method: 'put',
          params: this.queryParameters,
          url: this.getURI()
        });
      default:
        throw new Error(`Invalid HTTP method: ${this.method}`);
      }
    }
}
