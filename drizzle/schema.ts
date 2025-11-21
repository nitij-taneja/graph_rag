import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Core user table - simplified for single-user mode.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Session identifier for the user */
  sessionId: text("sessionId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Documents uploaded by users
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  fileName: text("fileName").notNull(),
  fileSize: integer("fileSize").notNull(),
  content: text("content").notNull(),
  mimeType: text("mimeType").notNull(),
  s3Key: text("s3Key").notNull(),
  s3Url: text("s3Url").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Entities extracted from documents
export const entities = sqliteTable("entities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // e.g., "Person", "Organization", "Location", "Concept"
  description: text("description"),
  confidence: integer("confidence").notNull(), // 0-100 confidence score
  sourceDocumentId: integer("sourceDocumentId").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Relationships between entities
export const relationships = sqliteTable("relationships", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  sourceEntityId: integer("sourceEntityId").notNull(),
  targetEntityId: integer("targetEntityId").notNull(),
  relationshipType: text("relationshipType").notNull(), // e.g., "works_at", "located_in"
  confidence: integer("confidence").notNull(), // 0-100 confidence score
  sourceDocumentId: integer("sourceDocumentId").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Query history and results
export const queries = sqliteTable("queries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  queryText: text("queryText").notNull(),
  result: text("result"), // JSON stringified result
  traversalPath: text("traversalPath"), // JSON stringified path through graph
  executionTime: integer("executionTime"), // milliseconds
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type Entity = typeof entities.$inferSelect;
export type InsertEntity = typeof entities.$inferInsert;
export type Relationship = typeof relationships.$inferSelect;
export type InsertRelationship = typeof relationships.$inferInsert;
export type Query = typeof queries.$inferSelect;
export type InsertQuery = typeof queries.$inferInsert;