import {
  EdgeProps,
  getBezierPath,
  BaseEdge,
  getSmoothStepPath,
} from "@xyflow/react";

export const CustomEdge: React.FC<
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
        className="react-flow__edge-path "
        d={edgePathString}
        style={style}
      />
      {/* <circle cx={targetX} cy={targetY} r={4} fill="#FFC233" /> */}
    </>
  );
};

export const CustomBezierEdge: React.FC<
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

export const PillEdge: React.FC<PillEdgeProps> = ({
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
    curveOffset?: number;
  };
}

export const CurvedEdge: React.FC<CurvedEdgeProps> = ({
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

export const CurvedEdgeRight: React.FC<CurvedEdgeProps> = ({
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

export const CornerEdge: React.FC<CornerEdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
  data,
}) => {
  const {
    strokeColor = "#FFC233", // Yellow color matching the image
    strokeWidth = 2,
    cornerRadius = 16, // Smaller corner radius
  } = data || {};

  // Determine if we need to go horizontally first or vertically first
  // This makes the component adaptable to different source/target positions
  const horizontalFirst =
    Math.abs(targetX - sourceX) > Math.abs(targetY - sourceY);

  let path = "";

  if (horizontalFirst) {
    // Horizontal then vertical (like in the image)
    const xDirection = targetX > sourceX ? 1 : -1;
    const yDirection = targetY > sourceY ? 1 : -1;

    path = `
      M ${sourceX} ${sourceY}
      H ${targetX - xDirection * cornerRadius}
      Q ${targetX} ${sourceY} ${targetX} ${sourceY + yDirection * cornerRadius}
      V ${targetY}
    `;
  } else {
    // Vertical then horizontal
    const xDirection = targetX > sourceX ? 1 : -1;
    const yDirection = targetY > sourceY ? 1 : -1;

    path = `
      M ${sourceX} ${sourceY}
      V ${targetY - yDirection * cornerRadius}
      Q ${sourceX} ${targetY} ${sourceX + xDirection * cornerRadius} ${targetY}
      H ${targetX}
    `;
  }

  return (
    <path
      id={id}
      d={path}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className="transition-all duration-300 ease-in-out"
    />
  );
};

export const CustomStepEdge: React.FC<
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

export const CustomSineEdge: React.FC<
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
};

interface ArcEdgeProps extends EdgeProps {
  data?: {
    strokeColor?: string;
    strokeWidth?: number;
    radius?: number; // Added radius prop
  };
}

export const ArcEdge: React.FC<ArcEdgeProps> = ({
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
