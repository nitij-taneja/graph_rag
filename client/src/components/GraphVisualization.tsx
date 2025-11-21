import { useEffect, useRef, useState } from "react";

export interface GraphNode {
  id: number;
  label: string;
  type: string;
  confidence: number;
  description?: string;
  highlighted?: boolean;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  id: number;
  source: number;
  target: number;
  label: string;
  confidence: number;
  highlighted?: boolean;
}

interface GraphVisualizationProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightedNodeIds?: number[];
  /** Optional sequence of node IDs representing the traversal path for a query */
  pathNodeIds?: number[];
  /** Optional list of edge IDs that belong to the traversal path */
  pathEdgeIds?: number[];
  onNodeClick?: (nodeId: number) => void;
  width?: number;
  height?: number;
}

const colorMap: Record<string, string> = {
  Person: "#FF6B6B",
  Organization: "#4ECDC4",
  Location: "#45B7D1",
  Concept: "#FFA07A",
  Event: "#98D8C8",
  Product: "#F7DC6F",
  Other: "#BDC3C7",
};

export function GraphVisualization({
  nodes,
  edges,
  highlightedNodeIds = [],
  pathNodeIds = [],
  pathEdgeIds = [],
  onNodeClick,
  width = 800,
  height = 600,
}: GraphVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const animationRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);

  // Initialize node positions
  useEffect(() => {
    nodesRef.current = nodes.map((node, index) => ({
      ...node,
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      vx: 0,
      vy: 0,
    }));
  }, [nodes.length, width, height]);

  // Force-directed layout simulation
  const simulate = () => {
    const nodeList = nodesRef.current;
    const k = Math.sqrt((width * height) / nodeList.length);
    const dt = 0.1;

    // Reset forces
    nodeList.forEach((node) => {
      node.vx = 0;
      node.vy = 0;
    });

    // Repulsive forces
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const dx = nodeList[j].x! - nodeList[i].x!;
        const dy = nodeList[j].y! - nodeList[i].y!;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (k * k) / distance;

        nodeList[i].vx! -= (force * dx) / distance;
        nodeList[i].vy! -= (force * dy) / distance;
        nodeList[j].vx! += (force * dx) / distance;
        nodeList[j].vy! += (force * dy) / distance;
      }
    }

    // Attractive forces
    edges.forEach((edge) => {
      const source = nodeList.find((n) => n.id === edge.source);
      const target = nodeList.find((n) => n.id === edge.target);
      if (source && target) {
        const dx = target.x! - source.x!;
        const dy = target.y! - source.y!;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (distance * distance) / k;

        source.vx! += (force * dx) / distance;
        source.vy! += (force * dy) / distance;
        target.vx! -= (force * dx) / distance;
        target.vy! -= (force * dy) / distance;
      }
    });

    // Update positions
    nodeList.forEach((node) => {
      node.vx = (node.vx || 0) * 0.95;
      node.vy = (node.vy || 0) * 0.95;
      node.x = (node.x || 0) + node.vx * dt;
      node.y = (node.y || 0) + node.vy * dt;

      // Boundary conditions
      const padding = 50;
      if (node.x! < -width / 2 + padding) node.x = -width / 2 + padding;
      if (node.x! > width / 2 - padding) node.x = width / 2 - padding;
      if (node.y! < -height / 2 + padding) node.y = -height / 2 + padding;
      if (node.y! > height / 2 - padding) node.y = height / 2 - padding;
    });
  };

  // Render graph
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.translate(width / 2, height / 2);

    const highlightedNodeSet = new Set(highlightedNodeIds);
    const pathNodeSet = new Set(pathNodeIds);
    const pathEdgeSet = new Set(pathEdgeIds);

    // Draw edges
    edges.forEach((edge) => {
      const source = nodesRef.current.find((n) => n.id === edge.source);
      const target = nodesRef.current.find((n) => n.id === edge.target);
      if (source && target) {
        const attachedToHighlightedNode =
          highlightedNodeSet.has(source.id) || highlightedNodeSet.has(target.id);
        const isPathEdge = pathEdgeSet.has(edge.id);
        const opacity = edge.confidence / 100;

        if (isPathEdge) {
          ctx.strokeStyle = `rgba(255, 99, 71, ${Math.max(0.6, opacity)})`;
          ctx.lineWidth = 3;
        } else if (attachedToHighlightedNode) {
          ctx.strokeStyle = `rgba(255, 107, 107, ${opacity})`;
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = `rgba(200, 200, 200, ${opacity * 0.5})`;
          ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.moveTo(source.x || 0, source.y || 0);
        ctx.lineTo(target.x || 0, target.y || 0);
        ctx.stroke();

        // Draw edge label
        const midX = ((source.x || 0) + (target.x || 0)) / 2;
        const midY = ((source.y || 0) + (target.y || 0)) / 2;
        ctx.fillStyle = "#666";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(edge.label.substring(0, 12), midX, midY - 5);
      }
    });

    // Draw nodes
    nodesRef.current.forEach((node) => {
      const isInPath = pathNodeSet.has(node.id);
      const isHighlighted = highlightedNodeSet.has(node.id) || isInPath;
      const baseRadius = 25;
      const confidenceBoost = (node.confidence / 100) * 15;
      const radius = isHighlighted
        ? baseRadius + confidenceBoost + 10
        : baseRadius + confidenceBoost;

      ctx.fillStyle = isInPath ? "#FF6347" : colorMap[node.type] || colorMap["Other"];
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
      ctx.fill();

      if (isHighlighted) {
        ctx.strokeStyle = "#FF6B6B";
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw node label
      ctx.fillStyle = "#000";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label.substring(0, 15), node.x || 0, node.y || 0);

      // Draw type label
      ctx.fillStyle = "#666";
      ctx.font = "9px Arial";
      ctx.fillText(node.type, node.x || 0, (node.y || 0) + 15);
    });

    ctx.resetTransform();
  };

  // Animation loop - run for a limited number of frames so the layout stabilizes
  useEffect(() => {
    frameCountRef.current = 0;

    const animate = () => {
      // Stop after a fixed number of frames to avoid constant trembling
      const maxFrames = 240; // ~4 seconds at 60fps
      if (frameCountRef.current >= maxFrames) {
        render();
        animationRef.current = null;
        return;
      }

      frameCountRef.current += 1;
      simulate();
      render();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [edges, highlightedNodeIds, pathNodeIds, pathEdgeIds, width, height]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;

    for (const node of nodesRef.current) {
      const dx = (node.x || 0) - x;
      const dy = (node.y || 0) - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 30) {
        onNodeClick?.(node.id);
        break;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;

    let found = false;
    for (const node of nodesRef.current) {
      const dx = (node.x || 0) - x;
      const dy = (node.y || 0) - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 30) {
        setHoveredNode(node.id);
        canvas.style.cursor = "pointer";
        found = true;
        break;
      }
    }

    if (!found) {
      setHoveredNode(null);
      canvas.style.cursor = "default";
    }
  };

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        background: "#fafafa",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
        style={{ display: "block" }}
      />
    </div>
  );
}
