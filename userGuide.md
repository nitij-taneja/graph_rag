# Graph RAG Demo - User Guide

## Website Overview

**Purpose:** Upload documents, automatically extract knowledge graphs, and query using natural language powered by Gemini AI.

**Access:** Login required via Manus OAuth authentication.

---

## Powered by Manus

This application is built with cutting-edge technology:

**Frontend:** React 19 with TypeScript, Tailwind CSS 4, and shadcn/ui components for a modern, responsive interface.

**Backend:** Express.js 4 with tRPC 11 for type-safe API communication, featuring automatic entity and relationship extraction.

**Database:** MySQL with Drizzle ORM for reliable data persistence and graph structure management.

**AI Integration:** Google Gemini LLM for intelligent entity extraction, relationship mapping, and natural language query processing.

**Deployment:** Auto-scaling infrastructure with global CDN, ensuring fast performance and high availability worldwide.

---

## Using Your Website

### 1. Upload Documents

Start by uploading documents to build your knowledge graph:

1. Click the **"Click to upload or drag files"** area in the left panel
2. Select TXT, PDF, or Markdown files (5-10 documents recommended)
3. Watch as the system automatically processes and extracts entities
4. See the success message confirming extraction complete

The system extracts entities like people, organizations, locations, and concepts automatically using AI.

### 2. Explore the Knowledge Graph

View your extracted knowledge in the right panel:

1. See all extracted entities as colored nodes (different colors for different types)
2. Relationships between entities appear as connecting lines
3. Confidence scores (0-100%) indicate extraction quality
4. Hover over nodes to see detailed information
5. Click and drag nodes to rearrange the visualization

The graph updates in real-time as you upload more documents, building a comprehensive knowledge network.

### 3. Query Your Knowledge Graph

Ask questions about your documents using natural language:

1. Type your question in the middle panel (e.g., "Who works at which organization?")
2. Click the **"Query"** button or press Enter
3. The AI processes your question against the knowledge graph
4. View the answer with highlighted relevant entities
5. See execution time showing how fast the query was processed

The system highlights which entities were used to answer your question, showing the traversal path through the graph.

### 4. Manage Your Documents

Keep your knowledge graph organized:

1. View all uploaded documents in the left panel list
2. Click the trash icon next to any document to remove it
3. Removing a document also removes its extracted entities and relationships
4. Upload new documents anytime to expand your knowledge graph

---

## Managing Your Website

### Settings & Configuration

Access the Management UI to configure your application:

1. **Settings Panel:** Customize your website title and logo
2. **Secrets Panel:** Manage your Gemini API key securely
3. **Database Panel:** View and manage your knowledge graph data
4. **Dashboard:** Monitor usage statistics and performance metrics

### Uploading Documents

The upload system supports:

- **Text files (.txt):** Plain text documents
- **Markdown (.md):** Formatted documents with structure
- **PDF files (.pdf):** Scanned or digital documents

File size limit: 10MB per document. The system processes each file and automatically extracts all entities and relationships.

### Query History

Your queries are saved automatically:

1. View recent queries in the middle panel
2. See execution times for performance tracking
3. Query history helps you understand what information your graph contains
4. Use previous queries as templates for new questions

---

## Next Steps

Talk to Manus AI anytime to request changes or add features to your Graph RAG application.

**Ready to explore?** Start by uploading a document about your favorite topic, then ask questions to see how the knowledge graph captures relationships and entities. The more documents you upload, the richer and more useful your knowledge graph becomes!

---

## Tips for Best Results

**Document Selection:** Choose documents with clear entities and relationships for better extraction quality.

**Query Phrasing:** Ask specific questions about entities, relationships, or connections in your documents.

**Graph Exploration:** Use the interactive visualization to discover unexpected connections between concepts.

**Confidence Scores:** Higher confidence scores indicate stronger entity and relationship extraction. Use these to gauge answer reliability.
