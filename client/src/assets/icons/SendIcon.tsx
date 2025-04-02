import { ClassNameValue } from "tailwind-merge";

const SendIcon: React.FC<{ className?: ClassNameValue }> = ({ className }) => {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
      fill="blue"
      // className="hover:fill-rgtpink transition-all duration-300 ease-in fill-[#2D264B] bg-green-500 w-full"
      className={`${className}`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.5278 7.77593C22.139 4.58933 19.3413 1.79171 16.1547 2.40285L7.00569 4.1575C5.01685 4.53892 3.4263 6.04437 2.92098 8.00054C1.91207 11.9061 5.53411 15.4756 9.4232 14.3319C9.5306 14.3003 9.63038 14.4001 9.5988 14.5075C8.45512 18.3966 12.0245 22.0186 15.9302 21.0097C17.8863 20.5044 19.3918 18.9138 19.7732 16.925L21.5278 7.77593ZM16.4373 3.876C18.5826 3.46456 20.4661 5.34804 20.0547 7.4934L18.3001 16.6425C18.0287 18.0574 16.9544 19.1959 15.555 19.5574C12.7579 20.28 10.2285 17.6831 11.0379 14.9307C11.4044 13.6843 10.2464 12.5263 9 12.8928C6.2476 13.7022 3.65074 11.1728 4.3733 8.37571C4.73481 6.97628 5.87333 5.902 7.28822 5.63065L16.4373 3.876Z"
        // fill="pink"
      />
    </svg>
  );
};

export default SendIcon;


