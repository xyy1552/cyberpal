import { APPLE_WEBUSB_FILTERS } from './usb-constants.js';

export class WebUSBTransport {
  constructor({ onLog, onDisconnect }) {
    this.device = null;
    this.claimedInterface = null;
    this.onLog = onLog || (() => {});
    this.onDisconnect = onDisconnect || (() => {});

    this._handleHardwareDisconnect = (event) => {
      if (this.device && event.device === this.device) {
        this.onLog('warn', 'USB', `Hardware disconnect detected (${this._fmtId(event.device)}).`);
        this.device = null;
        this.claimedInterface = null;
        this.onDisconnect();
      }
    };

    if (navigator.usb) {
      navigator.usb.addEventListener('disconnect', this._handleHardwareDisconnect);
    }
  }

  static checkSupport() {
    if (!window.isSecureContext) {
      return {
        supported: false,
        reason: 'WebUSB requires a Secure Context (HTTPS or localhost).'
      };
    }
    if (!('usb' in navigator)) {
      return {
        supported: false,
        reason: 'navigator.usb is unavailable. Use Android Chrome, Desktop Chrome, or Edge.'
      };
    }
    return { supported: true, reason: null };
  }

  async requestAndOpen() {
    this.onLog('info', 'USB', 'Requesting Apple USB device via browser permission dialog…');

    const device = await navigator.usb.requestDevice({
      filters: APPLE_WEBUSB_FILTERS
    });

    await this.openDevice(device);
    return device;
  }

  async openDevice(device) {
    if (this.device && this.device.opened) {
      await this.close();
    }

    this.device = device;
    this.claimedInterface = null;

    this.onLog(
      'info',
      'USB',
      `Opening device ${this._fmtId(device)} (${device.productName || 'Unnamed Apple Device'})…`
    );

    await device.open();

    if (device.configuration === null && device.configurations.length > 0) {
      const configVal = device.configurations[0].configurationValue;
      this.onLog('info', 'USB', `Selecting USB configuration #${configVal}…`);
      await device.selectConfiguration(configVal);
    }

    const interfaces = device.configuration?.interfaces || [];
    if (interfaces.length > 0) {
      const targetInterface = interfaces[0].interfaceNumber;
      try {
        await device.claimInterface(targetInterface);
        this.claimedInterface = targetInterface;
        this.onLog('ok', 'USB', `Claimed USB interface #${targetInterface}.`);
      } catch (err) {
        this.onLog(
          'warn',
          'USB',
          `Could not claim interface #${targetInterface} (${err.name}: ${err.message}). Descriptor inspection remains available, but control transfers may be blocked by the host OS.`
        );
      }
    }
  }

  async controlIn(setup, length) {
    this._ensureOpen();
    const result = await this.device.controlTransferIn(setup, length);
    if (result.status !== 'ok') {
      throw new Error(`USB controlTransferIn failed with status: ${result.status}`);
    }
    return result.data;
  }

  async controlOut(setup, data = undefined) {
    this._ensureOpen();
    const result = await this.device.controlTransferOut(setup, data);
    if (result.status !== 'ok') {
      throw new Error(`USB controlTransferOut failed with status: ${result.status}`);
    }
    return result.bytesWritten;
  }

  async resetBus() {
    this._ensureOpen();
    this.onLog('warn', 'USB', 'Issuing USB bus reset (device.reset())…');
    await this.device.reset();
    this.onLog('ok', 'USB', 'USB bus reset completed.');
  }

  async close() {
    if (!this.device) return;
    const dev = this.device;
    try {
      if (this.claimedInterface !== null && dev.opened) {
        await dev.releaseInterface(this.claimedInterface);
      }
      if (dev.opened) {
        await dev.close();
      }
      this.onLog('info', 'USB', `Closed USB session for ${this._fmtId(dev)}.`);
    } catch (err) {
      this.onLog('warn', 'USB', `Error while closing device: ${err.message}`);
    } finally {
      this.device = null;
      this.claimedInterface = null;
    }
  }

  _ensureOpen() {
    if (!this.device || !this.device.opened) {
      throw new Error('No active WebUSB device connection.');
    }
  }

  _fmtId(device) {
    const vid = device.vendorId.toString(16).padStart(4, '0').toUpperCase();
    const pid = device.productId.toString(16).padStart(4, '0').toUpperCase();
    return `${vid}:${pid}`;
  }
}
