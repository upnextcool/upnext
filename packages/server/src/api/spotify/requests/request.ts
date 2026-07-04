/**
 * Copyright (c) 2021, Ethan Elliott
 */

import axios, { AxiosInstance, AxiosResponse, Method, RawAxiosRequestHeaders } from 'axios';
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
      this.method = builder.method;
      this.host = builder.host;
      this.scheme = builder.scheme;
      this.path = builder.path;
      this.headers = builder.headers;
      this.queryParameters = builder.queryParameters;
      this.bodyParameters = builder.bodyParameters;
    }

    public async execute<T>(): Promise<T> {
      try {
        return (await this.makeAxios()).data as T;
      } catch (error) {
        throw this.toGenericError(error);
      }
    }

    // Spotify errors arrive in several shapes: the Web API JSON envelope
    // ({ error: { status, message } }), the accounts endpoint's OAuth shape
    // ({ error, error_description }), and for some 403s (e.g. a user not
    // allow-listed on a development-mode app) a plain-text body. Surface
    // whichever detail exists plus the endpoint, instead of axios's generic
    // "Request failed with status code N".
    private toGenericError(error): GenericError {
      const status = error?.response?.status;
      const detail = Request.extractErrorDetail(error?.response?.data)
        ?? error?.message
        ?? 'Spotify request failed';
      return new GenericError(
        status ?? 503,
        `${HttpMethods[this.method]} ${this.getURI()} failed: ${detail}`,
        error?.stack
      );
    }

    private static extractErrorDetail(data): string | undefined {
      if (!data) {
        return undefined;
      }
      if (typeof data === 'string') {
        const MAX_DETAIL_LENGTH = 300;
        return data.slice(0, MAX_DETAIL_LENGTH) || undefined;
      }
      if (typeof data.error === 'string') {
        return data.error_description
          ? `${data.error}: ${data.error_description}`
          : data.error;
      }
      return data.error?.message;
    }

    private getURI(): string {
      return `${this.scheme}://${this.host}${this.path}`;
    }

    private makeAxios(): Promise<AxiosResponse> {
      const methods: Record<HttpMethods, Method> = {
        [HttpMethods.DELETE]: 'delete',
        [HttpMethods.GET]: 'get',
        [HttpMethods.POST]: 'post',
        [HttpMethods.PUT]: 'put',
      };
      const method = methods[this.method];
      if (!method) {
        throw new Error(`Invalid HTTP method: ${this.method}`);
      }
      return spotifyHttpClient.request({
        // Bodies are only meaningful on POST/PUT; axios ignores `data` on
        // GET/DELETE, so passing it unconditionally is safe.
        data: this.bodyParameters,
        headers: this.headers as RawAxiosRequestHeaders,
        method,
        params: this.queryParameters,
        url: this.getURI()
      });
    }
}
