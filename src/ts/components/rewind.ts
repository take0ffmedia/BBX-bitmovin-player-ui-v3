import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { INTERVAL_SEEK, TIME_TO_WAIT_SEEK } from './constants';
import Timekeeper from './timekeeper';

declare const window: any;
export class RewindButton extends ToggleButton<ToggleButtonConfig> {
  private lastTimeRewind = 0;

  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: 'ui-rewind',
      text: 'rewind',
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    const forwardButton = this;

    const turnOffButton = () => {
      if (forwardButton.isOn()) {
        forwardButton.off();
        setTimeout(() => {
          forwardButton.on();
        }, TIME_TO_WAIT_SEEK);
      }
    };

    if (window.bitmovin.customMessageHandler) {
      window.bitmovin.customMessageHandler.on('toggleRewindButton', (data?: string) => {
        if (this.isEnabled()) {
          this.disable();
        } else {
          this.enable();
        }
      });

      this.onClick.subscribe(() => {
        const timekeeper = Timekeeper.getInstance();
        if (timekeeper.isAvailable()) {
          const currentTime = player.getCurrentTime();
          player.seek(Math.max(0, currentTime - INTERVAL_SEEK));

          let result = window.bitmovin.customMessageHandler.sendSynchronous('rewindButton');
          console.log('Return value from native:', result);
          window.bitmovin.customMessageHandler.sendAsynchronous('rewindButtonAsync');
        }
      });
    }
    uimanager.onSeeked.subscribe(() => {
      turnOffButton();
    });
  }
}
