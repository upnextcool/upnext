/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Logger } from '../../util/logger';
import { PartyService, SpotifyAccountService } from '../services';
import { Cron, CronController } from 'cron-decorators';
import dayjs from 'dayjs';
import { Inject } from 'typedi';

const log = new Logger(__filename);

const REFRESH_MINUTE_RANGE = 5;

@CronController('spotify-refresh')
export class SpotifyRefreshJob {
  @Inject()
  private readonly _spotifyAccountService: SpotifyAccountService;

  @Inject()
  private readonly _partyService: PartyService;

  private _running = false;

  @Cron(
    'refresh-tokens', '* * * * *'
  )
  async refreshTokens(): Promise<void> {
    if (this._running) {
      return;
    }
    this._running = true;
    try {
      const parties = await this._partyService.getAll();
      const partiesToBeRefreshed = parties.filter(p => p.spotifyAccount && dayjs(p.spotifyAccount.tokenExpire).diff(
        dayjs(), 'minutes'
      ) <= REFRESH_MINUTE_RANGE);
      if (partiesToBeRefreshed.length > 0) {
        log.info(`Refreshing ${partiesToBeRefreshed.length} parties.`);
        const results = await Promise.allSettled(partiesToBeRefreshed.map(async party =>
          this._spotifyAccountService.refreshTokenFor(party)));
        results
          .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
          .forEach(result => log.error(`Token refresh failed: ${result.reason}`));
      }
    } finally {
      this._running = false;
    }
  }
}
