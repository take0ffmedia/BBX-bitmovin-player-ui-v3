import { BritboxHugePlaybackToggleButton } from './britboxhugeplaybacktogglebutton';
import { Container, ContainerConfig } from './container';

/**
 * Overlays the player and displays error messages.
 */
export class BritboxPlaybackToggleOverlay extends Container<ContainerConfig> {
  private playbackToggleButton: BritboxHugePlaybackToggleButton;

  constructor(config: ContainerConfig = {}) {
    super(config);

    this.playbackToggleButton = new BritboxHugePlaybackToggleButton();

    this.config = this.mergeConfig(
      config,
      {
        cssClass: 'ui-playbacktoggle-overlay',
        components: [this.playbackToggleButton],
      },
      this.config,
    );
  }
}
