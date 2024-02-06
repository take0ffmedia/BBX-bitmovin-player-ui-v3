import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { PlayerAPI, PlayerConfig } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import { i18n } from '../localization/i18n';

declare const window: any;

type CustomPlayerAPI = PlayerAPI & {
  getSource(mergedConfig?: boolean): PlayerConfig & {
    metadata?: {
      hasNextEpisode: boolean;
    };
  };
};

export class NextEpisodeButton extends ToggleButton<ToggleButtonConfig> {
  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: 'ui-nextepisode',
      text: i18n.getLocalizer('settings.nextepisode'),
      ariaLabel: i18n.getLocalizer('settings.nextepisode'),
      // disabled: true,
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: CustomPlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    let init = () => {
      if (
        (player.getSource()?.metadata?.hasNextEpisode || '').toString() === 'false' ||
        !player.getSource()?.metadata?.hasNextEpisode ||
        (player.getSource()?.metadata?.isLiveStream || '').toString() === 'true'
      ) {
        this.disable();
      } else {
        this.enable();
      }
    };

    if (window.bitmovin.customMessageHandler) {
      window.bitmovin.customMessageHandler.on('nextEpisodeButton', (data?: string) => {
        if (this.isEnabled()) {
          this.disable();
        } else {
          this.enable();
        }
      });

      this.onClick.subscribe(() => {
        if (player.isPlaying()) {
          player.pause();
        }
        let result = window.bitmovin.customMessageHandler.sendSynchronous('nextEpisode');
        console.log('Return value from native:', result);
        window.bitmovin.customMessageHandler.sendAsynchronous('nextEpisodeAsync');
      });
    }

    // Init label
    init();

    player.on(player.exports.PlayerEvent.SourceLoaded, init);
    uimanager.getConfig().events.onUpdated.subscribe(init);
  }
}
