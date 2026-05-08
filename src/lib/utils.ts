import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}.${Math.round((m/60) * 10)} h`;
}

export function calculateDuration(bed: string, wake: string): number {
  const [bH, bM] = bed.split(':').map(Number);
  const [wH, wM] = wake.split(':').map(Number);
  
  let bDate = new Date(2000, 0, 1, bH, bM);
  let wDate = new Date(2000, 0, 1, wH, wM);
  
  if (wDate <= bDate) {
    wDate.setDate(wDate.getDate() + 1);
  }
  
  return (wDate.getTime() - bDate.getTime()) / (1000 * 60);
}
