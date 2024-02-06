import { SubtitleSettingListBox, SubtitleSettingListBoxConfig } from './subtitlesettinglistbox';
import { UIInstanceManager } from '../../uimanager';
import { PlayerAPI } from 'bitmovin-player';

/**
 * A select box providing a selection of different font colors.
 */
export class FontSizeListBox extends SubtitleSettingListBox {
  constructor(config: SubtitleSettingListBoxConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: ['ui-subtitlesettingsfontsizeselectbox'],
      },
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    this.addItem('100', 'Aa');
    this.addItem('150', 'Aa');
    this.addItem('200', 'Aa');

    this.settingsManager.fontSize.onChanged.subscribe((sender, property) => {
      if (property.isSet()) {
        this.toggleOverlayClass('fontsize-' + property.value);
      } else {
        this.toggleOverlayClass(null);
      }

      // Select the item in case the property was set from outside
      this.selectItem(property.value);
    });

    this.onItemSelected.subscribe((sender, key: string) => {
      this.settingsManager.fontSize.value = key;
    });

    // Load initial value
    if (this.settingsManager.fontSize.isSet()) {
      this.selectItem(this.settingsManager.fontSize.value);
    } else {
      this.selectItem('100');
    }
  }
}
