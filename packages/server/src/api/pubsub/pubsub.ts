import { PubSub } from 'apollo-server-express';

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
