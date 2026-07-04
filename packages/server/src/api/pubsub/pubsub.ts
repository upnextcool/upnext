import { PlaylistEntry } from '../models';
import { PartyState } from '../types';
import { PubSub } from 'graphql-subscriptions';

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

/**
 * type-graphql 2 dropped its bundled PubSub and the `@PubSub()` injector, and
 * instead consumes any object matching its `{ publish, subscribe }` interface.
 * This singleton adapts graphql-subscriptions' in-memory PubSub to that shape.
 *
 * `engine` returns the adapter itself so existing call sites
 * (`UpNextPubSubEngine.instance.engine.publish(...)`) keep working and the same
 * instance is handed to `buildSchema({ pubSub })`.
 */
export class UpNextPubSubEngine {
  private static _instance: UpNextPubSubEngine | null = null;

  static get instance(): UpNextPubSubEngine {
    if (!UpNextPubSubEngine._instance) {
      UpNextPubSubEngine._instance = new UpNextPubSubEngine();
    }
    return UpNextPubSubEngine._instance;
  }

  private readonly _pubSub = new PubSub();

  publish(routingKey: string, payload: unknown): void {
    void this._pubSub.publish(routingKey, payload);
  }

  subscribe(routingKey: string): AsyncIterable<unknown> {
    // graphql-subscriptions' iterator is an async-iterable at runtime (it
    // implements Symbol.asyncIterator) even though it is typed as AsyncIterator.
    return this._pubSub.asyncIterator(routingKey) as unknown as AsyncIterable<unknown>;
  }

  get engine(): UpNextPubSubEngine {
    return this;
  }
}
