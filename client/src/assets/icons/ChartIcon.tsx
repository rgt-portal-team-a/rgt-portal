import { IconTypes } from "./types";

const ChartIcon: React.FC<IconTypes> = ({ color, size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 31 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M31.5 31.5H15C10.0503 31.5 7.57538 31.5 6.03769 29.9623C4.5 28.4246 4.5 25.9497 4.5 21V4.5"
        stroke={color ?? "#706D8A"}
        stroke-linecap="round"
      />
      <path
        d="M26.5572 14L22.2466 20.9768C21.6185 21.9934 20.9053 23.529 19.6123 23.3015C18.0917 23.034 17.3613 20.7673 16.0539 20.0168C14.9893 19.4056 14.2196 20.1422 13.5971 21M31.5 6L28.7197 10.5M7.5 30L11.2895 24.4"
        stroke="#706D8A"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default ChartIcon;
