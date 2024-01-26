import Link from "next/link";

const AppLogo = () => {
  return (
    <div className="h-full absolute flex flex-col justify-center pl-4">
      <Link className="text-inherit no-underline" href="/">
        <div className="hidden md:block text-xl text-cyan-800">Src Sift</div>

        <div className="md:hidden">
          <div className="text-base uppercase font-bold text-cyan-800">
            Src Sift
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AppLogo;
