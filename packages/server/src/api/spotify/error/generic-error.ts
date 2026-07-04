/**
 * Copyright (c) 2021, Ethan Elliott
 */

const BAD_GATEWAY = 502;

export class GenericError extends Error {
  public readonly httpCode: number;

  constructor(
    status: number | string, message: string, stack?: string
  ) {
    super(message ?? 'Spotify request failed');
    // A stable string name (the upstream status used to be stuffed in here,
    // which rendered as {"name":403} with no explanation) plus the status on
    // httpCode, which the error middleware uses for the response code.
    this.name = 'SpotifyApiError';
    this.httpCode = typeof status === 'number' ? status : Number.parseInt(status, 10) || BAD_GATEWAY;
    if (stack) {
      this.stack = stack;
    }
  }
}
