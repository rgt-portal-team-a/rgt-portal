import React from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
} from "@xyflow/react";
import { nodeTypes, edgeTypes } from "./nodeAndEdgeTypes";

interface DetailsViewProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: any) => void;
  onNodeDragStop: (event: React.MouseEvent, node: Node) => void;
}

const DetailsView: React.FC<DetailsViewProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeDragStop,
}) => (
  <div style={{ height: "600px" }}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStop={onNodeDragStop}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={{
        type: "custom",
        style: { stroke: "#FFC233", strokeWidth: 2 },
      }}
      fitView={true}
      panOnDrag={false}
      zoomOnDoubleClick={false}
      minZoom={1}
      maxZoom={3}
      preventScrolling={false}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="#F3F4F6"
      />
      <Controls />
    </ReactFlow>
  </div>
);

export default DetailsView;
