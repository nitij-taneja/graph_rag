import { eq, and, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { InsertUser, users, documents, entities, relationships, queries, InsertDocument, InsertEntity, InsertRelationship, InsertQuery } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    try {
      const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './local.db';
      const client = createClient({
        url: `file:${dbPath}`
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// --- USER OPERATIONS ---

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.sessionId) throw new Error("User sessionId is required");
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(users).where(eq(users.sessionId, user.sessionId)).limit(1);

  if (existing.length > 0) {
    await db.update(users)
      .set({ ...user, updatedAt: new Date(), lastSignedIn: new Date() })
      .where(eq(users.sessionId, user.sessionId));
  } else {
    await db.insert(users).values({
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
  }
}

export async function getUserBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.sessionId, sessionId)).limit(1);
  return result[0];
}

export async function getOrCreateDefaultUser() {
  const db = await getDb();
  if (!db) return undefined;
  const sessionId = "default-user";
  let user = await getUserBySessionId(sessionId);
  if (!user) {
    await upsertUser({ sessionId, name: "Default User", role: "user" });
    user = await getUserBySessionId(sessionId);
  }
  return user;
}

// --- DOCUMENT OPERATIONS ---

export async function createDocument(doc: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // FIX: Use .returning() to get the ID immediately
  const result = await db.insert(documents).values(doc).returning();
  return result[0];
}

export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(documents).where(eq(documents.userId, userId));
}

export async function deleteDocument(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Also delete related entities/relationships to keep DB clean
  await db.delete(entities).where(eq(entities.sourceDocumentId, id));
  await db.delete(relationships).where(eq(relationships.sourceDocumentId, id));
  return db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
}

// --- ENTITY OPERATIONS ---

export async function createEntity(entity: InsertEntity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // FIX: Use .returning()
  const result = await db.insert(entities).values(entity).returning();
  return result[0];
}

export async function getUserEntities(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(entities).where(eq(entities.userId, userId));
}

// --- RELATIONSHIP OPERATIONS ---

export async function createRelationship(rel: InsertRelationship) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // FIX: Use .returning()
  const result = await db.insert(relationships).values(rel).returning();
  return result[0];
}

export async function getUserRelationships(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(relationships).where(eq(relationships.userId, userId));
}

// --- QUERY LOGGING ---

export async function createQuery(query: InsertQuery) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(queries).values(query).returning();
}

export async function getUserQueries(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(queries).where(eq(queries.userId, userId)).orderBy(queries.createdAt);
}

// --- GRAPH DATA RETRIEVAL ---

export async function getGraphData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log(`[DB] Fetching graph data for User ID: ${userId}`);

  const userEntities = await db.select().from(entities).where(eq(entities.userId, userId));
  const userRelationships = await db.select().from(relationships).where(eq(relationships.userId, userId));
  
  console.log(`[DB] Found ${userEntities.length} entities and ${userRelationships.length} relationships`);

  return {
    nodes: userEntities.map(e => ({
      id: e.id,
      label: e.name,
      type: e.type,
      confidence: e.confidence,
      description: e.description || undefined,
    })),
    edges: userRelationships.map((r) => ({
      id: r.id,
      source: r.sourceEntityId,
      target: r.targetEntityId,
      label: r.relationshipType,
      confidence: r.confidence,
    })),
  };
}