import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Safely reconciles existing AcroReader tables with the current collections.
 * Does not create/drop tables or enums and does not remove legacy Payload data.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Validate uniqueness and all relationship targets before changing the schema.
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM aircraft GROUP BY name HAVING COUNT(*) > 1)
        THEN RAISE EXCEPTION 'Duplicate aircraft.name values'; END IF;
      IF EXISTS (SELECT 1 FROM document_types GROUP BY name HAVING COUNT(*) > 1)
        THEN RAISE EXCEPTION 'Duplicate document_types.name values'; END IF;
      IF EXISTS (SELECT 1 FROM document_types GROUP BY code HAVING COUNT(*) > 1)
        THEN RAISE EXCEPTION 'Duplicate document_types.code values'; END IF;
      IF EXISTS (SELECT 1 FROM documents GROUP BY document_number HAVING COUNT(*) > 1)
        THEN RAISE EXCEPTION 'Duplicate documents.document_number values'; END IF;

      IF EXISTS (SELECT 1 FROM documents d LEFT JOIN categories c ON c.id=d.category_id WHERE c.id IS NULL)
        THEN RAISE EXCEPTION 'Orphan documents.category_id'; END IF;
      IF EXISTS (SELECT 1 FROM documents d LEFT JOIN document_types t ON t.id=d.document_type_id WHERE t.id IS NULL)
        THEN RAISE EXCEPTION 'Orphan documents.document_type_id'; END IF;
      IF EXISTS (SELECT 1 FROM documents d LEFT JOIN document_revisions r ON r.id=d.current_revision_id WHERE d.current_revision_id IS NOT NULL AND r.id IS NULL)
        THEN RAISE EXCEPTION 'Orphan documents.current_revision_id'; END IF;
      IF EXISTS (SELECT 1 FROM documents_rels r LEFT JOIN documents d ON d.id=r.parent_id WHERE d.id IS NULL)
        THEN RAISE EXCEPTION 'Orphan documents_rels.parent_id'; END IF;
      IF EXISTS (SELECT 1 FROM documents_rels r LEFT JOIN aircraft a ON a.id=r.aircraft_id WHERE r.aircraft_id IS NOT NULL AND a.id IS NULL)
        THEN RAISE EXCEPTION 'Orphan documents_rels.aircraft_id'; END IF;
      IF EXISTS (SELECT 1 FROM document_revisions r LEFT JOIN documents d ON d.id=r.document_id WHERE d.id IS NULL)
        THEN RAISE EXCEPTION 'Orphan document_revisions.document_id'; END IF;
      IF EXISTS (SELECT 1 FROM document_revisions r LEFT JOIN media m ON m.id=r.file_id WHERE m.id IS NULL)
        THEN RAISE EXCEPTION 'Orphan document_revisions.file_id'; END IF;
      IF EXISTS (SELECT 1 FROM document_revisions r LEFT JOIN users u ON u.id=r.uploaded_by_id WHERE r.uploaded_by_id IS NOT NULL AND u.id IS NULL)
        THEN RAISE EXCEPTION 'Orphan document_revisions.uploaded_by_id'; END IF;
      IF EXISTS (SELECT 1 FROM document_revisions r LEFT JOIN document_revisions p ON p.id=r.supersedes_id WHERE r.supersedes_id IS NOT NULL AND p.id IS NULL)
        THEN RAISE EXCEPTION 'Orphan document_revisions.supersedes_id'; END IF;
    END $$;
  `)

  // Categories.slug is optional in the current collection configuration.
  await db.execute(sql`ALTER TABLE categories ALTER COLUMN slug DROP NOT NULL`)

  // Unique indexes required by the current collection definitions.
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS aircraft_name_idx ON aircraft (name)`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS document_types_name_idx ON document_types (name)`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS document_types_code_idx ON document_types (code)`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS documents_document_number_idx ON documents (document_number)`)

  // Relationship and timestamp indexes from the generated schema snapshot.
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS aircraft_updated_at_idx ON aircraft (updated_at);
    CREATE INDEX IF NOT EXISTS aircraft_created_at_idx ON aircraft (created_at);
    CREATE INDEX IF NOT EXISTS document_types_updated_at_idx ON document_types (updated_at);
    CREATE INDEX IF NOT EXISTS document_types_created_at_idx ON document_types (created_at);
    CREATE INDEX IF NOT EXISTS documents_category_idx ON documents (category_id);
    CREATE INDEX IF NOT EXISTS documents_document_type_idx ON documents (document_type_id);
    CREATE INDEX IF NOT EXISTS documents_current_revision_idx ON documents (current_revision_id);
    CREATE INDEX IF NOT EXISTS documents_updated_at_idx ON documents (updated_at);
    CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents (created_at);
    CREATE INDEX IF NOT EXISTS documents_rels_order_idx ON documents_rels ("order");
    CREATE INDEX IF NOT EXISTS documents_rels_parent_idx ON documents_rels (parent_id);
    CREATE INDEX IF NOT EXISTS documents_rels_path_idx ON documents_rels (path);
    CREATE INDEX IF NOT EXISTS documents_rels_aircraft_id_idx ON documents_rels (aircraft_id);
    CREATE INDEX IF NOT EXISTS document_revisions_document_idx ON document_revisions (document_id);
    CREATE INDEX IF NOT EXISTS document_revisions_file_idx ON document_revisions (file_id);
    CREATE INDEX IF NOT EXISTS document_revisions_uploaded_by_idx ON document_revisions (uploaded_by_id);
    CREATE INDEX IF NOT EXISTS document_revisions_supersedes_idx ON document_revisions (supersedes_id);
    CREATE INDEX IF NOT EXISTS document_revisions_updated_at_idx ON document_revisions (updated_at);
    CREATE INDEX IF NOT EXISTS document_revisions_created_at_idx ON document_revisions (created_at);
  `)

  // Add missing foreign keys. Required references deliberately use RESTRICT.
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='documents_category_id_categories_id_fk') THEN
        ALTER TABLE documents ADD CONSTRAINT documents_category_id_categories_id_fk
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='documents_document_type_id_document_types_id_fk') THEN
        ALTER TABLE documents ADD CONSTRAINT documents_document_type_id_document_types_id_fk
          FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE RESTRICT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='documents_current_revision_id_document_revisions_id_fk') THEN
        ALTER TABLE documents ADD CONSTRAINT documents_current_revision_id_document_revisions_id_fk
          FOREIGN KEY (current_revision_id) REFERENCES document_revisions(id) ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='documents_rels_parent_fk') THEN
        ALTER TABLE documents_rels ADD CONSTRAINT documents_rels_parent_fk
          FOREIGN KEY (parent_id) REFERENCES documents(id) ON DELETE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='documents_rels_aircraft_fk') THEN
        ALTER TABLE documents_rels ADD CONSTRAINT documents_rels_aircraft_fk
          FOREIGN KEY (aircraft_id) REFERENCES aircraft(id) ON DELETE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='document_revisions_document_id_documents_id_fk') THEN
        ALTER TABLE document_revisions ADD CONSTRAINT document_revisions_document_id_documents_id_fk
          FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE RESTRICT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='document_revisions_file_id_media_id_fk') THEN
        ALTER TABLE document_revisions ADD CONSTRAINT document_revisions_file_id_media_id_fk
          FOREIGN KEY (file_id) REFERENCES media(id) ON DELETE RESTRICT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='document_revisions_uploaded_by_id_users_id_fk') THEN
        ALTER TABLE document_revisions ADD CONSTRAINT document_revisions_uploaded_by_id_users_id_fk
          FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='document_revisions_supersedes_id_document_revisions_id_fk') THEN
        ALTER TABLE document_revisions ADD CONSTRAINT document_revisions_supersedes_id_document_revisions_id_fk
          FOREIGN KEY (supersedes_id) REFERENCES document_revisions(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Roll back only the indexes and constraints added above. Keep slug nullable:
  // that matches the current Categories collection configuration.
  await db.execute(sql`
    ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_category_id_categories_id_fk;
    ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_id_document_types_id_fk;
    ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_current_revision_id_document_revisions_id_fk;
    ALTER TABLE documents_rels DROP CONSTRAINT IF EXISTS documents_rels_parent_fk;
    ALTER TABLE documents_rels DROP CONSTRAINT IF EXISTS documents_rels_aircraft_fk;
    ALTER TABLE document_revisions DROP CONSTRAINT IF EXISTS document_revisions_document_id_documents_id_fk;
    ALTER TABLE document_revisions DROP CONSTRAINT IF EXISTS document_revisions_file_id_media_id_fk;
    ALTER TABLE document_revisions DROP CONSTRAINT IF EXISTS document_revisions_uploaded_by_id_users_id_fk;
    ALTER TABLE document_revisions DROP CONSTRAINT IF EXISTS document_revisions_supersedes_id_document_revisions_id_fk;
    DROP INDEX IF EXISTS aircraft_name_idx;
    DROP INDEX IF EXISTS aircraft_updated_at_idx;
    DROP INDEX IF EXISTS aircraft_created_at_idx;
    DROP INDEX IF EXISTS document_types_name_idx;
    DROP INDEX IF EXISTS document_types_code_idx;
    DROP INDEX IF EXISTS document_types_updated_at_idx;
    DROP INDEX IF EXISTS document_types_created_at_idx;
    DROP INDEX IF EXISTS documents_document_number_idx;
    DROP INDEX IF EXISTS documents_category_idx;
    DROP INDEX IF EXISTS documents_document_type_idx;
    DROP INDEX IF EXISTS documents_current_revision_idx;
    DROP INDEX IF EXISTS documents_updated_at_idx;
    DROP INDEX IF EXISTS documents_created_at_idx;
    DROP INDEX IF EXISTS documents_rels_order_idx;
    DROP INDEX IF EXISTS documents_rels_parent_idx;
    DROP INDEX IF EXISTS documents_rels_path_idx;
    DROP INDEX IF EXISTS documents_rels_aircraft_id_idx;
    DROP INDEX IF EXISTS document_revisions_document_idx;
    DROP INDEX IF EXISTS document_revisions_file_idx;
    DROP INDEX IF EXISTS document_revisions_uploaded_by_idx;
    DROP INDEX IF EXISTS document_revisions_supersedes_idx;
    DROP INDEX IF EXISTS document_revisions_updated_at_idx;
    DROP INDEX IF EXISTS document_revisions_created_at_idx;
  `)
}
