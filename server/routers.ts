import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";
import pdfParse from "pdf-parse";
import {
  createDocument,
  getUserDocuments,
  deleteDocument,
  createEntity,
  createRelationship,
  getGraphData,
  getUserQueries,
  createQuery,
} from "./db";
import { extractEntitiesAndRelationships, processQuery } from "./graphRag";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
  }),

  documents: router({
    list: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) throw new Error("User not found");
      return getUserDocuments(ctx.user.id);
    }),

    upload: publicProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileSize: z.number(),
          content: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        console.log(`[Upload] Starting upload for ${input.fileName}`);
        if (!ctx.user) throw new Error("User not found");
        
        const s3Key = `documents/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(s3Key, input.content, input.mimeType);

        const result = await createDocument({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileSize: input.fileSize,
          content: input.content,
          mimeType: input.mimeType,
          s3Key,
          s3Url: url,
        });

        console.log(`[Upload] Document created, starting extraction...`);

        // Normalize document text for extraction. For PDFs, the frontend sends
        // base64-encoded content which we convert back to a Buffer and parse
        // with pdf-parse to get clean text. For text/markdown files we use the
        // raw text content directly.
        let documentText = input.content;

        const isPdf =
          input.mimeType === "application/pdf" ||
          input.fileName.toLowerCase().endsWith(".pdf");

        if (isPdf) {
          try {
            const buffer = Buffer.from(input.content, "base64");
            const parsed = await pdfParse(buffer);
            documentText = parsed.text || "";
            console.log(
              `[Upload] Parsed PDF text length: ${documentText.length} characters`
            );
          } catch (err) {
            console.error("[Upload] Error parsing PDF, falling back to raw content", err);
          }
        }

        const extraction = await extractEntitiesAndRelationships(
          documentText,
          input.fileName
        );
        console.log(`[Upload] Extracted ${extraction.entities.length} entities`);

        const documentId = result?.id;
        if (!documentId) {
          throw new Error("Failed to retrieve document ID after insertion");
        }

        const entityMap = new Map<string, number>();
        for (const entity of extraction.entities) {
          const entityResult = await createEntity({
            userId: ctx.user.id,
            name: entity.name,
            type: entity.type,
            description: entity.description,
            confidence: Math.round(entity.confidence),
            sourceDocumentId: documentId,
          });
          const entityId = entityResult?.id;
          if (entityId) {
            entityMap.set(entity.name, entityId);
          }
        }

        for (const rel of extraction.relationships) {
          const sourceId = entityMap.get(rel.sourceEntity);
          const targetId = entityMap.get(rel.targetEntity);
          if (sourceId && targetId) {
            await createRelationship({
              userId: ctx.user.id,
              sourceEntityId: sourceId,
              targetEntityId: targetId,
              relationshipType: rel.relationshipType,
              confidence: Math.round(rel.confidence),
              sourceDocumentId: documentId,
            });
          }
        }

        return {
          success: true,
          documentId,
          entitiesExtracted: extraction.entities.length,
          relationshipsExtracted: extraction.relationships.length,
        };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("User not found");
        return deleteDocument(input.id, ctx.user.id);
      }),
  }),

  graph: router({
    getData: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) throw new Error("User not found");
      return getGraphData(ctx.user.id);
    }),

    query: publicProcedure
      .input(z.object({ queryText: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // DEBUG LOG: If you don't see this, the request isn't reaching the server
        console.log(`[Graph Query] Received query: "${input.queryText}"`);
        
        if (!ctx.user) throw new Error("User not found");
        
        const startTime = Date.now();
        const graphData = await getGraphData(ctx.user.id);

        console.log(`[Graph Query] Graph context size: ${graphData.nodes.length} nodes`);

        const result = await processQuery(input.queryText, graphData);
        const executionTime = Date.now() - startTime;

        await createQuery({
          userId: ctx.user.id,
          queryText: input.queryText,
          result: JSON.stringify(result),
          traversalPath: JSON.stringify(result.traversalPath),
          executionTime,
        });

        console.log(`[Graph Query] Completed in ${executionTime}ms`);

        return {
          answer: result.answer,
          relevantNodes: result.relevantNodes,
          traversalPath: result.traversalPath,
          executionTime,
        };
      }),

    history: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) throw new Error("User not found");
      return getUserQueries(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;