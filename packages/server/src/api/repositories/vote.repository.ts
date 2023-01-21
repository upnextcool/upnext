/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { Vote } from '../models';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Vote)
export class VoteRepository extends Repository<Vote> {}
