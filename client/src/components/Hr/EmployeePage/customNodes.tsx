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
  border: "2px solid #DCC6FF",
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

export const JunctionNodeRight = () => (
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
export const JunctionNodeLeft = () => (
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