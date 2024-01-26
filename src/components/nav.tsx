import AppLogo from "./app-logo";
import HeaderMenu from "./header-menu";

const Nav = () => {
  return (
    <header className="fixed top-0 inline-block w-full h-14 shadow-xl bg-white text-zinc-500">
      <AppLogo />
      <div className="absolute flex items-center justify-center right-4 h-full">
        <HeaderMenu />
      </div>
    </header>
  );
};

export default Nav;
