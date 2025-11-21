# Graph RAG 

![DEMO](https://github.com/nitij-taneja/graph_rag/blob/main/graph-rag-demo-personal-microsoft-edge-2025-11-22-01-03-55_Jt76sPeg-VEED.gif)

A knowledge graph application that combines document processing with AI-powered querying using Google Gemini LLM.

Live Link : https://graph-rag-6ubr.onrender.com

## Features

- **Document Upload**: Upload TXT, PDF, and Markdown files
- **AI Entity Extraction**: Automatically extract entities and relationships from documents using Google Gemini
- **Interactive Graph Visualization**: Real-time knowledge graph display with confidence scores
- **Natural Language Queries**: Ask questions about uploaded documents using plain English
- **Graph Traversal**: View the reasoning path through the knowledge graph

## Tech Stack

### Frontend
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui components
- D3.js for graph visualization
- tRPC for type-safe API calls
- React Query for data fetching

### Backend
- Express.js server
- tRPC for API endpoints
- SQLite database with Drizzle ORM
- Google Gemini LLM for AI processing

## Prerequisites

- Node.js 18+ and pnpm
- Google Gemini API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd graph_rag_demo
```

2. Install dependencies:
```bash
pnpm install
```

**Note:** The project uses SQLite with `@libsql/client` (a pure JavaScript implementation that works on all platforms without native compilation).

3. Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=file:local.db

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret (for session management)
JWT_SECRET=your_random_secret_key_here
```

**To get a Gemini API key:**
- Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
- Click "Create API Key"
- Copy and paste it into the `.env` file

4. Initialize the database:
```bash
pnpm db:push
```

## Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5000`

## Production Build

Build the application:
```bash
pnpm build
```

Start the production server:
```bash
pnpm start
```

## Usage

1. **Upload Documents**: Click the upload button and select TXT, PDF, or Markdown files
2. **View Knowledge Graph**: The graph automatically updates as entities and relationships are extracted
3. **Query the Graph**: Type natural language questions in the query box
4. **Explore Results**: View answers with highlighted relevant nodes and traversal paths

## Project Structure

```
graph_rag_demo/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities and tRPC client
├── server/              # Express backend
│   ├── _core/           # Core server functionality
│   ├── routers.ts       # tRPC routers
│   ├── db.ts            # Database operations
│   └── graphRag.ts      # Graph RAG logic
├── drizzle/             # Database schema and migrations
└── shared/              # Shared types and constants
```

## How It Works

1. **Document Processing**: When you upload a document, the content is sent to Google Gemini
2. **Entity Extraction**: Gemini identifies entities (people, organizations, locations, concepts) and their relationships
3. **Graph Building**: Entities and relationships are stored in SQLite and visualized as a graph
4. **Query Processing**: Natural language queries are processed by Gemini using the graph context
5. **Answer Generation**: The system traverses the graph to find relevant information and generates answers

## API Endpoints

The application uses tRPC for type-safe API calls:

- `documents.list` - Get all uploaded documents
- `documents.upload` - Upload a new document
- `documents.delete` - Delete a document
- `graph.getData` - Get the knowledge graph data
- `graph.query` - Query the knowledge graph
- `graph.history` - Get query history

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

