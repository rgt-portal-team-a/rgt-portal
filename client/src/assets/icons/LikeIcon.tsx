import { IconTypes } from "./types";

const LikeIcon: React.FC<IconTypes> = ({
  color,
  size = 31,
  fill,
  className,
  stroke,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 19"
      fill={fill ?? color ?? "transparent"}
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
    >
      <path
        d="M1 7.06787C1 5.68716 2.11929 4.56787 3.5 4.56787C4.88071 4.56787 6 5.68716 6 7.06787V15.0679C6 16.4486 4.88071 17.5679 3.5 17.5679C2.11929 17.5679 1 16.4486 1 15.0679V7.06787Z"
        stroke={stroke ?? "#94A3B8"}
        strokeWidth="1.5"
      />
      <path
        d="M9.57541 1.75782L7.34488 5.38244C6.74601 6.35561 6.44657 6.84219 6.26551 7.37542C6.21028 7.53807 6.16347 7.70346 6.12526 7.87092C6 8.41995 6 8.99129 6 10.134V13.5679C6 15.777 7.79086 17.5679 10 17.5679H12.9098C14.8037 17.5679 16.535 16.4979 17.382 14.8039L18.5305 12.5069C19.6651 10.2377 18.015 7.56787 15.478 7.56787H14.7882C13.0593 7.56787 11.7371 6.02674 12 4.31787L12.243 2.73809C12.3782 1.85988 11.6987 1.06787 10.8101 1.06787C10.3067 1.06787 9.83927 1.32905 9.57541 1.75782Z"
        stroke={stroke ?? "#94A3B8"}
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default LikeIcon;
