import { AvatarFallback } from "@radix-ui/react-avatar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { getAvatarFallback } from "@/lib/helpers";

const AvtrBlock: React.FC<{
  profileImage?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}> = ({ profileImage, firstName, lastName, role }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avatar>
        <AvatarImage src={profileImage} alt={firstName || "AvtrImg"} />
        <AvatarFallback className="flex items-center justify-center h-full w-full text-white font-semibold text-xs bg-rgtpurple">
          {getAvatarFallback(firstName as string)}
        </AvatarFallback>
      </Avatar>
      <div className="">
        <p className="font-bold">
          {firstName || "No"} {lastName || "Name"}
        </p>
        <p className="text-rgtgray text-xs">{role?.toUpperCase()}</p>
      </div>
    </div>
  );
};

export default AvtrBlock;
