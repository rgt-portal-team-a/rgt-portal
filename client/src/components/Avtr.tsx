import { ClassNameValue } from "tailwind-merge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getAvatarFallback } from "@/lib/helpers";

interface IAvtr {
  className?: ClassNameValue;
  index?: number;
  url: string;
  name: string;
  avtBg?: string;
}

const Avtr: React.FC<IAvtr> = ({ className, index = 0, url, name, avtBg }) => {
  return (
    <Avatar
      className={`border-2 border-white ${className}`}
      style={{
        transform: `translateX(${index * 24}px)`, // Adjust overlap spacing
        zIndex: `${100 - index}`, // Higher z-index for first items
      }}
    >
      <AvatarImage src={url} alt={name} className="h-full w-full" />
      <AvatarFallback className={`h-full w-full ${avtBg}`}>
        {getAvatarFallback(name)}
      </AvatarFallback>
    </Avatar>
  );
};

export default Avtr;
