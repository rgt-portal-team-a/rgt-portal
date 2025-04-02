import { IconTypes } from "./types";

const LinearRightArrow: React.FC<IconTypes> = ({ color }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={color ?? "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 7L11.763 8.74731C13.1689 10.1408 13.8719 10.8375 13.9801 11.6867C14.0066 11.8947 14.0066 12.1053 13.9801 12.3133C13.8719 13.1625 13.1689 13.8592 11.763 15.2527L10 17"
        stroke="#2D264B"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default LinearRightArrow;
