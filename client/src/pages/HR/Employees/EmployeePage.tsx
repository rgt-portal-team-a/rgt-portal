import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  EmployeeData,
} from "@/components/Hr/EmployeePage/types";
import {
  initialNodes,
  initialEdges,
  customEdgeStyle,
} from "@/components/Hr/EmployeePage/constants";
import ProfileHeader from "@/components/Hr/EmployeePage/ProfileHeader";
import ProfileTabs from "@/components/Hr/EmployeePage/ProfileTabs";
import DetailsView from "@/components/Hr/EmployeePage/DetailsView";
import ActivityView from "@/components/Hr/EmployeePage/ActivityView";

const EmployeePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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

  const onNodeDragStop = (_event: React.MouseEvent, node: Node) => {
    // Only allow specific nodes to be moved
    if (node.id === "personal-details" || node.id === "work-details") {
      return;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen w-full p-4">
      <ProfileHeader />

      <Card className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        <ProfileTabs
          employee={employee}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="bg-white p-6">
          {activeTab === "details" ? (
            <DetailsView
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStop={onNodeDragStop}
            />
          ) : (
            <ActivityView />
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmployeePage;
