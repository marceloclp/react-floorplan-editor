import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const cx = (...inputs: ClassValue[]) => {
  return twMerge(clsx(...inputs));
};

export default cx;
