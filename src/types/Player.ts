import { Tile } from './Tile';

export enum PlayerType {
  HUMAN = 'human',
  AI = 'ai'
}

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  score: number;
  hand: Tile[];
  isActive: boolean;
}

export interface PlayerConfig {
  name: string;
  type: PlayerType;
}
