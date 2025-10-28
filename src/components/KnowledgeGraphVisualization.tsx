/**
 * Visualisation interactive du Knowledge Graph
 * Utilise React Flow pour afficher les relations entre concepts/questions/thèmes
 * Cycle IADE-2, Tâche 2
 */

import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import knowledgeGraphData from '../data/concours/knowledge-graph.json';

interface KGNode {
  id: string;
  type: string;
  label: string;
  properties: any;
}

interface KGEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export default function KnowledgeGraphVisualization() {
  const [selectedNode, setSelectedNode] = useState<KGNode | null>(null);
  const [filter, setFilter] = useState<'all' | 'Theme' | 'Question' | 'Concept'>('all');

  // Convertir les données KG en format React Flow
  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    const kg = knowledgeGraphData as { nodes: KGNode[]; edges: KGEdge[] };
    
    // Filtrer les nœuds
    const filteredNodes = filter === 'all' 
      ? kg.nodes 
      : kg.nodes.filter(n => n.type === filter);

    // Créer les nœuds React Flow
    const nodes: Node[] = filteredNodes.map((node, index) => {
      const angle = (index / filteredNodes.length) * 2 * Math.PI;
      const radius = 300;
      
      return {
        id: node.id,
        type: 'default',
        position: {
          x: 400 + radius * Math.cos(angle),
          y: 400 + radius * Math.sin(angle)
        },
        data: {
          label: node.label.length > 30 ? node.label.substring(0, 30) + '...' : node.label
        },
        style: {
          background: getNodeColor(node.type),
          color: '#fff',
          border: '2px solid #222',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      };
    });

    // Créer les edges React Flow
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const edges: Edge[] = kg.edges
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((edge, index) => ({
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        label: edge.relation,
        type: 'smoothstep',
        animated: edge.weight > 0.7,
        style: { stroke: getEdgeColor(edge.relation), strokeWidth: edge.weight * 3 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getEdgeColor(edge.relation)
        }
      }));

    return { nodes, edges };
  }, [filter]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  const onNodeClick = useCallback((_event: any, node: Node) => {
    const kgNode = (knowledgeGraphData as any).nodes.find((n: KGNode) => n.id === node.id);
    setSelectedNode(kgNode || null);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900">🧠 Knowledge Graph IADE</h1>
          <p className="text-sm text-gray-600">
            {nodes.length} nœuds · {edges.length} relations
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('Theme')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'Theme'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Thèmes
          </button>
          <button
            onClick={() => setFilter('Question')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'Question'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setFilter('Concept')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'Concept'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Concepts
          </button>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          
          <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg max-w-sm">
            <h3 className="font-bold text-gray-800 mb-2">Légende</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: '#3B82F6' }}></div>
                <span>Thème</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: '#10B981' }}></div>
                <span>Question</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: '#8B5CF6' }}></div>
                <span>Concept</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>

        {/* Node Details Panel */}
        {selectedNode && (
          <div className="absolute top-4 left-4 bg-white p-6 rounded-xl shadow-2xl max-w-md border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-indigo-900">Détails du nœud</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-medium">Type</p>
                <p className="text-sm font-semibold" style={{ color: getNodeColor(selectedNode.type) }}>
                  {selectedNode.type}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium">Label</p>
                <p className="text-sm text-gray-800">{selectedNode.label}</p>
              </div>

              {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-2">Propriétés</p>
                  <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                    {Object.entries(selectedNode.properties).slice(0, 5).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium text-gray-600">{key}:</span>
                        <span className="text-gray-800">
                          {typeof value === 'string' && value.length > 30
                            ? value.substring(0, 30) + '...'
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Relations</p>
                <div className="flex flex-wrap gap-1">
                  {(knowledgeGraphData as any).edges
                    .filter((e: KGEdge) => e.source === selectedNode.id || e.target === selectedNode.id)
                    .slice(0, 5)
                    .map((edge: KGEdge, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium"
                      >
                        {edge.relation}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getNodeColor(type: string): string {
  switch (type) {
    case 'Theme':
      return '#3B82F6'; // Blue
    case 'Question':
      return '#10B981'; // Green
    case 'Concept':
      return '#8B5CF6'; // Purple
    case 'Section':
      return '#F59E0B'; // Amber
    default:
      return '#6B7280'; // Gray
  }
}

function getEdgeColor(relation: string): string {
  switch (relation) {
    case 'HAS_THEME':
      return '#3B82F6';
    case 'MENTIONS_CONCEPT':
      return '#8B5CF6';
    case 'SIMILAR_THEME':
      return '#10B981';
    case 'DEPENDS_ON':
      return '#F59E0B';
    default:
      return '#9CA3AF';
  }
}

