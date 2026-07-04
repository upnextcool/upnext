/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { PlaylistHistory } from '../models';
import { Service } from 'typedi';
import { DataSource, Repository } from 'typeorm';

@Service()
export class PlaylistHistoryService {
  private readonly _playlistHistoryRepository: Repository<PlaylistHistory>;

  constructor(dataSource: DataSource) {
    this._playlistHistoryRepository = dataSource.getRepository(PlaylistHistory);
  }

  async addToHistory(entry: Partial<PlaylistHistory>): Promise<PlaylistHistory> {
    return this._playlistHistoryRepository.save(entry);
  }
}
