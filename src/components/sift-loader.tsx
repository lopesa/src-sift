type SiftLoaderProps = {
  className?: string;
};

const SiftLoader = ({ className }: SiftLoaderProps) => {
  return (
    <div className={`w-10 h-10 ${className}`}>
      <div className="animate-wiggleLeft h-0.5 w-5/6 bg-zinc-400 rounded-full mx-auto"></div>
      <div className="animate-wiggleRight h-0.5 w-5/6 bg-zinc-400 rounded-full mx-auto"></div>
      <div className="w-full h-full flex justify-evenly items-start pt-1.5">
        <div className="animate-wiggleUp w-0.5 h-1/6 bg-amber-300 rounded-full"></div>
        <div className="animate-wiggleDown w-0.5 h-1/6 bg-amber-300 rounded-full"></div>
        <div className="animate-wiggleUp w-0.5 h-1/6 bg-amber-300 rounded-full"></div>
        <div className="animate-wiggleDown w-0.5 h-1/6 bg-amber-300 rounded-full"></div>
      </div>
    </div>
  );
};

export default SiftLoader;
