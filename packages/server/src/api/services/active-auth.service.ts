/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { ActiveAuth, Party, User } from '../models';
import { Service } from 'typedi';
import { DataSource, Repository } from 'typeorm';

@Service()
export class ActiveAuthService {
  private readonly _activeAuthRepository: Repository<ActiveAuth>;

  constructor(dataSource: DataSource) {
    this._activeAuthRepository = dataSource.getRepository(ActiveAuth);
  }

  async getByUser(user: User): Promise<ActiveAuth> {
    return this._activeAuthRepository.findOne({
      where: {
        user: { id: user.id }
      }
    });
  }

  async startNewAuth(
    user: User,
    party: Party
  ): Promise<ActiveAuth> {
    const active = await this.getByUser(user);
    if (active) {
      return active;
    }

    return this._activeAuthRepository.save({
      party,
      user
    });
  }

  async getById(authId: string): Promise<ActiveAuth> {
    return this._activeAuthRepository.findOne({
      relations: [
        'party',
        'user'
      ],
      where: {
        id: authId
      }
    });
  }

  async remove(activeAuth: ActiveAuth): Promise<void> {
    await this._activeAuthRepository.remove(activeAuth);
  }
}
