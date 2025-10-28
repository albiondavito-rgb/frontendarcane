import type { Product } from './product';

export type Message = {
  sender: 'user' | 'bot';
  text: string;
  products?: Product[];
};