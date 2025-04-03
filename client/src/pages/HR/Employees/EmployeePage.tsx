import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Employee } from "@/types/employee"; 
import {
  initialEdges,
  customEdgeStyle,
  nodeStyles,
} from "@/components/Hr/EmployeePage/constants";
import { Position } from "@xyflow/react";
import ProfileHeader from "@/components/Hr/EmployeePage/ProfileHeader";
import ProfileTabs from "@/components/Hr/EmployeePage/ProfileTabs";
import DetailsView from "@/components/Hr/EmployeePage/DetailsView";
import ActivityView from "@/components/Hr/EmployeePage/ActivityView";
import EmployeePageSkeleton from "@/components/Hr/EmployeePage/EmployeePageSkeleton";
import { useParams } from "react-router-dom";
import EmployeeNotFoundCard from "@/components/common/EmployeeNotFoundCard";
import { useEmployeeDetails } from "@/api/query-hooks/employee.hooks";
import {calculateSeniority} from "@/utils/employee-helpers"

const EmployeePage: React.FC = () => {
  const { id } = useParams();

  if (!id) {
    return <EmployeeNotFoundCard />;
  }

  const {
    data: employee,
    isLoading: isEmployeeLoading,
    isError: isEmployeeError,
  } = useEmployeeDetails(id);

  useEffect(() => {
    if (employee) {
      setNodes([
        personalDetailsNode,
        workDetailsNode,
        ...generatePersonalDetailNodes(employee),
        ...generateWorkDetailNodes(employee),
      ]);
    }
  }, [employee]); 

  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");

  // Dynamic node generation
  const personalDetailsNode: Node = useMemo(
    () => ({
      id: "personal-details",
      position: { x: 600, y: 30 },
      data: { label: "Personal Details", isHeader: true },
      type: "header",
      draggable: false,
      style: { ...nodeStyles.common, ...nodeStyles.header },
      sourcePosition: Position.Right,
    }),
    []
  );

  const workDetailsNode: Node = useMemo(
    () => ({
      id: "work-details",
      position: { x: 600, y: 370 },
      data: { label: "Work Details", isHeader: true },
      type: "header",
      draggable: false,
      style: { ...nodeStyles.common, ...nodeStyles.header },
      sourcePosition: Position.Right,
    }),
    []
  );

  const generatePersonalDetailNodes = useCallback(
    (employee?: Employee): Node[] => {
      if (!employee) return [];

      const nodes: Node[] = [
        {
          id: "phone",
          position: { x: -500, y: 100 },
          data: {
            label: "Phone",
            value: employee.phone || "Not Available",
          },
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
          data: {
            label: "Personal Email",
            value: employee.contactDetails?.personalEmail || "Not Available",
          },
          type: "custom",
          style: { ...nodeStyles.common, ...nodeStyles.detail },
        },
        {
          id: "work-email",
          position: { x: 920, y: 150 },
          data: { 
            label: "Work Email",
            value: employee.user?.email || "Not Available",
          },
          type: "custom",
          style: { ...nodeStyles.common, ...nodeStyles.detail },
        },
        {
          id: "location",
          position: { x: 1150, y: 130 },
          data: {
            label: "Location",
            value: `${employee.contactDetails?.homeAddress}` || "Not Available",
          },
          type: "custom",
          style: { ...nodeStyles.common, ...nodeStyles.detail },
        },
        {
          id: "skills",
          position: { x: 1150, y: 460 },
          data: {
            label: "Skills",
            value: employee.skills?.join(", ") || "No skills listed",
          },
          type: "custom",
          style: { ...nodeStyles.common, ...nodeStyles.detail },
        },
      ];

      console.log("Personal Details Nodes", nodes)
      return nodes;
    },
    []
  );

  const generateWorkDetailNodes = useCallback((employee?: Employee): Node[] => {
    if (!employee) return [];

    const nodes: Node[] = [
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
        data: {
          label: "Start Date",
          value: employee.hireDate
            ? new Date(employee.hireDate).toLocaleDateString()
            : "Not Available",
        },
        type: "custom",
        style: { ...nodeStyles.common, ...nodeStyles.detail },
        parentId: "work-details",
      },
      {
        id: "department",
        position: { x: 300, y: 500 },
        data: {
          label: "Department",
          value: employee.department?.name || "Not Available",
        },
        type: "custom",
        style: { ...nodeStyles.common, ...nodeStyles.detail },
      },
      {
        id: "seniority",
        position: { x: 920, y: 500 },
        data: {
          label: "Seniority",
          value: calculateSeniority(employee.hireDate) || "Not Available",
        },
        type: "custom",
        style: { ...nodeStyles.common, ...nodeStyles.detail },
      },
    ];

    console.log("Work Details Nodes", nodes)

    return nodes;
  }, []);

  // Generate dynamic nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(
    // employee
    //   ? 
      [
          personalDetailsNode,
          workDetailsNode,
          ...generatePersonalDetailNodes(employee),
          ...generateWorkDetailNodes(employee),
      ]
      // : initialNodes
  );

  console.log("All Nodes", nodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    // employee ? 
    initialEdges 
    // : [] // You might want to generate dynamic edges here too
  );

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
    if (node.id === "personal-details" || node.id === "work-details") {
      return;
    }
  };

  if (isEmployeeLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <EmployeePageSkeleton/>
      </div>
    );
  }

  if (isEmployeeError) {
    return <EmployeeNotFoundCard />;
  }

  if (!employee) {
    return <EmployeeNotFoundCard />;
  }

  return (
    <div className="bg-slate-100 min-h-screen w-full p-4">
      <ProfileHeader  />

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
            <ActivityView  />
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmployeePage;
