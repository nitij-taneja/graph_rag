import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, BarChart3, FileText, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-purple-800/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">Graph RAG</div>
          <div>
            <Link href="/demo">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Go to Demo
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-white mb-6">
            Knowledge Graph
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Upload documents, automatically extract entities and relationships,
            and query your knowledge graph using natural language powered by
            Gemini LLM.
          </p>

          <Link href="/demo">
            <Button className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg">
              Launch Demo
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-slate-800/50 border-purple-500/20 p-8 hover:border-purple-500/50 transition">
            <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Smart Document Processing
            </h3>
            <p className="text-gray-400">
              Upload 5-10 documents and automatically extract entities,
              relationships, and concepts using advanced NLP.
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 p-8 hover:border-purple-500/50 transition">
            <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Live Graph Visualization
            </h3>
            <p className="text-gray-400">
              Watch your knowledge graph build in real-time with interactive
              visualization and confidence scoring.
            </p>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/20 p-8 hover:border-purple-500/50 transition">
            <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Natural Language Queries
            </h3>
            <p className="text-gray-400">
              Ask questions in plain English and get answers powered by Gemini
              LLM with graph traversal visualization.
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800/30 border border-purple-500/20 rounded-xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-white font-semibold mb-2">Upload</h4>
              <p className="text-gray-400 text-sm">
                Upload your documents (TXT, PDF, Markdown)
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-white font-semibold mb-2">Extract</h4>
              <p className="text-gray-400 text-sm">
                AI extracts entities and relationships automatically
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-white font-semibold mb-2">Visualize</h4>
              <p className="text-gray-400 text-sm">
                See your knowledge graph with live visualization
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="text-white font-semibold mb-2">Query</h4>
              <p className="text-gray-400 text-sm">
                Ask questions and get AI-powered answers
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h3 className="text-gray-400 text-sm font-semibold mb-6">
            POWERED BY CUTTING-EDGE TECHNOLOGY
          </h3>
          <div className="flex flex-wrap justify-center gap-4 text-gray-300">
            <span className="px-4 py-2 bg-slate-800/50 rounded-lg text-sm">
              Gemini LLM
            </span>
            <span className="px-4 py-2 bg-slate-800/50 rounded-lg text-sm">
              React 19
            </span>
            <span className="px-4 py-2 bg-slate-800/50 rounded-lg text-sm">
              Express.js
            </span>
            <span className="px-4 py-2 bg-slate-800/50 rounded-lg text-sm">
              SQLite
            </span>
            <span className="px-4 py-2 bg-slate-800/50 rounded-lg text-sm">
              tRPC
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-purple-800/30 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p>
            © 2025 Graph RAG Demo. Powered by Gemini LLM.
          </p>
        </div>
      </div>
    </div>
  );
}
