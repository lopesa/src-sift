import Link from "next/link";

const AppLogo = () => {
  return (
    <div className="h-full absolute flex flex-col justify-center ml-2.5">
      <Link className="text-inherit no-underline" href="/">
        <div className="hidden md:block text-lg uppercase font-bold">
          Resource Explorer
        </div>

        <div className="md:hidden">
          <div className="text-base uppercase font-bold">Resource Explorer</div>
        </div>
      </Link>
    </div>
  );
};

export default AppLogo;