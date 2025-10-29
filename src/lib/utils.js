import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and merges Tailwind classes with tailwind-merge
 * This prevents class conflicts and allows for conditional class application
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
