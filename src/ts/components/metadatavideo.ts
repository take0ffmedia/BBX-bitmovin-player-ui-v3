import { LabelConfig, Label } from './label';
import { UIInstanceManager } from '../uimanager';
import { PlayerAPI } from 'bitmovin-player';

declare const window: any;

/**
 * Enumerates the types of content that the {@link MetadataVideo} can display.
 */
export enum MetadataVideoContent {
  /**
   * Title of the data source.
   */
  Title,
  /**
   * Description fo the data source.
   */
  Description,
}

/**
 * Configuration interface for {@link MetadataVideo}.
 */
export interface MetadataVideoConfig extends LabelConfig {
  /**
   * The type of content that should be displayed in the label.
   */
  content: MetadataVideoContent;
}

/**
 * A label that can be configured to display certain metadata.
 */
export class MetadataVideo extends Label<MetadataVideoConfig> {
  constructor(config: MetadataVideoConfig) {
    super(config);

    this.config = this.mergeConfig(
      config,
      {
        cssClasses: [
          'label-metadata',
          'label-metadata-' + MetadataVideoContent[config.content].toLowerCase(),
        ],
      } as MetadataVideoConfig,
      this.config,
    );
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();

    if (window.bitmovin.customMessageHandler) {
      window.bitmovin.customMessageHandler.on('changeMetadata', (data?: string) => {
        const { metadata: { title, description } } = JSON.parse(data || '');
        switch (config.content) {
          case MetadataVideoContent.Title:
            this.setText(title);
            break;
          case MetadataVideoContent.Description:
            this.setText(description);
            break;
        }
      });
    }
  }
}
