import { ContainerConfig, Container } from './container';
import { UIInstanceManager } from '../uimanager';
import { Component, ComponentConfig } from './component';
import { Timeout } from '../timeout';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for the {@link LoadingOverlay} component.
 */
export interface LoadingOverlayConfig extends ContainerConfig {
  /**
   * Delay in milliseconds after which the loading overlay will be displayed. Useful to bypass short stalls without
   * displaying the overlay. Set to 0 to display the overlay instantly.
   * Default: 1000ms (1 second)
   */
  showDelayMs?: number;
}

/**
 * Overlays the player and displays a loading indicator.
 */
export class LoadingOverlay extends Container<LoadingOverlayConfig> {
  private indicator: Component<ComponentConfig>;

  constructor(config: LoadingOverlayConfig = {}) {
    super(config);

    this.indicator = new Component<ComponentConfig>({
      tag: 'div',
      cssClass: 'ui-buffering-overlay-loading',
      role: 'img',
    });

    this.config = this.mergeConfig(
      config,
      <LoadingOverlayConfig>{
        cssClass: 'ui-buffering-overlay loading-overlay',
        hidden: false,
        components: [this.indicator],
        showDelayMs: 0,
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

    let overlayShowTimeout = new Timeout(config.showDelayMs, () => {
      this.show();
    });

    let showOverlay = () => {
      overlayShowTimeout.start();
    };

    let hideOverlay = () => {
      overlayShowTimeout.clear();
      this.hide();
    };

    player.on(player.exports.PlayerEvent.Playing, hideOverlay);

    uimanager.onLoadingShow.subscribe(() => {
      showOverlay();
      this.show();
    });

    uimanager.onLoadingShow.subscribe(() => {
      this.hide();
    });
  }
}
