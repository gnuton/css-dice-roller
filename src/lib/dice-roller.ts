import { Die } from './dice';
import { DieType } from './types';

export class DiceRoller {
  private dice: Die[] = [];
  private container: HTMLElement;
  private defaultSize: number;

  constructor(container: HTMLElement, defaultSize: number = 100) {
    this.container = container;
    this.defaultSize = defaultSize;
  }

  public addDie(type: DieType, count: number = 1): Die[] {
    const newDice: Die[] = [];
    for (let i = 0; i < count; i++) {
        const die = new Die(type, this.container, this.defaultSize);
        this.dice.push(die);
        newDice.push(die);
    }
    return newDice;
  }

  public clear() {
    this.dice.forEach(die => die.remove());
    this.dice = [];
  }

  public async rollAll(): Promise<number[]> {
    const promises = this.dice.map(die => die.roll());
    return Promise.all(promises);
  }

  public getDiceCount(): number {
    return this.dice.length;
  }
}
