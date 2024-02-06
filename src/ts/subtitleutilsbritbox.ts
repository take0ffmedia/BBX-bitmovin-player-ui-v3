import { ListItem, ListSelector, ListSelectorConfig } from './components/listselector';
import { UIInstanceManager } from './uimanager';
import { PlayerAPI, SubtitleEvent, SubtitleTrack } from 'bitmovin-player';
import { i18n } from './localization/i18n';
import { SubtitleClosedCaptionsManager } from './components/subtitlesettings/subtitleclosedcaptionsmanager';

/**
 * Helper class to handle all subtitle related events
 *
 * This class listens to player events as well as the `ListSelector` event if selection changed
 */
export class SubtitleSwitchHandler {
  private static SUBTITLES_OFF_KEY: string = 'off';
  private static SUBTITLES_DEFAULT_KEY: string = 'en-US';
  private static SUBTITLES_DEFAULT_KEY_SECONDARY: string = 'en-GB';

  private player: PlayerAPI;
  private listElement: ListSelector<ListSelectorConfig>;
  private uimanager: UIInstanceManager;
  private settingsManager: SubtitleClosedCaptionsManager;

  constructor(
    player: PlayerAPI,
    element: ListSelector<ListSelectorConfig>,
    uimanager: UIInstanceManager,
    settingsManager: SubtitleClosedCaptionsManager,
  ) {
    this.player = player;
    this.listElement = element;
    this.uimanager = uimanager;
    this.settingsManager = settingsManager;

    this.bindSelectionEvent();
    this.bindPlayerEvents();
    this.refreshSubtitles();
  }

  private bindSelectionEvent(): void {
    this.listElement.onItemSelected.subscribe((_, value: string) => {
      // TODO add support for multiple concurrent subtitle selections
      if (value === SubtitleSwitchHandler.SUBTITLES_OFF_KEY) {
        const currentSubtitle = this.player.subtitles
          .list()
          .filter((subtitle) => subtitle.enabled)
          .pop();
        if (currentSubtitle) {
          this.player.subtitles.disable(currentSubtitle.id);
        }
      } else {
        this.player.subtitles.enable(value, true);
      }
    });
  }

  private bindPlayerEvents(): void {
    this.player.on(this.player.exports.PlayerEvent.SubtitleAdded, this.addSubtitle);
    this.player.on(this.player.exports.PlayerEvent.SubtitleEnabled, this.selectCurrentSubtitle);
    this.player.on(this.player.exports.PlayerEvent.SubtitleDisabled, this.selectCurrentSubtitle);
    this.player.on(this.player.exports.PlayerEvent.SubtitleRemoved, this.removeSubtitle);
    // Update subtitles when source goes away
    this.player.on(this.player.exports.PlayerEvent.SourceUnloaded, this.clearSubtitles);
    // Update subtitles when the period within a source changes
    this.player.on(this.player.exports.PlayerEvent.PeriodSwitched, this.refreshSubtitles);
    this.uimanager.getConfig().events.onUpdated.subscribe(this.refreshSubtitles);
  }

  private addSubtitle = (event: SubtitleEvent) => {
    const subtitle = event.subtitle;
    if (!this.listElement.hasItem(subtitle.id)) {
      this.listElement.addItem(subtitle.id, subtitle.label);
    }
  };

  private removeSubtitle = (event: SubtitleEvent) => {
    const subtitle = event.subtitle;
    if (this.listElement.hasItem(subtitle.id)) {
      this.listElement.removeItem(subtitle.id);
    }
  };

  private selectCurrentSubtitle = () => {
    if (!this.player.subtitles) {
      // Subtitles API not available (yet)
      return;
    }
    if (this.settingsManager.closedCaptions.isSet()) {
      const filtered = this.player.subtitles
        .list()
        .filter((subtitle) => subtitle.label === this.settingsManager.closedCaptions.value);
      if (filtered.length > 0) {
        this.listElement.selectItem(filtered[0].id);
      } else if (
        this.settingsManager.closedCaptions.value === SubtitleSwitchHandler.SUBTITLES_OFF_KEY
      ) {
        this.listElement.selectItem(SubtitleSwitchHandler.SUBTITLES_OFF_KEY);
      } else {
        const getEnglishSubtitle = this.player.subtitles
          .list()
          .filter((subtitle) => subtitle.label.toLowerCase() === 'english');
        if (getEnglishSubtitle.length > 0) {
          this.listElement.selectItem(getEnglishSubtitle[0].id);
        }
      }
    } else {
      this.listElement.selectItem(SubtitleSwitchHandler.SUBTITLES_OFF_KEY);
    }
  };

  private clearSubtitles = () => {
    this.listElement.clearItems();
  };

  private sortOn(property: string) {
    return function (a: any, b: any) {
      if (a[property] < b[property]) {
        return -1;
      } else if (a[property] > b[property]) {
        return 1;
      } else {
        return 0;
      }
    };
  }

  private refreshSubtitles = () => {
    if (!this.player.subtitles) {
      // Subtitles API not available (yet)
      return;
    }

    const offListItem: ListItem = {
      key: SubtitleSwitchHandler.SUBTITLES_OFF_KEY,
      label: i18n.getLocalizer('off'),
    };

    const subtitles = this.player.subtitles.list();
    const subtitleToListItem = (subtitle: SubtitleTrack): ListItem => {
      return { key: subtitle.id, label: subtitle.label };
    };

    const arrayList = subtitles.map(subtitleToListItem);
    const filterEnglish = arrayList.filter((item) => item.label === 'English');
    const resultantArrayList = [];

    if (filterEnglish.length > 0) {
      resultantArrayList.push(filterEnglish[0]);
    }

    const listOtherLanguage = arrayList.filter((item) => item.label !== 'English');
    const resultantOtherLanguages = listOtherLanguage.sort(this.sortOn('label'));

    this.listElement.synchronizeItems([
      offListItem,
      ...resultantArrayList,
      ...resultantOtherLanguages,
    ]);

    this.selectCurrentSubtitle();
  };
}
