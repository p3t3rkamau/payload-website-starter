import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'reviewer');
  CREATE TYPE "public"."enum_aircraft_series" AS ENUM('dash-100', 'dash-200', 'dash-300', 'dash-400');
  CREATE TYPE "public"."enum_categories_department" AS ENUM('flight-operations', 'maintenance', 'general');
  CREATE TYPE "public"."enum_categories_series" AS ENUM('dash-100', 'dash-200', 'dash-300', 'dash-400');
  CREATE TYPE "public"."enum_document_types_department" AS ENUM('flight-operations', 'maintenance', 'general');
  CREATE TYPE "public"."enum_documents_status" AS ENUM('active', 'archived');
  CREATE TYPE "public"."enum_document_revisions_status" AS ENUM('draft', 'review', 'published', 'superseded');
  CREATE TABLE "aircraft" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"series" "enum_aircraft_series" NOT NULL,
  	"model" varchar NOT NULL,
  	"manufacturer" varchar DEFAULT 'De Havilland Canada',
  	"description" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "document_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"department" "enum_document_types_department" NOT NULL,
  	"description" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"document_number" varchar NOT NULL,
  	"category_id" integer NOT NULL,
  	"document_type_id" integer NOT NULL,
  	"description" varchar,
  	"current_revision_id" integer,
  	"status" "enum_documents_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"aircraft_id" integer
  );
  
  CREATE TABLE "document_revisions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"document_id" integer NOT NULL,
  	"revision_number" varchar NOT NULL,
  	"effective_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_document_revisions_status" DEFAULT 'draft' NOT NULL,
  	"file_id" integer NOT NULL,
  	"change_summary" varchar,
  	"published_at" timestamp(3) with time zone,
  	"uploaded_by_id" integer,
  	"supersedes_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_folders_folder_type" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_folders" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT IF EXISTS "media_folder_id_payload_folders_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_payload_folders_fk";
  
  DROP INDEX "pages_slug_idx";
  DROP INDEX "_pages_v_version_version_slug_idx";
  DROP INDEX "posts_slug_idx";
  DROP INDEX "_posts_v_version_version_slug_idx";
  DROP INDEX "media_folder_idx";
  DROP INDEX "media_variants_thumbnail_variants_thumbnail_filename_idx";
  DROP INDEX "media_variants_square_variants_square_filename_idx";
  DROP INDEX "media_variants_small_variants_small_filename_idx";
  DROP INDEX "media_variants_medium_variants_medium_filename_idx";
  DROP INDEX "media_variants_large_variants_large_filename_idx";
  DROP INDEX "media_variants_xlarge_variants_xlarge_filename_idx";
  DROP INDEX "media_variants_og_variants_og_filename_idx";
  DROP INDEX "payload_locked_documents_rels_payload_folders_id_idx";
  ALTER TABLE "categories" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN "description" varchar;
  ALTER TABLE "media" ADD COLUMN "is_public" boolean DEFAULT false;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_square_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_square_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_square_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_square_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_small_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_small_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_small_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_small_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_small_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_small_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_medium_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_large_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_large_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_large_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_large_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_large_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_large_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_xlarge_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_xlarge_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_xlarge_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_xlarge_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_xlarge_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_xlarge_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_og_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_og_filename" varchar;
  ALTER TABLE "categories" ADD COLUMN "sort_order" numeric DEFAULT 0;
  ALTER TABLE "categories" ADD COLUMN "department" "enum_categories_department";
  ALTER TABLE "categories" ADD COLUMN "series" "enum_categories_series";
  ALTER TABLE "categories" ADD COLUMN "description" varchar;
  ALTER TABLE "categories" ADD COLUMN "is_active" boolean DEFAULT true;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'editor' NOT NULL;
  -- Existing accounts default to "editor"; promote the first-created user so someone can administer roles.
  UPDATE "users" SET "role" = 'admin' WHERE "id" = (SELECT MIN("id") FROM "users");
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "aircraft_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "document_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documents_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "document_revisions_id" integer;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_document_type_id_document_types_id_fk" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_current_revision_id_document_revisions_id_fk" FOREIGN KEY ("current_revision_id") REFERENCES "public"."document_revisions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "documents_rels" ADD CONSTRAINT "documents_rels_aircraft_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_supersedes_id_document_revisions_id_fk" FOREIGN KEY ("supersedes_id") REFERENCES "public"."document_revisions"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "aircraft_name_idx" ON "aircraft" USING btree ("name");
  CREATE INDEX "aircraft_updated_at_idx" ON "aircraft" USING btree ("updated_at");
  CREATE INDEX "aircraft_created_at_idx" ON "aircraft" USING btree ("created_at");
  CREATE UNIQUE INDEX "document_types_name_idx" ON "document_types" USING btree ("name");
  CREATE UNIQUE INDEX "document_types_code_idx" ON "document_types" USING btree ("code");
  CREATE INDEX "document_types_updated_at_idx" ON "document_types" USING btree ("updated_at");
  CREATE INDEX "document_types_created_at_idx" ON "document_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_document_number_idx" ON "documents" USING btree ("document_number");
  CREATE INDEX "documents_category_idx" ON "documents" USING btree ("category_id");
  CREATE INDEX "documents_document_type_idx" ON "documents" USING btree ("document_type_id");
  CREATE INDEX "documents_current_revision_idx" ON "documents" USING btree ("current_revision_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE INDEX "documents_rels_order_idx" ON "documents_rels" USING btree ("order");
  CREATE INDEX "documents_rels_parent_idx" ON "documents_rels" USING btree ("parent_id");
  CREATE INDEX "documents_rels_path_idx" ON "documents_rels" USING btree ("path");
  CREATE INDEX "documents_rels_aircraft_id_idx" ON "documents_rels" USING btree ("aircraft_id");
  CREATE INDEX "document_revisions_document_idx" ON "document_revisions" USING btree ("document_id");
  CREATE INDEX "document_revisions_file_idx" ON "document_revisions" USING btree ("file_id");
  CREATE INDEX "document_revisions_uploaded_by_idx" ON "document_revisions" USING btree ("uploaded_by_id");
  CREATE INDEX "document_revisions_supersedes_idx" ON "document_revisions" USING btree ("supersedes_id");
  CREATE INDEX "document_revisions_updated_at_idx" ON "document_revisions" USING btree ("updated_at");
  CREATE INDEX "document_revisions_created_at_idx" ON "document_revisions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_aircraft_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_document_types_fk" FOREIGN KEY ("document_types_id") REFERENCES "public"."document_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_document_revisions_fk" FOREIGN KEY ("document_revisions_id") REFERENCES "public"."document_revisions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "payload_locked_documents_rels_aircraft_id_idx" ON "payload_locked_documents_rels" USING btree ("aircraft_id");
  CREATE INDEX "payload_locked_documents_rels_document_types_id_idx" ON "payload_locked_documents_rels" USING btree ("document_types_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_document_revisions_id_idx" ON "payload_locked_documents_rels" USING btree ("document_revisions_id");
  ALTER TABLE "pages" DROP COLUMN "generate_slug";
  ALTER TABLE "_pages_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "posts" DROP COLUMN "generate_slug";
  ALTER TABLE "_posts_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "media" DROP COLUMN "folder_id";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_thumbnail_filename";
  ALTER TABLE "media" DROP COLUMN "variants_square_url";
  ALTER TABLE "media" DROP COLUMN "variants_square_width";
  ALTER TABLE "media" DROP COLUMN "variants_square_height";
  ALTER TABLE "media" DROP COLUMN "variants_square_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_square_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_square_filename";
  ALTER TABLE "media" DROP COLUMN "variants_small_url";
  ALTER TABLE "media" DROP COLUMN "variants_small_width";
  ALTER TABLE "media" DROP COLUMN "variants_small_height";
  ALTER TABLE "media" DROP COLUMN "variants_small_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_small_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_small_filename";
  ALTER TABLE "media" DROP COLUMN "variants_medium_url";
  ALTER TABLE "media" DROP COLUMN "variants_medium_width";
  ALTER TABLE "media" DROP COLUMN "variants_medium_height";
  ALTER TABLE "media" DROP COLUMN "variants_medium_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_medium_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_medium_filename";
  ALTER TABLE "media" DROP COLUMN "variants_large_url";
  ALTER TABLE "media" DROP COLUMN "variants_large_width";
  ALTER TABLE "media" DROP COLUMN "variants_large_height";
  ALTER TABLE "media" DROP COLUMN "variants_large_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_large_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_large_filename";
  ALTER TABLE "media" DROP COLUMN "variants_xlarge_url";
  ALTER TABLE "media" DROP COLUMN "variants_xlarge_width";
  ALTER TABLE "media" DROP COLUMN "variants_xlarge_height";
  ALTER TABLE "media" DROP COLUMN "variants_xlarge_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_xlarge_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_xlarge_filename";
  ALTER TABLE "media" DROP COLUMN "variants_og_url";
  ALTER TABLE "media" DROP COLUMN "variants_og_width";
  ALTER TABLE "media" DROP COLUMN "variants_og_height";
  ALTER TABLE "media" DROP COLUMN "variants_og_mime_type";
  ALTER TABLE "media" DROP COLUMN "variants_og_filesize";
  ALTER TABLE "media" DROP COLUMN "variants_og_filename";
  ALTER TABLE "categories" DROP COLUMN "generate_slug";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_folders_id";
  DROP TYPE "public"."enum_payload_folders_folder_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  CREATE TABLE "payload_folders_folder_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_payload_folders_folder_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "aircraft" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "document_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "documents_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "document_revisions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "aircraft" CASCADE;
  DROP TABLE "document_types" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "documents_rels" CASCADE;
  DROP TABLE "document_revisions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_aircraft_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_document_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_documents_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_document_revisions_fk";
  
  DROP INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx";
  DROP INDEX "media_sizes_square_sizes_square_filename_idx";
  DROP INDEX "media_sizes_small_sizes_small_filename_idx";
  DROP INDEX "media_sizes_medium_sizes_medium_filename_idx";
  DROP INDEX "media_sizes_large_sizes_large_filename_idx";
  DROP INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx";
  DROP INDEX "media_sizes_og_sizes_og_filename_idx";
  DROP INDEX "payload_locked_documents_rels_aircraft_id_idx";
  DROP INDEX "payload_locked_documents_rels_document_types_id_idx";
  DROP INDEX "payload_locked_documents_rels_documents_id_idx";
  DROP INDEX "payload_locked_documents_rels_document_revisions_id_idx";
  ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "categories" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "media" ADD COLUMN "folder_id" integer;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_thumbnail_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_square_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_square_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_square_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_square_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_square_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_square_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_small_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_small_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_small_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_small_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_small_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_small_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_medium_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_medium_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_medium_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_medium_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_medium_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_medium_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_large_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_large_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_large_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_large_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_large_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_large_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_xlarge_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_xlarge_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_xlarge_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_xlarge_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_xlarge_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_xlarge_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_og_url" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_og_width" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_og_height" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_og_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "variants_og_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "variants_og_filename" varchar;
  ALTER TABLE "pages" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "_pages_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "posts" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "_posts_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_folders_id" integer;
  ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
  CREATE INDEX "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
  CREATE INDEX "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_variants_thumbnail_variants_thumbnail_filename_idx" ON "media" USING btree ("variants_thumbnail_filename");
  CREATE INDEX "media_variants_square_variants_square_filename_idx" ON "media" USING btree ("variants_square_filename");
  CREATE INDEX "media_variants_small_variants_small_filename_idx" ON "media" USING btree ("variants_small_filename");
  CREATE INDEX "media_variants_medium_variants_medium_filename_idx" ON "media" USING btree ("variants_medium_filename");
  CREATE INDEX "media_variants_large_variants_large_filename_idx" ON "media" USING btree ("variants_large_filename");
  CREATE INDEX "media_variants_xlarge_variants_xlarge_filename_idx" ON "media" USING btree ("variants_xlarge_filename");
  CREATE INDEX "media_variants_og_variants_og_filename_idx" ON "media" USING btree ("variants_og_filename");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "categories" DROP COLUMN "sort_order";
  ALTER TABLE "categories" DROP COLUMN "department";
  ALTER TABLE "categories" DROP COLUMN "series";
  ALTER TABLE "categories" DROP COLUMN "description";
  ALTER TABLE "categories" DROP COLUMN "is_active";
  ALTER TABLE "media" DROP COLUMN "description";
  ALTER TABLE "media" DROP COLUMN "is_public";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_square_url";
  ALTER TABLE "media" DROP COLUMN "sizes_square_width";
  ALTER TABLE "media" DROP COLUMN "sizes_square_height";
  ALTER TABLE "media" DROP COLUMN "sizes_square_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_square_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_square_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_small_url";
  ALTER TABLE "media" DROP COLUMN "sizes_small_width";
  ALTER TABLE "media" DROP COLUMN "sizes_small_height";
  ALTER TABLE "media" DROP COLUMN "sizes_small_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_small_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_small_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_url";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_width";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_height";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_medium_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_large_url";
  ALTER TABLE "media" DROP COLUMN "sizes_large_width";
  ALTER TABLE "media" DROP COLUMN "sizes_large_height";
  ALTER TABLE "media" DROP COLUMN "sizes_large_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_large_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_large_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_xlarge_url";
  ALTER TABLE "media" DROP COLUMN "sizes_xlarge_width";
  ALTER TABLE "media" DROP COLUMN "sizes_xlarge_height";
  ALTER TABLE "media" DROP COLUMN "sizes_xlarge_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_xlarge_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_xlarge_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_og_url";
  ALTER TABLE "media" DROP COLUMN "sizes_og_width";
  ALTER TABLE "media" DROP COLUMN "sizes_og_height";
  ALTER TABLE "media" DROP COLUMN "sizes_og_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_og_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_og_filename";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "aircraft_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "document_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "documents_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "document_revisions_id";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_aircraft_series";
  DROP TYPE "public"."enum_categories_department";
  DROP TYPE "public"."enum_categories_series";
  DROP TYPE "public"."enum_document_types_department";
  DROP TYPE "public"."enum_documents_status";
  DROP TYPE "public"."enum_document_revisions_status";`)
}
