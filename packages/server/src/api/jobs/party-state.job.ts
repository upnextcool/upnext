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

  // Guards against overlapping polls: this job fires every second, but a slow
  // Spotify response (more likely under load) can make a party's poll take
  // longer than that. Tracking in-flight parties individually means one slow
  // party skips its next tick without stalling polling for the others.
  private readonly _inFlight = new Set<string>();

  @Cron(
    'update-party-state', '*/1 * * * * *'
  )
  async updatePartyState(): Promise<void> {
    const parties = await this._partyService.getAll();
    const activeParties = parties.filter(p => p.spotifyAccount);
    this._partyStateService.pruneExcept(new Set(activeParties.map(p => p.id)));
    await Promise.allSettled(activeParties
      .filter(party => !this._inFlight.has(party.id))
      .map(async party => {
        this._inFlight.add(party.id);
        try {
          await this._upNextService.partyLoopStuff(party);
        } finally {
          this._inFlight.delete(party.id);
        }
      }));
  }
}
