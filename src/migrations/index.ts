import * as migration_20260409_155721_initial from './20260409_155721_initial';
import * as migration_20261103_033747_acroreader_documents from './20261103_033747_acroreader_documents';

export const migrations = [
  {
    up: migration_20260409_155721_initial.up,
    down: migration_20260409_155721_initial.down,
    name: '20260409_155721_initial',
  },
  {
    up: migration_20261103_033747_acroreader_documents.up,
    down: migration_20261103_033747_acroreader_documents.down,
    name: '20261103_033747_acroreader_documents'
  },
];
