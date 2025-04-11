import { IconTypes } from "./types";

const HamburgerMenu: React.FC<IconTypes> = ({ color, size }) => {
  return (
    <svg
      width={size || "24"}
      height={size || "25"}
      viewBox="0 0 24 25"
      fill={color || "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 18.5H19M5 6.5H19M5 12.5H19"
        stroke="#452667"
        strokeWidth="1.5"
        stroke-linecap="round"
      />
      <path
        d="M5 18.5H19M5 6.5H19M5 12.5H19"
        stroke="#452667"
        strokeWidth="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
};

export default HamburgerMenu;
