import { ContainerConfig, Container } from './container';
import { UIInstanceManager } from '../uimanager';
import { Timeout } from '../timeout';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link Advisory} component.
 */
export interface AdvisoryConfig extends ContainerConfig {
  showDelayMs?: number;
  hideDelayMs?: number;
}

/**
 * Overlays the player and displays a advisor indicator.
 */
export class Advisory extends Container<AdvisoryConfig> {
  constructor(config: AdvisoryConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      <AdvisoryConfig>{
        cssClass: 'ui-advisory',
        hidden: true,
        showDelayMs: 2500,
        hideDelayMs: 7500,
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

    let overlayShowTimeout = new Timeout(config.showDelayMs || 0, () => {
      this.show();
    });

    let overlayHideTimeout = new Timeout(config.hideDelayMs || 0, () => {
      this.hide();
    });

    let firstPlay = true;

    let init = () => {
      overlayShowTimeout.start();
      overlayHideTimeout.start();
      firstPlay = false;
    };

    uimanager.onLoadingHide.subscribe(() => {
      new Timeout(1000, () => {
        if (firstPlay) {
          init();
        }
      }).start();
    });

    uimanager.onLoadingShow.subscribe(() => {
      overlayShowTimeout.clear();
      overlayHideTimeout.clear();
      this.hide();
      firstPlay = true;
    });
  }
}
