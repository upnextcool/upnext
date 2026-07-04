/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { PartyStateService } from '../services/party-state.service';
import { PartyService, UpNextService } from '../services';
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

  // Parties whose previous tick hasn't finished yet. A slow Spotify response
  // must not let ticks pile up on the same party.
  private readonly _inFlight = new Set<string>();

  @Cron(
    'update-party-state', '*/1 * * * * *'
  )
  async updatePartyState(): Promise<void> {
    const parties = await this._partyService.getAll();
    await Promise.allSettled(parties
      .filter(party => party.spotifyAccount && !this._inFlight.has(party.id))
      .map(async party => {
        this._inFlight.add(party.id);
        try {
          await this._upNextService.partyLoopStuff(party);
        } finally {
          this._inFlight.delete(party.id);
        }
      }));
    this._partyStateService.pruneExcept(new Set(parties.map(party => party.id)));
  }
}
