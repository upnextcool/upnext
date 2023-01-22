
export interface UpNextFrontConfig {
  version: number;
  serverUrl: string;
  frontUrl: string;
}
export class Environment {

  private static _instance: Environment | null = null;

  static get instance(): Environment {
    if (!Environment._instance) {
      Environment._instance = new Environment();
    }
    return Environment._instance;
  }

  private _config: Partial<UpNextFrontConfig> = {};

  get config() {
    return this._config;
  }

  set config(value: Partial<UpNextFrontConfig>) {
    this._config = value;
  }
}
