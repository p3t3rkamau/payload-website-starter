import * as migration_20260409_155721_initial from './20260409_155721_initial'
import * as migration_20261105_120000_acroreader_schema_reconciliation from './20261105_120000_acroreader_schema_reconciliation'

// The original generated AcroReader migration remains intentionally unregistered:
// it contains destructive legacy cleanup and non-idempotent table/enum creation.
// This guarded reconciliation migration only adds missing integrity rules/indexes.
export const migrations = [
  {
    up: migration_20261105_120000_acroreader_schema_reconciliation.up,
    down: migration_20261105_120000_acroreader_schema_reconciliation.down,
    name: '20261105_120000_acroreader_schema_reconciliation',
  },
  {
    up: migration_20260409_155721_initial.up,
    down: migration_20260409_155721_initial.down,
    name: '20260409_155721_initial',
  },
]
