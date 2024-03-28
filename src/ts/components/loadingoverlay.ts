import { ContainerConfig, Container } from './container';
import { UIInstanceManager } from '../uimanager';
import { Component, ComponentConfig } from './component';
import { Timeout } from '../timeout';
import { PlayerAPI } from 'bitmovin-player';
declare const window: any;

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

    player.on(player.exports.PlayerEvent.SourceLoaded, () => {
      uimanager.getUI().hideLoading();
      uimanager.getUI().showUi();
    });

    uimanager.onLoadingShow.subscribe(() => {
      showOverlay();
      this.show();
    });

    uimanager.onLoadingHide.subscribe(() => {
      hideOverlay();
    });

    if (window.bitmovin.customMessageHandler) {
      window.bitmovin.customMessageHandler.on('showLoading', (data?: string) => {
        uimanager.getUI().hideUi();
        uimanager.getUI().showLoading();
      });
      window.bitmovin.customMessageHandler.on('hideLoading', (data?: string) => {
        uimanager.getUI().hideLoading();
        uimanager.getUI().showUi();
      });
    }
  }
}
