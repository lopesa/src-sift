import AppLogo from "./app-logo";
import HeaderMenu from "./header-menu";

const Nav = () => {
  return (
    <header className="sticky inline-block w-full h-14 shadow-xl top-0 z-10 bg-white text-zinc-500">
      <AppLogo />
      <h2 className="hidden md:block absolute leading-[3.4rem] text-sm m-0 ml-[50%] translate-x-[-50%]">
        A central place to explore different sources of Public Data
      </h2>
      <div className="absolute flex items-center justify-center right-2.5 h-full">
        <HeaderMenu />
      </div>
    </header>
  );
};

export default Nav;