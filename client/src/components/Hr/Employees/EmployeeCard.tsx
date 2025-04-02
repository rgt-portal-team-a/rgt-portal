import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/types/employee';
import { Phone, Mail } from 'lucide-react';

const EmployeeCard = ({ employee }: { employee: Employee}) => {
  return (
    <Card className="overflow-hidden w-[280px] h-[210px]  rounded-[12px] ">
      <CardContent className="p-6 flex flex-col gap-2">
        <div className="flex mb-4">
          <div className="w-[73px] h-[72px] rounded-xl overflow-hidden mr-4">
            <img 
              src={employee.photoUrl ?? "https://randomuser.me/api/portraits/med/women/75.jpg"}
              alt={employee.firstName ?? "Employee"} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className='flex flex-col h-full'>
            <h3 className="font-semibold text-base h-1/2">{employee.firstName} {employee.lastName}</h3>
            <p className="text-gray-400 text-sm">{employee.position ?? "No Position"}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col text-left gap-2">
            <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-2">
                <Phone className="h-4 w-4 text-yellow-500" />
                </div>
              <p className="text-gray-400 text-xs font-semibold">Phone</p>
            </div>
            <div>
              <p className="text-xs font-semibold">{employee.phone?? "None"}</p>
            </div>
          </div>
          
          <div className="flex flex-col text-left gap-2">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-2">
                <Mail className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-gray-400 text-xs font-semibold">Email</p>
            </div>
            <div className="w-full">
              <p className="text-xs font-semibold truncate whitespace-normal">
                {employee.user?.email ?? "None"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;