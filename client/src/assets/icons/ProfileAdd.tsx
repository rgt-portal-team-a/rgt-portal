import { IconTypes } from "./types";

const ProfileAdd: React.FC<IconTypes> = ({ color }) => {
  return (
    <svg
      width="19"
      height="21"
      viewBox="0 0 19 21"
      fill={color ?? "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0.25C5.37665 0.25 3.25 2.37665 3.25 5C3.25 7.62335 5.37665 9.75 8 9.75C10.6234 9.75 12.75 7.62335 12.75 5C12.75 2.37665 10.6234 0.25 8 0.25ZM4.75 5C4.75 3.20507 6.20507 1.75 8 1.75C9.79493 1.75 11.25 3.20507 11.25 5C11.25 6.79493 9.79493 8.25 8 8.25C6.20507 8.25 4.75 6.79493 4.75 5Z"
        fill={color ?? "#FAFAFA"}
      />
      <path
        d="M5 11.25C2.37665 11.25 0.25 13.3766 0.25 16C0.25 18.6234 2.37665 20.75 5 20.75H11C11.4142 20.75 11.75 20.4142 11.75 20C11.75 19.5858 11.4142 19.25 11 19.25H5C3.20507 19.25 1.75 17.7949 1.75 16C1.75 14.2051 3.20507 12.75 5 12.75H11C11.4142 12.75 11.75 12.4142 11.75 12C11.75 11.5858 11.4142 11.25 11 11.25H5Z"
        fill={color ?? "#FAFAFA"}
      />
      <path
        d="M15.75 13C15.75 12.5858 15.4142 12.25 15 12.25C14.5858 12.25 14.25 12.5858 14.25 13V15.25H12C11.5858 15.25 11.25 15.5858 11.25 16C11.25 16.4142 11.5858 16.75 12 16.75H14.25V19C14.25 19.4142 14.5858 19.75 15 19.75C15.4142 19.75 15.75 19.4142 15.75 19V16.75H18C18.4142 16.75 18.75 16.4142 18.75 16C18.75 15.5858 18.4142 15.25 18 15.25H15.75V13Z"
        fill={color ?? "#FAFAFA"}
      />
    </svg>
  );
};

export default ProfileAdd;
