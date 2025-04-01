import { CustomNode, JunctionNodeRight, JunctionNodeLeft } from "./customNodes";
import {
  CustomEdge,
  CustomBezierEdge,
  CustomStepEdge,
  CustomSineEdge,
  PillEdge,
//   CustomArcEdge,
  CurvedEdge,
  CurvedEdgeRight,
  CornerEdge,
} from "./customEdges";

export const nodeTypes = {
  custom: CustomNode,
  junctionNodeRight: JunctionNodeRight,
  junctionNodeLeft: JunctionNodeLeft,
};

export const edgeTypes = {
  custom: CustomEdge,
  customBezier: CustomBezierEdge,
  customStep: CustomStepEdge,
  customSine: CustomSineEdge,
  pillEdge: PillEdge,
//   customArc: CustomArcEdge,
  customCurve: CurvedEdge,
  customCurveRight: CurvedEdgeRight,
  cornerEdge: CornerEdge,
};
