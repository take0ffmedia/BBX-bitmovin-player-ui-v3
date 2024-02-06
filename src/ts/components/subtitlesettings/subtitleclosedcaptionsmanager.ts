import { StorageUtils } from '../../storageutils';
import { Component, ComponentConfig } from '../component';
import { EventDispatcher, Event } from '../../eventdispatcher';

interface SubtitleClosedCaptions {
  fontColor?: string;
  fontOpacity?: string;
  fontFamily?: string;
  fontSize?: string;
  characterEdge?: string;
  backgroundColor?: string;
  backgroundOpacity?: string;
  windowColor?: string;
  windowOpacity?: string;
}

interface Properties {
  [name: string]: SubtitleClosedCaptionsProperty<string>;
}

export class SubtitleClosedCaptionsManager {
  private userSettings: SubtitleClosedCaptions;
  private localStorageKey: string;

  private _properties: Properties = {
    closedCaptions: new SubtitleClosedCaptionsProperty<string>(this),
  };

  constructor() {
    this.userSettings = {};
    this.localStorageKey = DummyComponent.instance().prefixCss('subtitleclosedcaptions');

    for (let propertyName in this._properties) {
      this._properties[propertyName].onChanged.subscribe((sender, property) => {
        if (property.isSet()) {
          (<any>this.userSettings)[propertyName] = property.value;
        } else {
          // Delete the property from the settings object if unset to avoid serialization of null values
          delete (<any>this.userSettings)[propertyName];
        }

        // Save the settings object when a property has changed
        this.save();
      });
    }

    this.load();
  }

  public reset(): void {
    for (let propertyName in this._properties) {
      this._properties[propertyName].clear();
    }
  }

  public get closedCaptions(): SubtitleClosedCaptionsProperty<string> {
    return this._properties.closedCaptions;
  }

  /**
   * Saves the settings to local storage.
   */
  public save(): void {
    StorageUtils.setObject(this.localStorageKey, this.userSettings);
  }

  /**
   * Loads the settings from local storage
   */
  public load(): void {
    this.userSettings = StorageUtils.getObject<SubtitleClosedCaptions>(this.localStorageKey) || {};
    // Apply the loaded settings
    for (let property in this.userSettings) {
      this._properties[property].value = (<any>this.userSettings)[property];
    }
  }
}

/**
 * A dummy component whose sole purpose is to expose the {@link #prefixCss} method to the
 * {@link SubtitleClosedCaptionsManager}.
 */
class DummyComponent extends Component<ComponentConfig> {
  private static _instance: DummyComponent;

  public static instance(): DummyComponent {
    if (!DummyComponent._instance) {
      DummyComponent._instance = new DummyComponent();
    }

    return DummyComponent._instance;
  }

  public prefixCss(cssClassOrId: string): string {
    return super.prefixCss(cssClassOrId);
  }
}

export class SubtitleClosedCaptionsProperty<T> {
  private _manager: SubtitleClosedCaptionsManager;
  private _onChanged: EventDispatcher<
    SubtitleClosedCaptionsManager,
    SubtitleClosedCaptionsProperty<T>
  >;
  private _value: T;

  constructor(manager: SubtitleClosedCaptionsManager) {
    this._manager = manager;
    this._onChanged = new EventDispatcher<
      SubtitleClosedCaptionsManager,
      SubtitleClosedCaptionsProperty<T>
    >();
  }

  public isSet(): boolean {
    return this._value != null;
  }

  public clear(): void {
    this._value = null;
    this.onChangedEvent(null);
  }

  public get value(): T {
    return this._value;
  }

  public set value(value: T) {
    if (typeof value === 'string' && value === 'null') {
      value = null;
    }

    this._value = value;
    this.onChangedEvent(value);
  }

  protected onChangedEvent(value: T) {
    this._onChanged.dispatch(this._manager, this);
  }

  public get onChanged(): Event<SubtitleClosedCaptionsManager, SubtitleClosedCaptionsProperty<T>> {
    return this._onChanged.getEvent();
  }
}
