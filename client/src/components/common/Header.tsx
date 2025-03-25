interface IHeader {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const Header: React.FC<IHeader> = ({ title, description, children }) => {
  return (
    <section className="flex justify-between items-center">
      <header className="space-y-1">
        <p className="text-[#706D8A] font-semibold text-3xl">{title}</p>
        <p className="text-xs font-medium">{description}</p>
      </header>
      <div>{children}</div>
    </section>
  );
};

export default Header;
