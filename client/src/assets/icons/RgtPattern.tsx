import { IconTypes } from "./types";

const RgtPattern: React.FC<IconTypes> = ({ color }) => {
  return (
    <svg
      width="123"
      height="142"
      viewBox="0 0 123 142"
      fill={color ?? "none"}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect
        x="42"
        y="68"
        width="81"
        height="74"
        rx="8"
        fill={color ?? "#452667"}
        fill-opacity="0.65"
      />
      <rect width="123" height="128" fill="url(#pattern0_1425_61812)" />
      <defs>
        <pattern
          id="pattern0_1425_61812"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_1425_61812"
            transform="matrix(0.00076418 0 0 0.000734329 -0.97561 -0.890625)"
          />
        </pattern>
      </defs>
    </svg>
  );
};

export default RgtPattern;
