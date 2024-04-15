import { ToggleButton, ToggleButtonConfig } from './togglebutton';
import { PlayerAPI } from 'bitmovin-player';
import { UIInstanceManager } from '../uimanager';
import Timekeeper from './timekeeper';

export class PlayButton extends ToggleButton<ToggleButtonConfig> {
  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: 'ui-play',
      text: 'play',
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.onClick.subscribe(() => {
      if (player.isPlaying()) {
        player.pause('ui');
      } else {
        player.play('ui');
      }
      const timekeeper = Timekeeper.getInstance();
      timekeeper.updateLastTime();
    });

    player.on(player.exports.PlayerEvent.Play, () => {
      // Playback has really started, we can disable the flag to switch to normal toggle button handling
      this.on();
    });

    player.on(player.exports.PlayerEvent.Paused, () => {
      // Playback has really started, we can disable the flag to switch to normal toggle button handling
      this.off();
    });

    let init = () => {
      player.isPlaying() ? this.on() : this.off();
    };

    init();
  }
}
