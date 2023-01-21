/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { PlaylistHistory } from '../models';
import { PlaylistHistoryRepository } from '../repositories';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

@Service()
export class PlaylistHistoryService {
  constructor(@OrmRepository() private readonly _playlistHistoryRepository: PlaylistHistoryRepository) {}

  async addToHistory(entry: Partial<PlaylistHistory>): Promise<PlaylistHistory> {
    return this._playlistHistoryRepository.save(entry);
  }
}
