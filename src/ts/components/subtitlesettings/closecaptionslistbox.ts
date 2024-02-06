import {
  SubtitleCloseCaptionsListBox,
  CloseCaptionsListBoxConfig,
} from './subtitleclosecaptionslistbox';
import { UIInstanceManager } from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';
import { i18n } from '../../localization/i18n';
import { SubtitleClosedCaptionsManager } from './subtitleclosedcaptionsmanager';
// import { SubtitleSwitchHandler } from '../../subtitleutils';
import { SubtitleSwitchHandler } from '../../subtitleutilsbritbox';

/**
 * A select box providing a selection of different font colors.
 */
export class CloseCaptionsListBox extends SubtitleCloseCaptionsListBox {
  protected settingsManager: SubtitleClosedCaptionsManager;

  constructor(config: CloseCaptionsListBoxConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-subtitlesettingsfontsizeselectbox right'],
      },
      this.config,
    );

    this.settingsManager = config.settingsManager;
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    // this.addItem(null, i18n.getLocalizer('default'));
    this.addItem('false', 'Off');
    this.addItem('true', 'On');

    this.settingsManager.closedCaptions.onChanged.subscribe((sender, property) => {
      this.selectItem(property.value);
    });

    this.onItemSelected.subscribe((sender, key: string) => {
      const component = this.getItemForKey(key);
      this.settingsManager.closedCaptions.value = (component?.label as string) || 'Off';
    });

    // Load initial value
    // if (this.settingsManager.closedCaptions.isSet()) {
    //   this.selectItem(this.settingsManager.closedCaptions.value);
    // } else {
    //   this.selectItem('false');
    // }

    new SubtitleSwitchHandler(player, this, uimanager, this.settingsManager);
  }
}
