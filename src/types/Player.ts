import { Tile } from './Tile';

export enum PlayerType {
  HUMAN = 'human',
  AI = 'ai'
}

export enum PlayerColor {
  BLUE = 'blue',
  RED = 'red',
  GREEN = 'green',
  YELLOW = 'yellow'
}

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  score: number;
  hand: Tile[];
  isActive: boolean;
  color: PlayerColor;
}

export interface PlayerConfig {
  name: string;
  type: PlayerType;
}
