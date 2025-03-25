import ArrowIcon from "@/assets/icons/ArrowIcon";

const ToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll to the top
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-5 left-5 bg-white text-white p-3 rounded-full shadow-lg hover:bg-slate-100 transition-all duration-300 ease-in-out cursor-pointer"
    >
      <ArrowIcon className="rotate-180" /> {/* Use an arrow-up icon */}
    </button>
  );
};

export default ToTop;
