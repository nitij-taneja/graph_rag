import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraphVisualization } from "@/components/GraphVisualization";
import { trpc } from "@/lib/trpc";
import { Upload, Send, Loader2, Trash2, Maximize2, Minimize2 } from "lucide-react";
import { useState, useRef } from "react";
import { Streamdown } from "streamdown";

export default function GraphRAGDemo() {
  const [queryText, setQueryText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<number[]>([]);
  const [pathNodeIds, setPathNodeIds] = useState<number[]>([]);
  const [pathEdgeIds, setPathEdgeIds] = useState<number[]>([]);
  const [isGraphExpanded, setIsGraphExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: documents } = trpc.documents.list.useQuery();
  const { data: graphData } = trpc.graph.getData.useQuery();
  const { data: queryHistory } = trpc.graph.history.useQuery();

  // Mutations
  const utils = trpc.useUtils();
  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      utils.graph.getData.invalidate();
    },
  });
  const queryMutation = trpc.graph.query.useMutation({
    onSuccess: (result) => {
      // Highlight relevant nodes returned by the LLM
      setHighlightedNodeIds(result.relevantNodes ?? []);

      // Derive a traversal path (nodes & edges) from the result using the
      // current graph data
      if (graphData && result.traversalPath && result.traversalPath.length > 0) {
        const nodeSeq = result.traversalPath.map((p) => p.nodeId);
        setPathNodeIds(nodeSeq);

        const edgeIds: number[] = [];
        for (let i = 0; i < nodeSeq.length - 1; i++) {
          const a = nodeSeq[i];
          const b = nodeSeq[i + 1];
          const edge = graphData.edges.find(
            (e) =>
              (e.source === a && e.target === b) ||
              (e.source === b && e.target === a)
          );
          if (edge) {
            edgeIds.push(edge.id);
          }
        }
        setPathEdgeIds(edgeIds);
      } else {
        setPathNodeIds([]);
        setPathEdgeIds([]);
      }

      utils.graph.history.invalidate();
    },
  });
  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      utils.graph.getData.invalidate();
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    let content: string;
    let mimeType = file.type || "text/plain";

    const isPdf =
      mimeType === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      // Read the PDF as binary and convert to base64 so the backend can
      // reconstruct a Buffer and run pdf-parse on it.
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      content = btoa(binary);
      mimeType = "application/pdf";
    } else {
      // Plain text / markdown files can be read directly as UTF-8 text
      content = await file.text();
    }

    uploadMutation.mutate(
      {
        fileName: file.name,
        fileSize: file.size,
        content,
        mimeType,
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        onError: (error) => {
          console.error("Upload error:", error);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      }
    );
  };

  const handleQuery = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!queryText.trim()) return;

    queryMutation.mutate(
      { queryText },
      {
        onSuccess: () => {
          // State is already updated in the mutation's onSuccess above
          setQueryText("");
        },
        onError: (error) => {
          console.error("Query error:", error);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  const handleDeleteDocument = (docId: number) => {
    deleteMutation.mutate({ id: docId });
  };

  // Take the most recent query (history is ordered by createdAt ascending in the DB)
  const lastQuery = queryHistory && queryHistory.length > 0
    ? queryHistory[queryHistory.length - 1]
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Graph RAG Demo
          </h1>
          <p className="text-gray-600">
            Upload documents, extract knowledge graphs, and query with natural
            language
          </p>
        </div>

        <div
          className={
            isGraphExpanded
              ? "grid grid-cols-3 gap-6 lg:grid-cols-[1fr_1fr_2fr]"
              : "grid grid-cols-3 gap-6"
          }
        >
          {/* Left Panel: File Upload */}
          <Card className="p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Upload Documents</h2>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  disabled={uploadMutation.isPending}
                  className="hidden"
                  accept=".txt,.pdf,.md"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm font-medium text-gray-700">
                    {uploadMutation.isPending
                      ? "Processing..."
                      : "Click to upload or drag files"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    TXT, PDF, or Markdown files
                  </p>
                </button>
              </div>

              {uploadMutation.isPending && (
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-sm">Extracting entities...</span>
                </div>
              )}

              {uploadMutation.isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
                  ✓ Document processed successfully
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-700">
                  Uploaded Documents
                </h3>
                {documents && documents.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                      >
                        <span className="truncate text-gray-700">
                          {doc.fileName}
                        </span>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No documents yet</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
                <strong>Tip:</strong> Upload documents to automatically extract
                entities and relationships
              </div>
            </div>
          </Card>

          {/* Middle Panel: Query */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Query Knowledge Graph</h2>

            <form onSubmit={handleQuery} className="space-y-4 h-full flex flex-col">
              <div className="flex-1">
                <Textarea
                  placeholder="Ask a question about your documents..."
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={queryMutation.isPending}
                  className="w-full h-24 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={!queryText.trim() || queryMutation.isPending}
                className="w-full"
              >
                {queryMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Query
                  </>
                )}
              </Button>

              {lastQuery && (
                <div className="space-y-3 flex-1 overflow-y-auto">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500 mb-2">Query:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lastQuery.queryText}
                    </p>
                  </div>

                  {lastQuery.result && (
                    <div className="bg-blue-50 rounded p-3 space-y-2">
                      <p className="text-xs text-gray-500">Answer:</p>
                      <div className="text-sm text-gray-900">
                        <Streamdown>
                          {(() => {
                            try {
                              const result = JSON.parse(lastQuery.result);
                              return result.answer || "No answer available";
                            } catch {
                              return lastQuery.result;
                            }
                          })()}
                        </Streamdown>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Execution time:{" "}
                        {lastQuery.executionTime
                          ? `${lastQuery.executionTime}ms`
                          : "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </Card>

          {/* Right Panel: Graph Visualization */}
          <Card className={isGraphExpanded ? "p-4 col-span-3 lg:col-span-1 lg:col-start-3" : "p-6"}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Knowledge Graph</h2>
              <button
                type="button"
                onClick={() => setIsGraphExpanded((v) => !v)}
                className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
              >
                {isGraphExpanded ? (
                  <>
                    <Minimize2 className="mr-1" size={14} />
                    Collapse
                  </>
                ) : (
                  <>
                    <Maximize2 className="mr-1" size={14} />
                    Expand
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {graphData && graphData.nodes.length > 0 ? (
                <div className="bg-white rounded border border-gray-200">
                  <GraphVisualization
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    highlightedNodeIds={highlightedNodeIds}
                    pathNodeIds={pathNodeIds}
                    pathEdgeIds={pathEdgeIds}
                    onNodeClick={(nodeId) => {
                      setHighlightedNodeIds([nodeId]);
                    }}
                    width={isGraphExpanded ? 800 : 380}
                    height={isGraphExpanded ? 600 : 500}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded border border-gray-200">
                  <p className="text-gray-500 text-center">
                    Upload documents to build the knowledge graph
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded p-3 text-xs space-y-1">
                <p className="font-semibold text-gray-700">Graph Stats</p>
                <p className="text-gray-600">
                  Nodes: {graphData?.nodes.length || 0}
                </p>
                <p className="text-gray-600">
                  Edges: {graphData?.edges.length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
