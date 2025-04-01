import { IconTypes } from "./types";

const UsersIcon: React.FC<IconTypes> = ({ color }) => {
  return (
    <svg
      width="31"
      height="24"
      viewBox="0 0 31 24"
      fill={color ?? "#706D8A"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M15.5 0C12.768 0 10.5532 2.44208 10.5532 5.45455C10.5532 8.46701 12.768 10.9091 15.5 10.9091C18.232 10.9091 20.4468 8.46701 20.4468 5.45455C20.4468 2.44208 18.232 0 15.5 0ZM12.5319 5.45455C12.5319 3.64707 13.8608 2.18182 15.5 2.18182C17.1392 2.18182 18.4681 3.64707 18.4681 5.45455C18.4681 7.26202 17.1392 8.72727 15.5 8.72727C13.8608 8.72727 12.5319 7.26202 12.5319 5.45455Z"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.5426 13.0909C8.81051 13.0909 6.59574 15.533 6.59574 18.5455C6.59574 21.5579 8.81051 24 11.5426 24H19.4574C22.1895 24 24.4043 21.5579 24.4043 18.5455C24.4043 15.533 22.1895 13.0909 19.4574 13.0909H11.5426ZM8.57447 18.5455C8.57447 16.738 9.90333 15.2727 11.5426 15.2727H19.4574C21.0967 15.2727 22.4255 16.738 22.4255 18.5455C22.4255 20.3529 21.0967 21.8182 19.4574 21.8182H11.5426C9.90333 21.8182 8.57447 20.3529 8.57447 18.5455Z"
      />
      <path d="M9.89644 9.29259C9.68838 8.92403 9.29797 8.72727 8.90425 8.72727C7.26503 8.72727 5.93617 7.26202 5.93617 5.45455C5.93617 3.64707 7.26503 2.18182 8.90425 2.18182C9.29797 2.18182 9.68838 1.98506 9.89644 1.6165C9.90564 1.6002 9.9149 1.58395 9.92422 1.56773C10.2706 0.964811 10.0951 0.111128 9.4517 0.0330229C9.27194 0.0112014 9.08929 0 8.90425 0C6.17221 0 3.95745 2.44208 3.95745 5.45455C3.95745 8.46701 6.17221 10.9091 8.90425 10.9091C9.08929 10.9091 9.27194 10.8979 9.4517 10.8761C10.0951 10.798 10.2706 9.94428 9.92422 9.34136C9.9149 9.32514 9.90564 9.30889 9.89644 9.29259Z" />
      <path d="M5.88115 20.8245C5.7314 20.5491 5.46707 20.3636 5.1758 20.3636H4.94681C3.30758 20.3636 1.97872 18.8984 1.97872 17.0909C1.97872 15.2834 3.30758 13.8182 4.94681 13.8182H5.1758C5.46707 13.8182 5.7314 13.6328 5.88115 13.3573C6.24668 12.6848 5.85001 11.6364 5.139 11.6364H4.94681C2.21476 11.6364 0 14.0784 0 17.0909C0 20.1034 2.21476 22.5455 4.94681 22.5455H5.139C5.85001 22.5455 6.24668 21.497 5.88115 20.8245Z" />
      <path d="M21.0758 9.34136C20.7294 9.94428 20.9049 10.798 21.5483 10.8761C21.7281 10.8979 21.9107 10.9091 22.0957 10.9091C24.8278 10.9091 27.0426 8.46701 27.0426 5.45455C27.0426 2.44208 24.8278 0 22.0957 0C21.9107 0 21.7281 0.0112015 21.5483 0.0330231C20.9049 0.111128 20.7294 0.96481 21.0758 1.56773C21.0851 1.58394 21.0944 1.6002 21.1036 1.6165C21.3116 1.98505 21.702 2.18182 22.0957 2.18182C23.735 2.18182 25.0638 3.64707 25.0638 5.45455C25.0638 7.26202 23.735 8.72727 22.0957 8.72727C21.702 8.72727 21.3116 8.92403 21.1036 9.29259C21.0944 9.30889 21.0851 9.32514 21.0758 9.34136Z" />
      <path d="M25.1189 20.8245C24.7533 21.497 25.15 22.5455 25.861 22.5455H26.0532C28.7852 22.5455 31 20.1034 31 17.0909C31 14.0784 28.7852 11.6364 26.0532 11.6364H25.861C25.15 11.6364 24.7533 12.6848 25.1189 13.3573C25.2686 13.6328 25.5329 13.8182 25.8242 13.8182H26.0532C27.6924 13.8182 29.0213 15.2834 29.0213 17.0909C29.0213 18.8984 27.6924 20.3636 26.0532 20.3636H25.8242C25.5329 20.3636 25.2686 20.5491 25.1189 20.8245Z" />
    </svg>
  );
};

export default UsersIcon;
