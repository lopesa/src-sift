"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const HeaderMenu = () => {
  const { data: session, status } = useSession();
  return (
    <NavigationMenu className="relative flex justify-center z-1 text-xs">
      <NavigationMenuList className="flex justify-center bg-white p-1 rounded-md list-none m-0">
        <NavigationMenuItem>
          <Link href="/about" legacyBehavior passHref>
            <NavigationMenuLink className="px-2 py-3 outline-none font-medium rounded text-sky-600 hover:text-sky-800">
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/bookmarks" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                "px-2 py-3 outline-none font-medium rounded text-sky-600 hover:text-sky-800",
                status === "authenticated" && "bg-red-700 text-white"
              )}
            >
              Bookmarks
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/api/auth/signin" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                "px-2 py-3 outline-none font-medium rounded text-sky-600 hover:text-sky-800"
              )}
            >
              Sign In
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>

      <div className="absolute flex justify-center w-full top-full left-0">
        <NavigationMenuViewport className="relative origin-top-right mt-2.5 w-full bg-white rounded overflow-hidden" />
      </div>
    </NavigationMenu>
  );
};

export default HeaderMenu;
