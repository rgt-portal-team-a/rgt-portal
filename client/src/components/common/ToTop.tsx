import ArrowIcon from "@/assets/icons/ArrowIcon";

const ToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className="absolute bottom-6 bg-white text-white p-3 rounded-full shadow-lg hover:bg-slate-100 transition-all duration-300 ease-in-out cursor-pointer border z-50"
    >
      <ArrowIcon className="rotate-180" />
    </button>
  );
};

export default ToTop;
