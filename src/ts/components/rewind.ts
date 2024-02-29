import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';

declare const window: any;

export class RewindButton extends ToggleButton<ToggleButtonConfig> {
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

    if (window.bitmovin.customMessageHandler) {
      window.bitmovin.customMessageHandler.on('toggleRewindButton', (data?: string) => {
        if (this.isEnabled()) {
          this.disable();
        } else {
          this.enable();
        }
      });

      this.onClick.subscribe(() => {
        alert(true);
        let result = window.bitmovin.customMessageHandler.sendSynchronous('rewindButton');
        console.log('Return value from native:', result);
        window.bitmovin.customMessageHandler.sendAsynchronous('rewindButtonAsync');
      });
    }
  }
}
