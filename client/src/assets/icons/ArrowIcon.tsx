import { ClassNameValue } from "tailwind-merge";

const ArrowIcon = ({
  className,
  stroke,
}: {
  className?: ClassNameValue;
  stroke?: string;
}) => {
  return (
    <svg
      width="24"
      height="24"
      // viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300 ease-in`}
    >
      <path
        d="M17 10L15.2527 11.763C13.8592 13.1689 13.1625 13.8719 12.3133 13.9801C12.1053 14.0066 11.8947 14.0066 11.6867 13.9801C10.8375 13.8719 10.1408 13.1689 8.74731 11.763L7 10"
        stroke={stroke ?? "#706D8A"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ArrowIcon;
