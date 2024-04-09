import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { TIME_TO_WAIT_SEEK } from './constants';
declare const window: any;
export class ForwardButton extends ToggleButton<ToggleButtonConfig> {
  private lastTimeForward = 0;
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
        const currDateTime = new Date().getTime();
        const diff = currDateTime - this.lastTimeForward;
        if (diff > TIME_TO_WAIT_SEEK) {
          this.lastTimeForward = currDateTime;

          const duration = player.getDuration();
          const currentTime = player.getCurrentTime();
          const newTime = currentTime + 10;
          if (newTime < duration) {
            player.seek(newTime);
            turnOffButton();
          }
          let result = window.bitmovin.customMessageHandler.sendSynchronous('forwardButton');
          console.log('Return value from native:', result);
          window.bitmovin.customMessageHandler.sendAsynchronous('forwardButtonAsync');
        }
      });
    }

    uimanager.onSeeked.subscribe(() => {
      turnOffButton();
    });
  }
}
