import * as Data from "./data";

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const diff_hours = (dt2: number, dt1: number) => {
  var diff = (dt2 - dt1) / 1000;
  diff /= 60 * 60;
  return Math.abs(Math.round(diff));
};

/**
 * make UTF8 safe
 * taken from https://stackoverflow.com/questions/2670037/how-to-remove-invalid-utf-8-characters-from-a-javascript-string
 * @param input
 * @returns string
 */
export const cleanString = (input: string) => {
  var output = "";
  for (var i = 0; i < input.length; i++) {
    if (
      input.charCodeAt(i) <= 127 ||
      (input.charCodeAt(i) >= 160 && input.charCodeAt(i) <= 255)
    ) {
      output += input.charAt(i);
    }
  }
  return output;
};
