import * as migration_20260409_155721_initial from './20260409_155721_initial'

// The AcroReader schema migration is intentionally held out of registration.
// The existing database already contains parts of its schema, while the generated
// migration includes destructive legacy cleanup and non-idempotent enum/table
// creation. Do not register a replacement until the schema reconciliation has
// been reviewed and tested against a disposable database.
export const migrations = [
  {
    up: migration_20260409_155721_initial.up,
    down: migration_20260409_155721_initial.down,
    name: '20260409_155721_initial',
  },
]
