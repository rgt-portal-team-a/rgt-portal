const ProfileIcon: React.FC<IconTypes> = ({ color }) => {
  return (
    <svg
      width="31"
      height="32"
      viewBox="0 0 31 32"
      fill={color ?? "#706D8A"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M15.4997 2.11456C12.1112 2.11456 9.36426 4.86148 9.36426 8.24998C9.36426 11.6385 12.1112 14.3854 15.4997 14.3854C18.8882 14.3854 21.6351 11.6385 21.6351 8.24998C21.6351 4.86148 18.8882 2.11456 15.4997 2.11456ZM11.3018 8.24998C11.3018 5.93153 13.1812 4.05206 15.4997 4.05206C17.8181 4.05206 19.6976 5.93153 19.6976 8.24998C19.6976 10.5684 17.8181 12.4479 15.4997 12.4479C13.1812 12.4479 11.3018 10.5684 11.3018 8.24998Z"
        // fill="#706D8A"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11.6247 16.3229C8.23618 16.3229 5.48926 19.0698 5.48926 22.4583C5.48926 25.8468 8.23618 28.5937 11.6247 28.5937H19.3747C22.7632 28.5937 25.5101 25.8468 25.5101 22.4583C25.5101 19.0698 22.7632 16.3229 19.3747 16.3229H11.6247ZM7.42676 22.4583C7.42676 20.1399 9.30623 18.2604 11.6247 18.2604H19.3747C21.6931 18.2604 23.5726 20.1399 23.5726 22.4583C23.5726 24.7768 21.6931 26.6562 19.3747 26.6562H11.6247C9.30623 26.6562 7.42676 24.7768 7.42676 22.4583Z"
        // fill="#706D8A"
      />
    </svg>
  );
};

export default ProfileIcon;


