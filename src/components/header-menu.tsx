"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

import { signIn, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { UserStatus } from "@/lib/const";
import NavLink from "./ui/nav-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import CreateAccountAlert from "./create-account-alert";
import { useState } from "react";

const HeaderMenu = () => {
  const { data: session, status } = useSession();
  return (
    <NavigationMenu className="relative flex justify-center z-1 text-xs">
      <NavigationMenuList className="flex justify-center bg-white p-1 rounded-md list-none m-0">
        <NavigationMenuItem>
          <NavLink
            href="/workspace"
            className={cn(
              "px-2 py-3 outline-none font-sm rounded text-sky-600 hover:text-sky-800",
              status === UserStatus.AUTHENTICATED &&
                "text-emerald-600 hover:text-emerald-800"
            )}
          >
            Workspace
          </NavLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Avatar className="w-8 h-8 cursor-pointer">
            {status === UserStatus.AUTHENTICATED ? (
              session?.user?.image ? (
                <AvatarImage
                  src={session.user.image}
                  onClick={() => {
                    signOut();
                  }}
                />
              ) : (
                <AvatarFallback
                  onClick={() => {
                    signOut();
                  }}
                >
                  tmp
                </AvatarFallback>
              )
            ) : (
              <AvatarFallback
                onClick={() => {
                  signIn();
                }}
              >
                tmp
              </AvatarFallback>
            )}
          </Avatar>
        </NavigationMenuItem>
      </NavigationMenuList>

      <div className="absolute flex justify-center w-full top-full left-0">
        <NavigationMenuViewport className="relative origin-top-right mt-2.5 w-full bg-white rounded overflow-hidden" />
      </div>
    </NavigationMenu>
  );
};

export default HeaderMenu;
