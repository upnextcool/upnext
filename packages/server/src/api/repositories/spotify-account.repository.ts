/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { SpotifyAccount } from '../models';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(SpotifyAccount)
export class SpotifyAccountRepository extends Repository<SpotifyAccount> {}
