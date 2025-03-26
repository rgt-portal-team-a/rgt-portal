import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Edit, User } from "lucide-react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Position,
  Node,
  Edge,
  NodeProps,
  EdgeProps,
  Connection,
  Handle,
  getBezierPath,
  BaseEdge,
  getSmoothStepPath,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Node data interface
interface NodeData extends Record<string, unknown> {
  label: string;
  value?: string;
  isHeader?: boolean;
}

// Edge data interface
interface EdgeData extends Record<string, unknown> {
  label?: string;
}

// Custom node styles
const nodeStyles = {
  common: {
    padding: "10px",
    borderRadius: "16px",
    width: 180,
    fontSize: "14px",
    color: "white",
    fontWeight: "medium",
  },
  header: {
    backgroundColor: "#C4A9F8",
    padding: "12px 16px",
    color: "#6E3CBC",
    fontWeight: "bold",
    fontSize: "16px",
  },
  detail: {
    backgroundColor: "#DCC6FF",
    padding: "8px 12px",
  },
};

// Custom handle style
const handleStyle = {
  width: 8,
  height: 8,
  backgroundColor: "#FFC233",
  border: "2px solid #DCC6FF",
};

// Custom edge style
const customEdgeStyle: React.CSSProperties = {
  stroke: "#FFC233",
  strokeWidth: 2,
};

// Define the main section nodes (fixed position)
const   personalDetailsNode: Node<NodeData> = {
  id: "personal-details",
  position: { x: 600, y: 30 },
  data: { label: "Personal Details", isHeader: true },
  type: "custom",
  draggable: false,
  style: { ...nodeStyles.common, ...nodeStyles.header },
  sourcePosition: Position.Right,
};

const workDetailsNode: Node<NodeData> = {
  id: "work-details",
  position: { x: 600, y: 370 },
  data: { label: "Work Details", isHeader: true },
  type: "custom",
  draggable: false,
  style: { ...nodeStyles.common, ...nodeStyles.header },
  sourcePosition: Position.Right,
};

// Define personal detail nodes (movable)
const personalDetailNodes: Node<NodeData>[] = [
  {
    id: "phone",
    position: { x: -500, y: 100 },
    data: { label: "Phone", value: "+123 456 7890" },
    type: "custom",
    style: { ...nodeStyles.common, ...nodeStyles.detail },
    parentId: "personal-details",
  },
  {
    id: "personalDetailsJunctionNode1",
    data: { label: "Junction 1" },
    position: { x: 500, y: 50 },
    draggable: false,
    type: "junctionNodeLeft",
  },
  {
    id: "personalDetailsJunctionNode3",
    data: { label: "Junction 3" },
    position: { x: 900, y: 50 },
    draggable: false,
    type: "junctionNodeRight",
  },
  {
    id: "personal-email",
    position: { x: 300, y: 150 },
    data: { label: "Personal Email", value: "giveittoparry@gmail.com" },
    type: "custom",
    style: { ...nodeStyles.common, ...nodeStyles.detail },
  },
  {
    id: "work-email",
    position: { x: 920, y: 150 },
    data: { label: "Work Email", value: "bparry@reallygreatech.com" },
    type: "custom",
    style: { ...nodeStyles.common, ...nodeStyles.detail },
  },
  {
    id: "location",
    position: { x: 1150, y: 130 },
    data: { label: "Location", value: "Accra, Great Accra, Ghana" },
    type: "custom",
    style: { ...nodeStyles.common, ...nodeStyles.detail },
  },
  {
    id: "skills",
    position: { x: 1150, y: 460 },
    data: { label: "Skills", value: "UI/UX, Front-End" },
    type: "custom",
    style: { ...nodeStyles.common, ...nodeStyles.detail },
  },
];

// Define work detail nodes (movable)
const workDetailNodes: Node<NodeData>[] = [
  {
    id: "workDetailsJunctionNode1",
    data: { label: "Junction 1" },
    position: { x: 500, y: 390 },
    draggable: false,
    type: "junctionNodeLeft",
  },
  {
    id: "workDetailsJunctionNode3",
    data: { label: "Junction 3" },
    position: { x: 900, y: 390 },
    draggable: false,
    type: "junctionNodeRight",
  },
  {
    id: "start-date",
    position: { x: -500, y: 100 },
    data: { label: "Start Date", value: "07-12-2013" },
    type: "custom",
    style: { ...nodeStyles.common, ...nodeStyles.detail },
    parentId: "work-details",
  },
  {
    id: "department",
    position: { x: 300, y: 500 },
    data: { label: "Department", value: "Design" },
    type: "custom",
    style: { ...nodeStyles.common, ...nodeStyles.detail },
  },
  {
    id: "seniority",
    position: { x: 920, y: 500 },
    data: { label: "Seniority", value: "27 years in service" },
    type: "custom",
    style: { ...nodeStyles.common, ...nodeStyles.detail },
  },
];

// Combine all nodes
const initialNodes: Node<NodeData>[] = [
  personalDetailsNode,
  workDetailsNode,
  ...personalDetailNodes,
  ...workDetailNodes,
];

// Define the edges with markers to create the dot connections
const initialEdges: Edge<EdgeData>[] = [
  // Personal details connections
  {
    id: "e-junction-personal-details",
    target: "personalDetailsJunctionNode1",
    source: "personal-details",
    sourceHandle: "left",
    targetHandle: "right",
    style: customEdgeStyle,
    type: "custom",
  },
  {
    id: "e-junction3-personal-details",
    target: "personalDetailsJunctionNode3",
    source: "personal-details",
    sourceHandle: "right",
    targetHandle: "left",
    style: customEdgeStyle,
    type: "custom",
  },
  {
    id: "e-junction-phone",
    source: "personalDetailsJunctionNode1",
    target: "phone",
    sourceHandle: "left", // bottom handle
    targetHandle: "top",
    // style: customEdgeStyle,
    type: "corner",
    data: {
      cornerRadius: 90,
      strokeColor: "#FFC107",
      strokeWidth: 2,
    },
  },
  {
    id: "e-junction1-junction2",
    source: "personalDetailsJunctionNode1",
    target: "personalDetailsJunctionNode2",
    sourceHandle: "right",
    targetHandle: "left",
    style: customEdgeStyle,
    type: "custom",
  },
  {
    id: "e-junction2-junction3",
    source: "personalDetailsJunctionNode2",
    target: "personalDetailsJunctionNode3",
    sourceHandle: "right",
    targetHandle: "left",
    style: customEdgeStyle,
    type: "custom",
  },
  {
    id: "e-junction1-pEmail",
    source: "personalDetailsJunctionNode1",
    target: "personal-email",
    sourceHandle: "left",
    targetHandle: "top",
    style: customEdgeStyle,
    type: "customCurve",
    data: {
      curveOffset: 80,
      strokeColor: "#FFC107",
      strokeWidth: 2,
    },
  },
  {
    id: "e-junction3-wEmail",
    source: "personalDetailsJunctionNode3",
    target: "work-email",
    sourceHandle: "right",
    targetHandle: "top",
    style: customEdgeStyle,
    type: "customCurveRight",
    data: {
      curveOffset: 80,
      strokeColor: "#FFC107",
      strokeWidth: 2,
    },
  },
  {
    id: "e-pEmail-wEmail",
    source: "personal-email",
    target: "work-email",
    sourceHandle: "right",
    targetHandle: "left",
    style: customEdgeStyle,
    type: "custom",
  },
  {
    id: "e-junction3-location",
    source: "personalDetailsJunctionNode3",
    target: "location",
    sourceHandle: "right",
    targetHandle: "top",
    style: customEdgeStyle,
    type: "corner",
    data: {
      cornerRadius: 90,
      strokeColor: "#FFC107",
      strokeWidth: 2,
    },
  },

  // Work details connections
  {
    id: "e-junction-work-details",
    target: "workDetailsJunctionNode1",
    source: "work-details",
    sourceHandle: "left",
    targetHandle: "right",
    style: customEdgeStyle,
    type: "custom",
  },
  {
    id: "e-junction-startDate",
    source: "workDetailsJunctionNode1",
    target: "start-date",
    sourceHandle: "left",
    targetHandle: "top",
    // style: customEdgeStyle,
    type: "corner",
    data: {
      cornerRadius: 90,
      strokeColor: "#FFC107",
      strokeWidth: 2,
    },
  },
  {
    id: "e-junction3-work-details",
    source: "work-details",
    target: "workDetailsJunctionNode3",
    sourceHandle: "right",
    targetHandle: "left",
    style: customEdgeStyle,
    type: "custom",
  },
  {
    id: "e-junction2-department",
    source: "workDetailsJunctionNode1",
    target: "department",
    sourceHandle: "left",
    targetHandle: "top",
    // style: customEdgeStyle,
    type: "customCurve",
    data: {
      curveOffset: 80, // Adjust the curve offset here
      strokeColor: "#FFC107",
      strokeWidth: 2,
    },
  },
  {
    id: "e-department-skills",
    source: "department",
    target: "skills",
    sourceHandle: "right",
    targetHandle: "left",
    // style: customEdgeStyle,
    type: "customSine",
  },
  {
    id: "e-junction3-seniority",
    source: "workDetailsJunctionNode3",
    target: "seniority",
    sourceHandle: "right",
    targetHandle: "top",
    type: "customCurveRight",
    data: {
      curveOffset: 80,
      strokeColor: "#FFC107",
      strokeWidth: 2,
    },
  },
  {
    id: "e-junction3-skills",
    source: "workDetailsJunctionNode3",
    target: "skills",
    sourceHandle: "right",
    targetHandle: "top",
    style: customEdgeStyle,
    type: "corner",
    data: {
      cornerRadius: 90,
      strokeColor: "#FFC107",
      strokeWidth: 2,
    },
  },
];

// Custom Node Component for better display of employee data with styled handles
const CustomNode: React.FC<NodeProps<Node<NodeData, string>>> = ({
  data,
  isConnectable,
}) => {
  const isHeader = data.isHeader || false;

  return (
    <div>
      {!isHeader && (
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={handleStyle}
          isConnectable={isConnectable}
        />
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={handleStyle}
        isConnectable={isConnectable}
      />

      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={handleStyle}
        isConnectable={isConnectable}
      />

      {!isHeader && (
        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom"
          style={handleStyle}
          isConnectable={isConnectable}
        />
      )}

      <div>
        <div className="font-medium">{data.label}</div>
        {data.value && !isHeader && (
          <div className="text-sm opacity-80">{data.value}</div>
        )}
      </div>
    </div>
  );
};

const JunctionNodeRight = () => (
  <div
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "#FFA500",
    }}
  >
    <Handle type="target" position={Position.Left} id="left" />
    <Handle type="source" position={Position.Bottom} id="bottom" />
    <Handle type="source" position={Position.Right} id="right" />
  </div>
);
const JunctionNodeLeft = () => (
  <div
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "#FFA500",
    }}
  >
    <Handle type="source" position={Position.Left} id="left" />
    <Handle type="source" position={Position.Bottom} id="bottom" />
    <Handle type="target" position={Position.Right} id="right" />
  </div>
);


// Map of node types to custom components
const nodeTypes = {
  custom: CustomNode,
  junctionNodeRight: JunctionNodeRight,
  junctionNodeLeft: JunctionNodeLeft,
};

// Custom edge component with correct typing
const CustomEdge: React.FC<
  EdgeProps & {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  }
> = ({ id, sourceX, sourceY, targetX, targetY, style = {} }) => {
  const edgePathString = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${
    targetX - 50
  },${targetY} ${targetX},${targetY}`;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePathString}
        style={style}
      />
      <circle cx={targetX} cy={targetY} r={4} fill="#FFC233" />
    </>
  );
};

const CustomBezierEdge: React.FC<
  EdgeProps & {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  }
> = ({ id, sourceX, sourceY, targetX, targetY, style }) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        stroke="#FFC107"
        strokeWidth={2}
        fill="none"
        style={style}
        markerEnd="url(#arrow)"
      />
      <circle cx={targetX} cy={targetY} r={5} fill="#FFC107" />
    </g>
  );
};

interface PillEdgeProps extends EdgeProps {
  data?: {
    bias?: number;
    radius?: number | null;
    strokeColor?: string;
    strokeWidth?: number;
  };
}

const PillEdge: React.FC<PillEdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
  data,
}) => {
  const {
    bias = 0.5,
    radius: customRadius = null,
    strokeColor = "#FFC107", 
    strokeWidth = 2,
  } = data || {};

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;

  // Calculate distance between points
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Adjust radius based on distance and bias
  const radius = customRadius || distance * bias;

  // Determine arc direction
  const sweepFlag = sourceX > targetX ? 0 : 1;
  const largeArcFlag = Math.abs(dx) > Math.abs(dy) ? 1 : 0;

  // Calculate control points for a more pill-like curve
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const edgePath = `
    M ${sourceX} ${sourceY}
    A ${radius} ${radius} 
    0 ${largeArcFlag} ${sweepFlag} 
    ${midX} ${midY}
    A ${radius} ${radius}
    0 ${largeArcFlag} ${sweepFlag}
    ${targetX} ${targetY}
  `;

  return (
    <path
      id={id}
      d={edgePath}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className="transition-all duration-300 ease-in-out"
    />
  );
};


interface CurvedEdgeProps extends EdgeProps {
  data?: {
    strokeColor?: string;
    strokeWidth?: number;
    curveOffset?: number; // Added curveOffset prop
  };
}

const CurvedEdge: React.FC<CurvedEdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
  data,
}) => {
  const {
    strokeColor = "#FFC107",
    strokeWidth = 2,
    curveOffset = 50, // Default curve offset if not provided
  } = data || {};


  // Calculate the midpoint of the line
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Calculate the angle of the line
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);

  // Calculate the control point for the curve
  const controlX = midX + curveOffset * Math.cos(angle + Math.PI / 2); // Perpendicular offset
  const controlY = midY + curveOffset * Math.sin(angle + Math.PI / 2);

  // Construct the curved path
  const curvedPath = `
    M ${sourceX} ${sourceY}
    Q ${controlX} ${controlY} ${targetX} ${targetY}
  `;

  return (
    <path
      id={id}
      d={curvedPath}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className="transition-all duration-300 ease-in-out"
    />
  );
};

const CurvedEdgeRight: React.FC<CurvedEdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
  data,
}) => {
  const {
    strokeColor = "#FFC107",
    strokeWidth = 2,
    curveOffset = 50, // Default curve offset if not provided
  } = data || {};



  // Calculate the midpoint of the line
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Calculate the angle of the line
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);

  // Calculate the control point for the curve
  const controlX = midX - curveOffset * Math.cos(angle + Math.PI / 2); // Perpendicular offset
  const controlY = midY - curveOffset * Math.sin(angle + Math.PI / 2);

  // Construct the curved path
  const curvedPath = `
    M ${sourceX} ${sourceY}
    Q ${controlX} ${controlY} ${targetX} ${targetY}
  `;

  return (
    <path
      id={id}
      d={curvedPath}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className="transition-all duration-300 ease-in-out"
    />
  );
};

interface CornerEdgeProps extends EdgeProps {
  data?: {
    strokeColor?: string;
    strokeWidth?: number;
    cornerRadius?: number; // Added cornerRadius prop
  };
}

const CornerEdge: React.FC<CornerEdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
  data,
}) => {
  const {
    strokeColor = "#FFC107",
    strokeWidth = 2,
    cornerRadius = 30, // Default corner radius if not provided
  } = data || {};

  // Calculate the difference between source and target coordinates
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;

  // Determine the direction of the corner
  const cornerDirectionX = dx > 0 ? 1 : -1;
  const cornerDirectionY = dy > 0 ? 1 : -1;

  // Calculate the corner point
  const cornerX = sourceX + cornerDirectionX * cornerRadius;
  const cornerY = sourceY + cornerDirectionY * cornerRadius;

  // Calculate the second corner point
  const secondCornerX = targetX - cornerDirectionX * cornerRadius;
  const secondCornerY = targetY - cornerDirectionY * cornerRadius;

  // Construct the path with rounded corners
  const cornerPath = `
    M ${sourceX} ${sourceY}
    L ${cornerX} ${sourceY}
    Q ${cornerX} ${sourceY} ${cornerX} ${cornerY}
    L ${cornerX} ${secondCornerY}
    Q ${cornerX} ${targetY} ${secondCornerX} ${targetY}
    L ${targetX} ${targetY}
  `;

  return (
    <path
      id={id}
      d={cornerPath}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className="transition-all duration-300 ease-in-out"
    />
  );
};


const CustomStepEdge: React.FC<
  EdgeProps & {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  }
> = ({ id, sourceX, sourceY, targetX, targetY, style }) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 90, 
  });

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        stroke="#FFC107"
        strokeWidth={2}
        fill="none"
        style={style}
      />
      <circle cx={targetX} cy={targetY} r={5} fill="#FFC107" />
    </g>
  );
};

const CustomSineEdge: React.FC<
  EdgeProps & {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
  }
> = ({ id, sourceX, sourceY, targetX, targetY }) => {
  const centerX = (targetX - sourceX) / 2 + sourceX;
  const centerY = (targetY - sourceY) / 2 + sourceY;

  const edgePath = `
  M ${sourceX} ${sourceY} 
  Q ${(targetX - sourceX) * 0.2 + sourceX} ${
    targetY * 1.1
  } ${centerX} ${centerY}
  Q ${(targetX - sourceX) * 0.8 + sourceX} ${
    sourceY * 0.9
  } ${targetX} ${targetY}
  `;

  return <BaseEdge id={id} path={edgePath} />;
}


interface ArcEdgeProps extends EdgeProps {
  data?: {
    strokeColor?: string;
    strokeWidth?: number;
    radius?: number; // Added radius prop
  };
}

const ArcEdge: React.FC<ArcEdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
  data,
}) => {
  const {
    strokeColor = "#FFC107",
    strokeWidth = 2,
    radius = 20, // Default radius if not provided
  } = data || {};



  // Calculate the midpoint of the line
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Calculate the angle of the line
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);

  // Calculate the control point for the arc
  const controlX = midX + radius * Math.sin(angle);
  const controlY = midY - radius * Math.cos(angle);

  // Construct the arc path
  const arcPath = `
    M ${sourceX} ${sourceY}
    Q ${controlX} ${controlY} ${targetX} ${targetY}
  `;

  return (
    <path
      id={id}
      d={arcPath}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className="transition-all duration-300 ease-in-out"
    />
  );
};





// Map of edge types
const edgeTypes = {
  custom: CustomEdge,
  customBezier: CustomBezierEdge,
  customStep: CustomStepEdge,
  customSine: CustomSineEdge,
  pillEdge: PillEdge,
  customArc: ArcEdge,
  customCurve: CurvedEdge,
  customCurveRight: CurvedEdgeRight,
  cornerEdge: CornerEdge,
};

// Interface for employee data
interface EmployeeData {
  name: string;
  title: string;
  status: string;
  personalDetails: {
    phone: string;
    personalEmail: string;
    workEmail: string;
    location: string;
    skills: string;
  };
  workDetails: {
    startDate: string;
    department: string;
    seniority: string;
  };
}

const EmployeeProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "custom",
            style: customEdgeStyle,
          },
          eds
        )
      ),
    [setEdges]
  );

  const employee: EmployeeData = {
    name: "Bernard Parry Koranteng",
    title: "Senior UI/UX",
    status: "Active",
    personalDetails: {
      phone: "+123 456 7890",
      personalEmail: "giveittoparry@gmail.com",
      workEmail: "bparry@reallygreatech.com",
      location: "Accra, Great Accra, Ghana",
      skills: "UI/UX, Front-End",
    },
    workDetails: {
      startDate: "07-12-2013",
      department: "Design",
      seniority: "27 years in service",
    },
  };

  // This will ensure edges follow nodes when moved
  const onNodeDragStop = (_event: React.MouseEvent, node: Node) => {
    // Only allow specific nodes to be moved
    if (node.id === "personal-details" || node.id === "work-details") {
      return;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen w-full p-4">
      {/* Header with Breadcrumbs */}
      <div className="mb-4">
        <h1 className="text-2xl font-medium text-slate-600">
          Employee Profile
        </h1>
        <div className="flex items-center text-sm text-slate-500">
          <span>Employee Cards</span>
          <span className="mx-2">&gt;</span>
          <span>Employee Profile</span>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-purple-50 py-6 px-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-purple-200 flex items-center justify-center">
                <User size={32} className="text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium text-slate-700">
                    {employee.name}
                  </h2>
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                    {employee.status}
                  </span>
                </div>
                <p className="text-slate-500">{employee.title}</p>
              </div>
            </div>

            {/* Custom Fluid Tabs */}
            <div className="relative">
              {/* Tabs Background */}
              <div className="absolute inset-0 bg-purple-50 h-12"></div>

              {/* Tabs Container */}
              <div className="relative flex px-6 z-10">
                {/* Details Tab with Fluid Connection */}
                <div
                  className={`relative cursor-pointer ${
                    activeTab === "details"
                      ? "text-purple-700"
                      : "text-slate-500"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  {activeTab === "details" && (
                    <div
                      className="absolute -bottom-6 left-0 right-0 h-12 bg-white"
                      style={{
                        borderTopLeftRadius: "60px",
                        borderTopRightRadius: "60px",
                        width: "100%",
                        left: "0%",
                        bottom: "-70px",
                        height: "100px",
                        zIndex: -1,
                      }}
                    ></div>
                  )}
                  <span className="relative z-10 pt-10 px-8 text-sm block">
                    Details
                  </span>
                </div>

                {/* Activity Tab */}
                <div
                  className={`relative cursor-pointer ${
                    activeTab === "activity"
                      ? "text-purple-700"
                      : "text-slate-500"
                  }`}
                  onClick={() => setActiveTab("activity")}
                >
                  {activeTab === "activity" && (
                    <div
                      className="absolute -bottom-6 left-0 right-0 h-12 bg-white"
                      style={{
                        borderTopLeftRadius: "60px",
                        borderTopRightRadius: "60px",
                        width: "120%",
                        left: "0%",
                        bottom: "-70px",
                        height: "100px",
                        zIndex: -1,
                      }}
                    ></div>
                  )}
                  <span className="relative z-10 pt-10 px-8 text-sm block">
                    Activity
                  </span>
                </div>
              </div>
            </div>

            <button className="text-purple-500 hover:text-purple-700 p-4">
              <Edit size={18} />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6">
          {activeTab === "details" && (
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
                  style: customEdgeStyle,
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
                {/* <MiniMap /> */}
              </ReactFlow>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="text-center p-8 text-slate-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Activity Timeline */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-slate-700">
                    Recent Activities
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5 mr-3"></div>
                      <div>
                        <p className="text-sm text-slate-600">
                          Updated Profile Information
                        </p>
                        <span className="text-xs text-slate-500">
                          2 hours ago
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 mr-3"></div>
                      <div>
                        <p className="text-sm text-slate-600">
                          Completed Training Module
                        </p>
                        <span className="text-xs text-slate-500">
                          Yesterday
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 mr-3"></div>
                      <div>
                        <p className="text-sm text-slate-600">
                          Performance Review Submitted
                        </p>
                        <span className="text-xs text-slate-500">
                          Last Week
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-slate-700">
                    Performance Metrics
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Project Completion</span>
                        <span className="text-green-600">85%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Client Satisfaction</span>
                        <span className="text-purple-600">92%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-purple-500 h-2.5 rounded-full"
                          style={{ width: "92%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Team Collaboration</span>
                        <span className="text-blue-600">78%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full"
                          style={{ width: "78%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-slate-700">
                    Upcoming Events
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold">14</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">
                          Quarterly Team Meeting
                        </p>
                        <span className="text-xs text-slate-500">
                          April 14, 2025 - 10:00 AM
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold">22</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">
                          Performance Review
                        </p>
                        <span className="text-xs text-slate-500">
                          April 22, 2025 - 2:00 PM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
