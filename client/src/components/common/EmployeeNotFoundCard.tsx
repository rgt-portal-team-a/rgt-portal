import React from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmployeeNotFoundCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <Card className="w-full max-w-md p-6 text-center shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle
            className="text-red-500 w-16 h-16 mb-4"
            strokeWidth={1.5}
          />

          <h2 className="text-2xl font-bold text-gray-800">
            Employee Not Found
          </h2>

          <p className="text-gray-600 mb-6 text-center">
            The employee ID you're looking for is invalid or does not exist.
            Please check the URL or return to the employee directory.
          </p>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry
            </Button>

            <Button onClick={() => navigate("/employees")} className="w-full">
              Employee Directory
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeNotFoundCard;
