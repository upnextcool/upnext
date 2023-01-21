/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { ActiveAuth } from '../models';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ActiveAuth)
export class ActiveAuthRepository extends Repository<ActiveAuth> {}
