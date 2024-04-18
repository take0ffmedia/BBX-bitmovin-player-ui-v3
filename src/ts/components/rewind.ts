import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { TIME_TO_WAIT_SEEK } from './constants';

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
        const currDateTime = new Date().getTime();
        const diff = currDateTime - this.lastTimeRewind;
        if (diff > TIME_TO_WAIT_SEEK) {
          const currentTime = player.getCurrentTime();
          const newTime = currentTime - 10;
          if (newTime > 0) {
            player.seek(newTime);
          }
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
