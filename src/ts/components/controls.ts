import { Container, ContainerConfig } from './container';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * Configuration interface for a {@link Controls}.
 */
export interface ControlsConfig extends ContainerConfig {
  /**
   * Specifies if the title bar should stay hidden when no metadata label contains any text. Does not make a lot
   * of sense if the title bar contains other components than just MetadataLabels (like in the default configuration).
   * Default: false
   */
  keepHiddenWithoutMetadata?: boolean;
}

/**
 * Displays a title bar containing a label with the title of the video.
 */
export class Controls extends Container<ControlsConfig> {
  constructor(config: ControlsConfig = {}) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-controls',
        hidden: true,
        components: [],
        keepHiddenWithoutMetadata: false,
      },
      <ControlsConfig>this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let shouldBeShown = !this.isHidden();

    let checkMetadataTextAndUpdateVisibility = () => {
      if (this.isShown()) {
        // Hide a visible Controls if it does not contain any text and the hidden flag is set
        if (config.keepHiddenWithoutMetadata) {
          this.hide();
        }
      } else if (shouldBeShown) {
        // Show a hidden Controls if it should actually be shown
        this.show();
      }
    };

    uimanager.onControlsShow.subscribe(() => {
      shouldBeShown = true;
      if (!config.keepHiddenWithoutMetadata) {
        this.show();
      }
    });
    uimanager.onControlsHide.subscribe(() => {
      shouldBeShown = false;
      this.hide();
    });

    // init
    checkMetadataTextAndUpdateVisibility();

    player.on(player.exports.PlayerEvent.Seek, () => this.hide());
    player.on(player.exports.PlayerEvent.Seeked, () => this.show());
  }
}
