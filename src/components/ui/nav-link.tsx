import { NavigationMenuLink } from "@radix-ui/react-navigation-menu";
import Link from "next/link";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

const NavLink = ({ href, className, ...props }: NavLinkProps) => {
  // const isActive = router.asPath === href;

  return (
    <Link href={href} className={className}>
      <NavigationMenuLink
        // className="NavigationMenuLink"
        // active={isActive}
        {...props}
      />
    </Link>
  );
};

export default NavLink;
