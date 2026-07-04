/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Member, Party, PlaylistEntry, PlaylistHistory, SpotifyAccount } from '../models';
import { PartyRepository } from '../repositories';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

@Service()
export class PartyService {
  constructor(@OrmRepository() private readonly _partyRepository: PartyRepository) {}

  async getAll(): Promise<Array<Party>> {
    return this._partyRepository.find({
      relations: [ 'spotifyAccount' ]
    });
  }

  async getById(id: string): Promise<Party> {
    return this._partyRepository.findOne({
      where: {
        id
      }
    });
  }

  async getByCode(code: string): Promise<Party> {
    return this._partyRepository.findOne({
      where: {
        code: code.toUpperCase()
      }
    });
  }

  async getPlaylistFor(party: Party): Promise<Array<PlaylistEntry>> {
    // Preload everything the queue view needs in one query, so the
    // field resolvers don't fire an extra query per entry.
    const p = await this._partyRepository.findOne({ relations: [
      'playlist',
      'playlist.addedBy',
      'playlist.votes',
      'playlist.votes.member'
    ], where: { id: party.id } });
    p.playlist.forEach(entry => {
      entry.party = p;
    });
    return p.playlist;
  }

  async getMembersFor(party: Party): Promise<Array<Member>> {
    const p = await this._partyRepository.findOne({ relations: [ 'members' ], where: { id: party.id } });
    return p.members;
  }

  async getSpotifyAccountFor(party: Party): Promise<SpotifyAccount> {
    const p = await this._partyRepository.findOne({ relations: [ 'spotifyAccount' ], where: { id: party.id } });
    return p.spotifyAccount;
  }

  async createParty(name: string): Promise<Party> {
    return this._partyRepository.save({
      code: await this.generateUniqueCode(),
      name,
      spotifyPlaylistId: ''
    });
  }

  private generateCode(): string {
    const DIGITS = '0123456789';
    return [ ...'XXXX' ].map(() => DIGITS[Math.floor(Math.random() * DIGITS.length)]).join('');
  }

  // Codes are only 4 digits, so collisions with live parties are a real
  // possibility — retry until we find a free one instead of silently
  // creating two parties that answer to the same code.
  private async generateUniqueCode(attempt = 0): Promise<string> {
    const MAX_ATTEMPTS = 25;
    if (attempt >= MAX_ATTEMPTS) {
      throw new Error('Unable to allocate a unique party code');
    }
    const code = this.generateCode();
    const existing = await this.getByCode(code);
    return existing ? this.generateUniqueCode(attempt + 1) : code;
  }

  async updateParty(party: Partial<Party>) {
    await this._partyRepository.update(
      party.id,
      party
    );
  }

  async getHistoryFor(party: Party): Promise<Array<PlaylistHistory>> {
    const p = await this._partyRepository.findOne({ relations: [ 'history' ], where: { id: party.id } });
    return p.history;
  }
}
