import { Avatar, AvatarImage } from "./ui/avatar";

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
