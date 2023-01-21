/**
 * Copyright (c) 2021, Ethan Elliott
 */

import { PlaylistEntry } from '../models';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(PlaylistEntry)
export class PlaylistEntryRepository extends Repository<PlaylistEntry> {}
