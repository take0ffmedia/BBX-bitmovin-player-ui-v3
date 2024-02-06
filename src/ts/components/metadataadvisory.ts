import { LabelConfig, Label } from './label';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI, PlayerConfig } from 'bitmovin-player';
import { i18n } from '../localization/i18n';

/**
 * Enumerates the types of content that the {@link MetadataAdvisory} can display.
 */
export enum MetadataAdvisoryContent {
  /**
   * Classification of the data source.
   */
  Classification,
  /**
   * Description fo the data source.
   */
  Description,
}

/**
 * Configuration interface for {@link MetadataLabel}.
 */
export interface MetadataAdvisoryConfig extends LabelConfig {
  /**
   * The type of content that should be displayed in the label.
   */
  content: MetadataAdvisoryContent;
}

type CustomPlayerAPI = PlayerAPI & {
  getSource(mergedConfig?: boolean): PlayerConfig & {
    metadata?: {
      advisory: {
        classification: string;
        description: string;
      };
    };
  };
};

/**
 * A label that can be configured to display certain metadata.
 */
export class MetadataAdvisory extends Label<MetadataAdvisoryConfig> {
  constructor(config: MetadataAdvisoryConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: [
          'label-metadata',
          'label-metadata-' + MetadataAdvisoryContent[config.content].toLowerCase(),
        ],
      } as MetadataAdvisoryConfig,
      this.config,
    );
  }

  configure(player: CustomPlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);
    let notRatedOrDescription = this.prefixCss('not-rated-or-description');

    let config = this.getConfig();

    let init = () => {
      let advisory;
      if (typeof player.getSource()?.metadata === 'object') {
        advisory = player.getSource()?.metadata;
      } else if (typeof player.getSource()?.metadata === 'string') {
        advisory = JSON.parse(player.getSource()?.metadata as unknown as string).NativeMap;
      }

      if (advisory?.advisoryClassification?.length || advisory?.advisoryDescription?.length) {
        switch (config.content) {
          case MetadataAdvisoryContent.Classification:
            this.setText(
              `${i18n.performLocalization(i18n.getLocalizer('settings.rated'))} ${
                advisory?.advisoryClassification
              }`,
            );
            break;
          case MetadataAdvisoryContent.Description:
            this.setText(advisory?.advisoryDescription);
            break;
        }
        this.getDomElement().removeClass(notRatedOrDescription);
      } else {
        this.getDomElement().addClass(notRatedOrDescription);
      }
    };

    let unload = () => {
      this.setText('');
    };

    // Init label
    init();
    // Clear labels when source is unloaded
    player.on(player.exports.PlayerEvent.SourceUnloaded, unload);

    player.on(player.exports.PlayerEvent.SourceLoaded, init);

    uimanager.getConfig().events.onUpdated.subscribe(init);
  }
}
