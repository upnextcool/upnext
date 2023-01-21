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

  @Cron(
    'refresh-tokens', '* * * * *'
  )
  async refreshTokens(): Promise<void> {
    const parties = await this._partyService.getAll();
    const partiesToBeRefreshed = parties.filter(p => dayjs(p.spotifyAccount.tokenExpire).diff(
      dayjs(), 'minutes'
    ) <= REFRESH_MINUTE_RANGE);
    if (partiesToBeRefreshed.length > 0) {
      log.info(`Refreshing ${partiesToBeRefreshed.length} parties.`);
      await Promise.all(partiesToBeRefreshed.map(async party =>
        this._spotifyAccountService.refreshTokenFor(party)));
    }
  }
}
