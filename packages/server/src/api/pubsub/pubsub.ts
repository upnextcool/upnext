import { PlaylistEntry } from '../models';
import { PartyState } from '../types';
import { PubSub } from 'apollo-server-express';

export enum Topic {
  QUEUE_NEW_SONG = 'QUEUE_NEW_SONG',
  QUEUE_REMOVE_SONG = 'QUEUE_REMOVE_SONG',
  QUEUE_UPVOTE = 'QUEUE_UPVOTE',
  QUEUE_DOWNVOTE = 'QUEUE_DOWNVOTE',
  PLAYER_PLAYED = 'PLAYER_PLAYED',
  PLAYER_PAUSED = 'PLAYER_PAUSED',
}

// Every published payload carries the id of the party it belongs to so that
// subscriptions can be filtered per-party instead of broadcasting globally.
export interface QueueEventPayload {
  partyId: string;
  entry: PlaylistEntry;
}

export interface PlayerEventPayload {
  partyId: string;
  state: PartyState;
}

export class UpNextPubSubEngine {
  private static _instance: UpNextPubSubEngine | null = null;

  static get instance(): UpNextPubSubEngine {
    if (!UpNextPubSubEngine._instance) {
      UpNextPubSubEngine._instance = new UpNextPubSubEngine();
    }
    return UpNextPubSubEngine._instance;
  }

  private readonly _engine: PubSub;

  constructor() {
    this._engine = new PubSub();
  }

  get engine() {
    return this._engine;
  }
}
