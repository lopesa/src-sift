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

interface ControlledAlertDialogProps {
  title: string;
  description?: string;
  open: boolean;
  confirmText?: string;
  cancelText?: string;
  controller: Dispatch<SetStateAction<boolean>>;
  action: () => void;
}

const ControlledAlertDialog: React.FC<ControlledAlertDialogProps> = ({
  title,
  description,
  open,
  controller,
  action,
  confirmText = "Go",
  cancelText = "Not right now",
}) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogAction
            className="w-1/2 bg-emerald-500"
            onClick={() => {
              controller(false);
              action();
            }}
          >
            {confirmText}
          </AlertDialogAction>
          <AlertDialogCancel
            className="w-1/2"
            onClick={() => {
              controller(false);
            }}
          >
            {cancelText}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ControlledAlertDialog;
