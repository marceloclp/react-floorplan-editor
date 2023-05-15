import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ClassValue } from 'clsx';

const cx = (...inputs: ClassValue[]) => {
  return twMerge(clsx(...inputs));
};

export default cx;
