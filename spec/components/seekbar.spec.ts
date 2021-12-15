import { MockHelper, TestingPlayerAPI } from '../helper/MockHelper';
import { SeekBar } from '../../src/ts/components/seekbar';
import { UIInstanceManager } from '../../src/ts/uimanager';
import { Timeout } from '../../src/ts/timeout';

let playerMock: TestingPlayerAPI;
let uiInstanceManagerMock: UIInstanceManager;

let seekbar: SeekBar;

describe('SeekBar', () => {
  beforeEach(() => {
    playerMock = MockHelper.getPlayerMock();
    uiInstanceManagerMock = MockHelper.getUiInstanceManagerMock();

    seekbar = new SeekBar({ smoothPlaybackPositionUpdateIntervalMs: 1 });
  });

  describe('becomes visible when switching from live to vod', () => {
    it('when live had no time shift', () => {
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(0);
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(Infinity);

      seekbar.configure(playerMock, uiInstanceManagerMock);

      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      const showSpy = jest.spyOn(seekbar, 'show');

      playerMock.eventEmitter.fireDurationChangedEvent();

      expect(showSpy).toHaveBeenCalled();
    });
  });

  describe('disables smoothPlaybackPositionUpdater on Live Streams', () => {
    it('clears smoothPlaybackPositionUpdater when AD is finished', () => {
      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-60);
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(Infinity);
      seekbar.configure(playerMock, uiInstanceManagerMock);

      jest.spyOn(playerMock, 'isLive').mockReturnValue(false);
      playerMock.eventEmitter.fireAdBreakStartedEvent();

      const playbackUpdater: Timeout = (seekbar as any).smoothPlaybackPositionUpdater;
      const clearSpy = jest.spyOn(playbackUpdater, 'clear');

      jest.spyOn(playerMock, 'isLive').mockReturnValue(true);
      playerMock.eventEmitter.fireAdBreakFinishedEvent();

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('playback position', () => {
    let setPlaybackPositionSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.spyOn(playerMock, 'getDuration').mockReturnValue(20);
      seekbar.configure(playerMock, uiInstanceManagerMock);

      setPlaybackPositionSpy = jest.spyOn(seekbar, 'setPlaybackPosition');
    })

    test.each`
      isLive | isSeeking | timesCalled
      ${false} | ${true} | ${0}
      ${true} | ${true} | ${0}
      ${false} | ${false} | ${1}
      ${true} | ${false} | ${1}
      `('will not be set when isLive=$isLive, isSeeking=$isSeeking and a stall ended event is fired',
        ({isLive, isSeeking, timesCalled}) => {
          if (isLive) {
            jest.spyOn(playerMock, 'getMaxTimeShift').mockReturnValue(-60);
          }
          jest.spyOn(seekbar, 'isSeeking').mockReturnValue(isSeeking);
          jest.spyOn(playerMock, 'isLive').mockReturnValue(isLive);

          playerMock.eventEmitter.fireStallEndedEvent();

          expect(setPlaybackPositionSpy).toHaveBeenCalledTimes(timesCalled);
        })

    it('will be moved after a successful seeked event', function () {
      playerMock.eventEmitter.fireSeekedEvent();
      expect(setPlaybackPositionSpy).toHaveBeenCalledTimes(1);
    });

    it('will not move after a successful segment request download', function () {
      playerMock.eventEmitter.fireSegmentRequestFinished();
      expect(setPlaybackPositionSpy).toHaveBeenCalledTimes(0);
    });
  })

  describe('buffer levels', () => {
    beforeEach(() => {
      seekbar.configure(playerMock, uiInstanceManagerMock);
    })

    test.each`
    isLive
    ${true} 
    ${false}
    `('should get updated accordingly when a request has finished and isLive=$isLive', ({isLive}) => {

      const setBufferPositionSpy = jest.spyOn(seekbar, 'setBufferPosition');
      jest.spyOn(playerMock, 'isLive').mockReturnValue(isLive);
      const value = 100;

      playerMock.eventEmitter.fireSegmentRequestFinished();

      expect(setBufferPositionSpy).toHaveBeenCalledTimes(1);
      expect(setBufferPositionSpy).toHaveBeenCalledWith(isLive ? 100 : value);
    })
  });
});
