/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Party } from '../models';
import { CurrentlyPlaying } from '../spotify';
import { ArtworkPalette, PartyState, PartyStateEnum } from '../types';
import { BoundedCache } from '../../util/cache';
import Vibrant from 'node-vibrant';
import { Service } from 'typedi';

export interface StoredState {
  state: PartyStateEnum;
  currentlyPlaying: CurrentlyPlaying;
  partyState: PartyState;
}

@Service()
export class PartyStateService {
  private _partySpotifyStates: Map<string, StoredState> = new Map<string, StoredState>();

  setStateFor(
    party: Party,
    state: StoredState
  ): void {
    this._partySpotifyStates.set(
      party.id, state
    );
  }

  getStateFor(party: Party): StoredState {
    return this._partySpotifyStates.has(party.id)
      ? this._partySpotifyStates.get(party.id)
      : undefined;
  }

  private _nextSongQueue: Map<string, {isQueued: boolean, spotifyId: string}>
    = new Map<string, {isQueued: boolean, spotifyId: string}>();

  setNextSongQueued(
    party: Party,
    spotifyId: string
  ): void {
    this._nextSongQueue.set(
      party.id, { isQueued: true, spotifyId }
    );
  }

  setEmptyNextSongQueue(party: Party): void {
    this._nextSongQueue.set(
      party.id,
      { isQueued: false, spotifyId: '' }
    );
  }

  hasSongQueued(party: Party): boolean {
    const x = this._nextSongQueue.get(party.id);
    return x ? x.isQueued:false;
  }

  // Drop in-memory state for parties that are no longer being polled so these
  // maps don't grow without bound as parties come and go over the server's life.
  pruneExcept(activePartyIds: Set<string>): void {
    [ ...this._partySpotifyStates.keys() ]
      .filter(id => !activePartyIds.has(id))
      .forEach(id => this._partySpotifyStates.delete(id));
    [ ...this._nextSongQueue.keys() ]
      .filter(id => !activePartyIds.has(id))
      .forEach(id => this._nextSongQueue.delete(id));
  }

  updateState(
    previousState: PartyState,
    newState: Partial<PartyState>
  ): PartyState {
    return {
      ...previousState,
      ...newState
    };
  }

  // Palettes are derived from album-art URLs, which are stable and recur across
  // songs/parties. Extraction downloads and processes the image, so cache the
  // result per URL to keep it off the hot NEW_SONG path.
  private readonly _paletteCache = new BoundedCache<ArtworkPalette>(500);

  async computePalette(artwork: string): Promise<ArtworkPalette> {
    return this._paletteCache.getOrLoad(artwork, async () => {
      const palette = await Vibrant.from(artwork).getSwatches();
      return {
        darkMuted: palette.DarkMuted.hex,
        darkVibrant: palette.DarkVibrant.hex,
        lightMuted: palette.LightMuted.hex,
        lightVibrant: palette.LightVibrant.hex,
        muted: palette.Muted.hex,
        vibrant: palette.Vibrant.hex,
      };
    });
  }
}
