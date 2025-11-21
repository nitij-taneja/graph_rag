import { invokeLLM } from "./_core/llm";

export interface ExtractedEntity {
  name: string;
  type: string;
  description?: string;
  confidence: number;
}

export interface ExtractedRelationship {
  sourceEntity: string;
  targetEntity: string;
  relationshipType: string;
  confidence: number;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  relationships: ExtractedRelationship[];
}

// Helper to strip Markdown/code fences and isolate the JSON object if Gemini adds extra text
function cleanJson(text: string): string {
  // Remove common markdown fences
  const withoutFences = text.replace(/```json\s*|```/g, "").trim();

  // If the model wrapped JSON with any prose, try to slice from the first
  // opening brace to the last closing brace to get a valid JSON object.
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    return withoutFences.slice(start, end + 1).trim();
  }

  return withoutFences;
}

export async function extractEntitiesAndRelationships(
  documentText: string,
  fileName: string
): Promise<ExtractionResult> {
  const prompt = `You are an expert knowledge graph builder. Extract all entities and relationships from the following document.

Document: "${fileName}"
Content:
${documentText.slice(0, 20000)}

Rules:
1. Extract key entities and their relationships.
2. Confidence scores 0-100.
3. You MUST respond as valid JSON matching the provided JSON schema.
`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a JSON extraction engine." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "extraction_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              entities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: {
                      type: "string",
                      enum: [
                        "Person",
                        "Organization",
                        "Location",
                        "Concept",
                        "Event",
                        "Product",
                        "Other",
                      ],
                    },
                    description: { type: "string" },
                    confidence: { type: "number" },
                  },
                  required: ["name", "type", "confidence"],
                  additionalProperties: false,
                },
              },
              relationships: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    sourceEntity: { type: "string" },
                    targetEntity: { type: "string" },
                    relationshipType: { type: "string" },
                    confidence: { type: "number" },
                  },
                  required: [
                    "sourceEntity",
                    "targetEntity",
                    "relationshipType",
                    "confidence",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["entities", "relationships"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content as any;

    // Depending on the API, content may already be a parsed object or a JSON string.
    let result: ExtractionResult;
    if (typeof content === "string") {
      const cleaned = cleanJson(content);
      result = JSON.parse(cleaned) as ExtractionResult;
    } else if (Array.isArray(content)) {
      const textPart = content.find((p: any) => p?.type === "text");
      if (!textPart || typeof textPart.text !== "string") {
        return { entities: [], relationships: [] };
      }
      const cleaned = cleanJson(textPart.text);
      result = JSON.parse(cleaned) as ExtractionResult;
    } else {
      // Assume it's already an object matching the schema
      result = content as ExtractionResult;
    }

    // Validate basic structure
    if (!Array.isArray(result.entities)) result.entities = [];
    if (!Array.isArray(result.relationships)) result.relationships = [];
    return result;
  } catch (error) {
    console.error("Error extracting entities:", error);
    return { entities: [], relationships: [] };
  }
}

export async function processQuery(
  queryText: string,
  graphContext: {
    nodes: Array<{ id: number; label: string; type: string; description?: string }>;
    edges: Array<{ source: number; target: number; label: string }>;
  }
): Promise<{
  answer: string;
  relevantNodes: number[];
  traversalPath: Array<{ nodeId: number; confidence: number }>;
}> {
  const nodeMap = new Map(graphContext.nodes.map((n) => [n.id, n]));

  // Create a readable text representation of the graph
  const graphDescription = `
Knowledge Graph Data:
Nodes:
${graphContext.nodes.map((n) => `- ID ${n.id}: ${n.label} (${n.type})`).join("\n")}

Edges:
${graphContext.edges.map((e) => `- ${nodeMap.get(e.source)?.label} --[${e.label}]--> ${nodeMap.get(e.target)?.label}`).join("\n")}
`;

  const prompt = `You are a helpful assistant answering questions based *only* on the Knowledge Graph provided below.

Query: "${queryText}"

${graphDescription}

Instructions:
1. Answer the query using the graph connections.
2. Identify which Node IDs were most useful for the answer.
3. Explain the logical path you took.

Return JSON format:
{
  "answer": "string",
  "relevantNodeIds": [number],
  "traversalPath": [{"nodeId": number, "confidence": number}]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a graph query engine. Return JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      const cleaned = cleanJson(content);
      const result = JSON.parse(cleaned);
      return {
        answer: result.answer || "I couldn't find an answer in the graph.",
        relevantNodes: result.relevantNodeIds || [],
        traversalPath: result.traversalPath || [],
      };
    }

    return { answer: "Error parsing AI response", relevantNodes: [], traversalPath: [] };
  } catch (error) {
    console.error("Error processing query:", error);
    return { answer: "System Error", relevantNodes: [], traversalPath: [] };
  }
}