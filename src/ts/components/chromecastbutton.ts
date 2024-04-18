import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { PlayerAPI, PlayerConfig } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';

declare const window: any;

type CustomPlayerAPI = PlayerAPI & {
  getSource(mergedConfig?: boolean): PlayerConfig & {
    metadata?: {
      hasChromecast: boolean;
    };
  };
};

export class ChromecastButton extends ToggleButton<ToggleButtonConfig> {
  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: 'ui-chromecast',
      // disabled: true,
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: CustomPlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    if (window.bitmovin.customMessageHandler) {
      window.bitmovin.customMessageHandler.on('chromecastButton', (data?: string) => {
        if (this.isEnabled() && data === 'false') {
          this.disable();
        } else {
          this.enable();
        }
      });

      this.onClick.subscribe(() => {
        if (player.isPlaying()) {
          player.pause();
        }

        window.bitmovin.customMessageHandler.sendAsynchronous('chromecastAsync');
      });
    }
  }
}
