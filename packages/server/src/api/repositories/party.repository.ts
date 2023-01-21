/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Party } from '../models';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Party)
export class PartyRepository extends Repository<Party> {}
