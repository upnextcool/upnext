/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { PartyService, PartyStateService, UpNextService } from '../services';
import { Cron, CronController } from 'cron-decorators';
import { Inject } from 'typedi';

@CronController('spotify-refresh')
export class PartyStateJob {
  @Inject()
  private readonly _upNextService: UpNextService;


  @Inject()
  private readonly _partyService: PartyService;

  @Inject()
  private readonly _partyStateService: PartyStateService;

  // Guards against overlapping runs: this job fires every second, but a slow
  // Spotify response (more likely under load) can make a pass take longer than
  // that. Without the guard, ticks stack up and pile on DB/HTTP work.
  private _running = false;

  @Cron(
    'update-party-state', '*/1 * * * * *'
  )
  async updatePartyState(): Promise<void> {
    if (this._running) {
      return;
    }
    this._running = true;
    try {
      const parties = await this._partyService.getAll();
      const activeParties = parties.filter(p => p.spotifyAccount);
      this._partyStateService.pruneExcept(new Set(activeParties.map(p => p.id)));
      await Promise.all(
        activeParties.map(async party => this._upNextService.partyLoopStuff(party))
      );
    } finally {
      this._running = false;
    }
  }
}
