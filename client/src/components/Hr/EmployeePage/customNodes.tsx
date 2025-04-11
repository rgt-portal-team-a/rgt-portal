import { NodeData } from "./types";
import React from "react";
import {
  Position,
  Node,
  NodeProps,
  Handle,
} from "@xyflow/react";
import CalendarIcon from "@/assets/icons/CalendarIcon"


const handleStyle = {
  width: 8,
  height: 8,
  backgroundColor: "#FFC233",
  // border: "2px solid #DCC6FF",
  transform: "translateY(-50%)",
  // zIndex: 2,
};




export const CustomNode: React.FC<NodeProps<Node<NodeData, string>>> = ({
  data,
  isConnectable,
}) => {
  const isHeader = data.isHeader || false;
  const Icon = data.icon;
  const iconProps = data.iconProps || {};

  return (
    <div className="">
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
        type="target"
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

      <div className="flex items-center space-x-2 ">
        {/* Text Content */}
        {Icon && (
          <div className={`${iconProps.containerClassName}`}>
            <div className={`${iconProps.className}`}>
              {React.isValidElement(Icon)
                ? Icon
                : React.createElement(Icon as React.FC)}
            </div>
          </div>
        )}
        <div>
          <div className="font-medium">{data.label}</div>
          {data.value && !isHeader && (
            <div className="text-sm opacity-80">{data.value}</div>
          )}
        </div>
      </div>
    </div>
  );
};


export const HeaderNode: React.FC<NodeProps<Node<NodeData, string>>> = ({
  data,
  isConnectable,
}) => {
  const isHeader = data.isHeader || false;


  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60px",
        width: "180px",
      }}
    >
      {/* Custom ticket stub shape with CSS */}
      <div
        className="ticket-stub"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "#D7BEFF",
          borderRadius: "16px",
          zIndex: 1,
          // overflow: "visible",
        }}
      />

      {/* Left circular notch */}
      <div
        style={{
          position: "absolute",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          // border: "3px solid #D7BEFF",
          // backgroundColor: "transparent",
          backgroundColor: "white",
          left: "-8px",
          top: "50%",
          transform: "translateY(-50%)",
          // boxShadow: "0 0 0 2px #D7BEFF",
          zIndex: 2,
        }}
      />

      {/* Right circular notch */}
      <div
        style={{
          position: "absolute",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: "white",
          // backgroundColor: "transparent",
          // border: "3px solid #D7BEFF",
          right: "-8px",
          top: "50%",
          transform: "translateY(-50%)",
          // boxShadow: "0 0 0 2px #D7BEFF",
          zIndex: 2,
        }}
      />

      {/* Yellow connections/handles */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{
          ...handleStyle,
          left: 6,
        }}
        isConnectable={isConnectable}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          ...handleStyle,
          right: 6,
        }}
        isConnectable={isConnectable}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          color: "#4A2B8C", // Dark purple text
          fontWeight: 500,
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <div className="font-medium">{data.label}</div>
        {data.value && !isHeader && (
          <div className="text-sm opacity-80">{data.value}</div>
        )}
      </div>
    </div>
  );
};

export const JunctionNodeRight = () => (
  <div
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "#FFA500",
    }}
  >
    <Handle
      type="target"
      style={{ backgroundColor: "transparent", border: "none" }}
      position={Position.Left}
      id="left"
    />
    <Handle
      type="source"
      style={{ backgroundColor: "transparent", border: "none" }}
      position={Position.Bottom}
      id="bottom"
    />
    <Handle
      style={{ backgroundColor: "transparent", border: "none" }}
      type="source"
      position={Position.Right}
      id="right"
    />
  </div>
);
export const JunctionNodeLeft = () => (
  <div
    style={{
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "#FFA500",
    }}
  >
    <Handle
      style={{ backgroundColor: "transparent", border: "none" }}
      type="source"
      position={Position.Left}
      id="left"
    />
    <Handle
      style={{ backgroundColor: "transparent", border: "none" }}
      type="source"
      position={Position.Bottom}
      id="bottom"
    />
    <Handle
      style={{ backgroundColor: "transparent", border: "none" }}
      type="target"
      position={Position.Right}
      id="right"
    />
  </div>
);