/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Logger } from '../../util/logger';
import { Party } from '../models';
import { PartyService } from '../services';
import { Cron, CronController } from 'cron-decorators';
import dayjs from 'dayjs';
import { Inject } from 'typedi';

const log = new Logger(__filename);

// A party is abandoned once nothing has happened in it for this long: nobody
// joined, nothing played, nothing was queued. Actively playing parties write
// a history row on every track, so they always look fresh.
const MAX_IDLE_HOURS = 24;

@CronController('party-cleanup')
export class PartyCleanupJob {
  @Inject()
  private readonly _partyService: PartyService;

  private _running = false;

  @Cron(
    'cleanup-idle-parties', '*/30 * * * *'
  )
  async cleanupIdleParties(): Promise<void> {
    if (this._running) {
      return;
    }
    this._running = true;
    try {
      const cutoff = dayjs().subtract(MAX_IDLE_HOURS, 'hour');
      const parties = await this._partyService.getAllWithActivity();
      const idleParties = parties.filter(party =>
        this.lastActivityOf(party).isBefore(cutoff));
      if (idleParties.length === 0) {
        return;
      }
      log.info(`Removing ${idleParties.length} idle parties (no activity for ${MAX_IDLE_HOURS}h).`);
      const results = await Promise.allSettled(idleParties.map(async party =>
        this._partyService.removeById(party.id)));
      results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .forEach(result => log.error(`Party cleanup failed: ${result.reason}`));
    } finally {
      this._running = false;
    }
  }

  private lastActivityOf(party: Party): dayjs.Dayjs {
    return [
      dayjs(party.createdAt),
      ...(party.members ?? []).map(member => dayjs(member.joinedAt)),
      ...(party.history ?? []).map(played => dayjs(played.playedAt)),
      ...(party.playlist ?? []).map(entry => dayjs(entry.addedAt)),
    ].reduce((latest, current) => (current.isAfter(latest) ? current : latest));
  }
}
