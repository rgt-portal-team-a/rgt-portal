import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const CandidateDetailSkeleton: React.FC = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" disabled>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="h-24 w-24 bg-gray-200 rounded-full mb-4 animate-pulse"></div>
              <div className="h-6 w-40 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse mt-2"></div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div className="flex items-start" key={index}>
                  <div className="h-5 w-5 bg-gray-200 rounded-md mr-3 mt-0.5 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-16 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                    <div className="h-5 w-full bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <div className="h-9 w-full bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 md:col-span-2 col-span-1">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="status">Application Status</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Details</CardTitle>
                  <CardDescription>
                    Complete information about the candidate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, sectionIndex) => (
                      <div className="space-y-4" key={sectionIndex}>
                        <div className="flex items-center">
                          <div className="h-4 w-4 bg-gray-200 rounded-md mr-2 animate-pulse"></div>
                          <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                        </div>

                        <div className="ml-6 space-y-3">
                          {[...Array(4)].map((_, itemIndex) => (
                            <div key={itemIndex}>
                              <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                              <div className="h-5 w-full bg-gray-200 rounded-md animate-pulse"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-gray-200 rounded-md mr-2 animate-pulse"></div>
                      <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
                      {[...Array(4)].map((_, index) => (
                        <div key={index}>
                          <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                          <div className="h-5 w-full bg-gray-200 rounded-md animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-gray-200 rounded-md mr-2 animate-pulse"></div>
                      <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6">
                      {[...Array(4)].map((_, index) => (
                        <div key={index}>
                          <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                          {index === 0 ? (
                            <div className="flex items-center mt-1">
                              <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse mr-2"></div>
                              <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                            </div>
                          ) : (
                            <div className="h-5 w-full bg-gray-200 rounded-md animate-pulse"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailSkeleton;
