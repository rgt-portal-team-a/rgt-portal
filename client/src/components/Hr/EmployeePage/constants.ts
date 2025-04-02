import { Node, Edge, Position } from "@xyflow/react";
import { NodeData, EdgeData } from "./types";

export const customEdgeStyle: React.CSSProperties = {
  stroke: "#FFC233",
  strokeWidth: 2,
};

// Define node styles
export const nodeStyles = {
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

// Personal Details Node
export const personalDetailsNode: Node<NodeData> = {
  id: "personal-details",
  position: { x: 600, y: 30 },
  data: { label: "Personal Details", isHeader: true },
  type: "custom",
  draggable: false,
  style: { ...nodeStyles.common, ...nodeStyles.header },
  sourcePosition: Position.Right,
};

// Work Details Node
export const workDetailsNode: Node<NodeData> = {
  id: "work-details",
  position: { x: 600, y: 370 },
  data: { label: "Work Details", isHeader: true },
  type: "custom",
  draggable: false,
  style: { ...nodeStyles.common, ...nodeStyles.header },
  sourcePosition: Position.Right,
};

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

// Initial Nodes and Edges
export const initialNodes: Node<NodeData>[] = [
  personalDetailsNode,
  workDetailsNode,
  ...personalDetailNodes,
  ...workDetailNodes,
];

export const initialEdges: Edge<EdgeData>[] = [
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
