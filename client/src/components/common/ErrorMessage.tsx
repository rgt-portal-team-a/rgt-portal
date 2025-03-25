import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {  AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";


interface IErrorMessageType{
    title: string, 
    error: Error| null | unknown, 
    refetchFn: () => void
}

const ErrorMessage = ({title ="Error loading data", error, refetchFn}: IErrorMessageType) => {


    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load data. Please try again."}
          </AlertDescription>
        </Alert>
        <Button onClick={refetchFn} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
}


export default ErrorMessage;