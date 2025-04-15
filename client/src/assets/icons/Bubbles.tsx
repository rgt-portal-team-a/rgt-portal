import { IconTypes } from "./types";

const Bubbles:React.FC<IconTypes> = ({color, size }) => {
  return (
    <svg
      width="93"
      height="87"
      viewBox="0 0 93 87"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="33.9425" cy="36.8292" r="6.82918" fill={color} />
      <circle cx="79" cy="27" r="13" fill={color} />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M32.5511 49.4385C32.4191 48.7777 31.9357 48.2423 31.2918 48.0437C30.5686 47.8207 29.7827 48.0642 29.3124 48.6571L26.6097 52.0643C24.7585 54.3979 21.7904 55.5013 18.8235 55.2367C11.5519 54.5883 4.04597 55.1696 -3.42021 57.1402C-37.9518 66.2545 -58.5567 101.636 -49.4425 136.168C-40.3282 170.7 -4.9463 191.305 29.5853 182.19C64.1169 173.076 84.7218 137.694 75.6076 103.163C70.3813 83.3612 56.5177 68.1392 39.13 60.4743C36.2342 59.1978 34.0008 56.6963 33.3809 53.593L32.5511 49.4385Z"
        fill={color}
      />
      <circle
        cx="21.5475"
        cy="4.54785"
        r="3.49096"
        transform="rotate(-22.0902 21.5475 4.54785)"
        fill={color}
      />
    </svg>
  );
}

export default Bubbles