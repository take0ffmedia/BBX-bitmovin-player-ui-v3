import { ToggleButton, ToggleButtonConfig } from "./togglebutton";
import { PlayerAPI } from "bitmovin-player";
import { UIInstanceManager } from "../uimanager";

declare const window: any;

export class ForwardButton extends ToggleButton<ToggleButtonConfig> {
  constructor(config: ToggleButtonConfig = {}) {
    super(config);

    const defaultConfig: ToggleButtonConfig = {
      cssClass: "ui-forward",
      text: "forward",
    };

    this.config = this.mergeConfig(config, defaultConfig, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    let init = () => {
      if (player.isLive()) {
        this.disable();
      } else {
        this.enable();
      }
    };

    if (window.bitmovin.customMessageHandler) {
      window.bitmovin.customMessageHandler.on(
        "toggleForwardButton",
        (data?: string) => {
          if (this.isEnabled()) {
            this.disable();
          } else {
            this.enable();
          }
        }
      );

      this.onClick.subscribe(() => {
        alert(true);
        let result =
          window.bitmovin.customMessageHandler.sendSynchronous("forwardButton");
        console.log("Return value from native:", result);
        window.bitmovin.customMessageHandler.sendAsynchronous(
          "forwardButtonAsync"
        );
      });
    }

    init();
    player.on(player.exports.PlayerEvent.SourceLoaded, init);
  }
}
