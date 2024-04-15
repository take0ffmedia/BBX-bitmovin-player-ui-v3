import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { INTERVAL_SEEK, TIME_TO_WAIT_SEEK } from './constants';
import Timekeeper from './timekeeper';
declare const window: any;

export class ForwardButton extends ToggleButton<ToggleButtonConfig> {
  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: 'ui-forward',
      text: 'forward',
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
      window.bitmovin.customMessageHandler.on('toggleForwardButton', (data?: string) => {
        if (this.isEnabled()) {
          this.disable();
        } else {
          this.enable();
        }
      });
      this.onClick.subscribe(() => {
        const timekeeper = Timekeeper.getInstance();
        if (timekeeper.isAvailable()) {
          const duration = player.getDuration();
          const currentTime = player.getCurrentTime();
          player.seek(Math.min(duration, currentTime + INTERVAL_SEEK));
          turnOffButton();
          let result = window.bitmovin.customMessageHandler.sendSynchronous('forwardButton');
          window.bitmovin.customMessageHandler.sendAsynchronous('forwardButtonAsync');
        }
      });
    }

    uimanager.onSeeked.subscribe(() => {
      turnOffButton();
    });
    uimanager.onSeek.subscribe(() => {
      turnOffButton();
    });
    uimanager.onSeekPreview.subscribe(() => {
      turnOffButton();
    });
  }
}
