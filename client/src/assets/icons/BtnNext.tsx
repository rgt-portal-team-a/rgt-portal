const BtnNext: React.FC<IconTypes> = ({ color }) => {
  return (
    <svg
      width="7"
      height="14"
      viewBox="0 0 7 14"
      fill={color ?? "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.710938 13.1174L6.70536 7.01965L0.710938 0.921875"
        fill={color ?? "#C2C2C2"}
      />
    </svg>
  );
};

export default BtnNext;
