import { PtoStatusType } from "@/components/Hr/Employees/EmployeeTimeOffManagementTable";
import { PtoLeave } from "@/types/PTOS";
import axios from "axios";

const API_URL = `${
  import.meta.env.VITE_NODE_ENV === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL
}/leave`;

export class PtoRequestService {
  static async createPtoRequest(
    ptoData: PtoLeave
  ): Promise<PtoLeave | undefined> {
    try {
      const response = await axios.post(`${API_URL}/`, {
        ...ptoData,
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "PTO data post not successful"
        );
      }
      return response.data;
    } catch (error) {
      console.error("Error posting pto data", error);
      throw error;
    }
  }

  static async updatePtoRequest(
    ptoUpdate: {
      status: PtoStatusType;
      statusReason?: string;
      departmentId: number;
    },
    ptoId: number
  ): Promise<PtoLeave | undefined> {
    try {
      const response = await axios.put(`${API_URL}/${ptoId}`, ptoUpdate);

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update PTO request"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Error updating PTO request", error);
      throw error;
    }
  }

  static async deletePtoRequest(id: number) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);

      console.log("success Response:", response.data);
      if (!response.data.success) {
        console.log("fail Response:", response.data);
        throw new Error(
          response.data.message || "PTO data post not successful"
        );
      }
      return response.data;
    } catch (error) {
      console.error("Error deleting pto data", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data?.message || "Failed to delete PTO request"
        );
      } else {
        throw new Error("Failed to delete PTO request");
      }
    }
  }

  static async fetchUserPtoRequest(): Promise<PtoLeave[] | undefined> {
    try {
      const response = await axios.get(`${API_URL}/my-requests`);
      console.log("response PtoData:", response.data);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "PTO data fetching unsuccessful."
        );
      }
      return response.data.data.reverse();
    } catch (error) {
      console.error("Error fetching pto data:", error);
      throw error;
    }
  }

  static async fetchAllPtoRequests(): Promise<PtoLeave[] | undefined> {
    try {
      const response = await axios.get(`${API_URL}/all`);
      console.log("response AllPto:", response.data);
      if (!response.data.success) {
        throw new Error(response.data.message || "All PTO fetch unsuccessful");
      }
      return response.data.data.reverse();
    } catch (error) {
      console.log("Error fetching all ptos:", error);
      throw error;
    }
  }

  static async fetchDepartmentPtos(
    departmentId: string
  ): Promise<PtoLeave[] | undefined> {
    try {
      const response = await axios.get(
        `${API_URL}/department/${departmentId}`,
        {
          params: {
            departmentId,
          },
        }
      );
      console.log("response departement:", response.data);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Department Pto failed to fetch"
        );
      }
      return response.data.data.reverse();
    } catch (error) {
      console.log("Error fetching department ptos:", error);
      throw error;
    }
  }

  static async fetchManagerDepartmentPtos(managerId:number):Promise<PtoLeave[] | undefined> {
     try {
       const response = await axios.get(`${API_URL}/manager/${managerId}`);
       console.log("response ManagerIdPtos:", response.data);
       if (!response.data.success) {
         throw new Error(response.data.message || "manager ptos fetch unsuccessful");
       }
       return response.data.data.reverse();
     } catch (error) {
       console.log("Error fetching manager ptos:", error);
       throw error;
     }
  }
}
