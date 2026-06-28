/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { environment } from '../../environment';
import { Party, SpotifyAccount } from '../models';
import { SpotifyService } from './spotify.service';
import dayjs from 'dayjs';
import { Service } from 'typedi';
import { DataSource, Repository } from 'typeorm';

@Service()
export class SpotifyAccountService {
  private readonly _spotifyAccountRepository: Repository<SpotifyAccount>;

  constructor(
    dataSource: DataSource,
    private readonly _spotifyService: SpotifyService
  ) {
    this._spotifyAccountRepository = dataSource.getRepository(SpotifyAccount);
  }

  async getAll(): Promise<Array<SpotifyAccount>> {
    return this._spotifyAccountRepository.find();
  }

  async getById(id: string): Promise<SpotifyAccount> {
    return this._spotifyAccountRepository.findOne({
      where: {
        id
      }
    });
  }

  async getPartyFor(spotifyAccount: SpotifyAccount): Promise<Party> {
    const sa = await this._spotifyAccountRepository.findOne({
      relations: [ 'party' ],
      where: {
        id: spotifyAccount.id
      }
    });
    return sa.party;
  }

  async addAccount(spotifyAccount: Partial<SpotifyAccount>): Promise<SpotifyAccount> {
    return this._spotifyAccountRepository.save(spotifyAccount);
  }

  async refreshTokenFor(party: Party): Promise<void> {
    const tt = await this._spotifyService.spotifyApis.auth.refreshAuthToken(
      environment.spotify.clientID,
      environment.spotify.clientSecret,
      party.spotifyAccount.refreshToken
    );
    await this._spotifyAccountRepository.update(
      { id: party.spotifyAccount.id },
      {
        token: tt.access_token,
        tokenExpire: dayjs().add(
          tt.expires_in,
          'seconds'
        ).toDate()
      }
    );
  }
}
