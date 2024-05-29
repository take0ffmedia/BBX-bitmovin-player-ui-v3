import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';

declare const window: any;

export class RewindButton extends ToggleButton<ToggleButtonConfig> {
  private currentTime: number = 0;
  // private timer: NodeJS.Timeout;

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: 'ui-rewind',
      text: 'rewind',
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  getCurrentTime = (player: PlayerAPI) => {
    return this.currentTime === 0 ? player.getCurrentTime() - 10 : this.currentTime - 10;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    if (window.bitmovin.customMessageHandler) {
      window.bitmovin.customMessageHandler.on('toggleRewindButton', (data?: string) => {
        if (this.isEnabled()) {
          this.disable();
        } else {
          this.enable();
        }
      });

      this.onClick.subscribe(() => {
        this.currentTime = this.getCurrentTime(player);
        // clearTimeout(this.timer);
        // this.timer = setTimeout(() => {
        //   let result = window.bitmovin.customMessageHandler.sendSynchronous('rewindButton');
        //   console.log('Return value from native:', result);
        //   window.bitmovin.customMessageHandler.sendAsynchronous('rewindButtonAsync');
        //   player.seek(this.currentTime < 0 ? 0 : this.currentTime);
        //   this.currentTime = 0;
        // }, 250);
        let result = window.bitmovin.customMessageHandler.sendSynchronous('rewindButton');
        console.log('Return value from native:', result);
        window.bitmovin.customMessageHandler.sendAsynchronous('rewindButtonAsync');
        player.seek(this.currentTime < 0 ? 0 : this.currentTime);
      });
    }
  }
}
