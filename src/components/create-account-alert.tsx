"use client";

import React, { Dispatch, SetStateAction, use, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signIn, useSession } from "next-auth/react";

interface CreateAccountAlertProps {
  open: boolean;
  controller: Dispatch<SetStateAction<boolean>>;
}

const CreateAccountAlert: React.FC<CreateAccountAlertProps> = ({
  open,
  controller,
}) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Create a Free Account to Save Your Siftings!
          </AlertDialogTitle>
          <AlertDialogDescription>
            New users can immediately save their findings based on a temporary
            account. It&rsquo;s tied to your localstorage, and that makes them
            easy to lose and anyway, all temp users will be deleted after one
            week. If you want to save your findings, please create an account.
            It&rsquo;s free! Your temporary account&rsquo;s findings will be
            automatically transferred to your new account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogAction
            className="w-1/2 bg-emerald-500"
            onClick={() => {
              controller(false);
              signIn();
            }}
          >
            Go
          </AlertDialogAction>
          <AlertDialogCancel
            className="w-1/2"
            onClick={() => {
              controller(false);
            }}
          >
            Not right now
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateAccountAlert;
