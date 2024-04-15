import { TIME_TO_WAIT_SEEK } from './constants';

export default class Timekeeper {
  private static _instance: Timekeeper;
  public lastTime: number = 0;

  private constructor() {}

  public static getInstance(): Timekeeper {
    if (!Timekeeper._instance) {
      Timekeeper._instance = new Timekeeper();
    }
    return Timekeeper._instance;
  }

  public updateLastTime(): void {
    this.lastTime = new Date().getTime();
  }

  public isAvailable(): boolean {
    const currDateTime = new Date().getTime();
    const timekeeper = Timekeeper.getInstance();
    const diff = currDateTime - timekeeper.lastTime;
    const result = diff > TIME_TO_WAIT_SEEK;
    if (result) {
      timekeeper.lastTime = currDateTime;
    }

    return result;
  }
}
