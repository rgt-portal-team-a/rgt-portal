import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you are looking for does not exist.
      </p>
      <Button
        onClick={() => navigate("/")}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        Go to Login Page
      </Button>
    </div>
  );
};

export default NotFoundPage;
