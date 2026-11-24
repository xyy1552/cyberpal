import { APPLE_PIDS } from './usb-constants.js';
import { lookupAppleHardware } from './device-database.js';

export function classifyAppleMode(productId) {
  switch (productId) {
    case APPLE_PIDS.DFU_CLASSIC:
      return {
        code: 'dfu',
        label: 'DFU MODE (Classic)',
        supportsDfu11: true,
        notes: 'SecureROM DFU detected (05AC:1227). Standard DFU 1.1 diagnostic requests supported.'
      };
    case APPLE_PIDS.DFU_PORT:
      return {
        code: 'dfu-port',
        label: 'PORT DFU MODE (USB-C)',
        supportsDfu11: false,
        notes: 'USB-C Port DFU detected (05AC:F014). Classic DFU 1.1 control transfers are generally unsupported in this mode.'
      };
    case APPLE_PIDS.RECOVERY_1:
    case APPLE_PIDS.RECOVERY_2:
    case APPLE_PIDS.RECOVERY_3:
    case APPLE_PIDS.RECOVERY_4:
      return {
        code: 'recovery',
        label: 'RECOVERY MODE (iBoot)',
        supportsDfu11: false,
        notes: 'iBoot Recovery Mode detected. Descriptor & serial tag inspection available.'
      };
    case APPLE_PIDS.NORMAL_IPHONE:
    case APPLE_PIDS.NORMAL_IPAD:
      return {
        code: 'normal',
        label: 'NORMAL iOS MODE',
        supportsDfu11: false,
        notes: 'Normal mode uses usbmuxd/TLS pairing. Enter DFU or Recovery Mode for low-level USB diagnostics.'
      };
    default:
      return {
        code: 'unknown',
        label: `UNKNOWN (0x${productId.toString(16).toUpperCase()})`,
        supportsDfu11: false,
        notes: 'Unrecognized Apple USB Product ID.'
      };
  }
}

export function parseAppleSerialString(serialString) {
  const parsed = {};
  if (!serialString || typeof serialString !== 'string') {
    return parsed;
  }

  const tokenRegex = /([A-Z0-9]+):(?:\[([^\]]+)\]|([^\s]+))/g;
  let match;
  while ((match = tokenRegex.exec(serialString)) !== null) {
    const key = match[1];
    const value = match[2] !== undefined ? match[2] : match[3];
    parsed[key] = value;
  }

  return parsed;
}

export function inspectUSBDevice(device) {
  const mode = classifyAppleMode(device.productId);
  const serialTags = parseAppleSerialString(device.serialNumber);
  const hardware = lookupAppleHardware(serialTags.CPID, serialTags.BDID);

  const vidHex = device.vendorId.toString(16).padStart(4, '0').toUpperCase();
  const pidHex = device.productId.toString(16).padStart(4, '0').toUpperCase();

  const usbVersion = `${device.usbVersionMajor}.${device.usbVersionMinor}${device.usbVersionSubminor ? '.' + device.usbVersionSubminor : ''}`;
  const deviceClass = `0x${device.deviceClass.toString(16).padStart(2, '0')} / 0x${device.deviceSubclass.toString(16).padStart(2, '0')} / 0x${device.deviceProtocol.toString(16).padStart(2, '0')}`;

  const configSummary = (device.configurations || []).map((cfg) => ({
    configurationValue: cfg.configurationValue,
    configurationName: cfg.configurationName || null,
    interfaces: cfg.interfaces.map((iface) => ({
      interfaceNumber: iface.interfaceNumber,
      claimed: iface.claimed,
      alternates: iface.alternates.map((alt) => ({
        alternateSetting: alt.alternateSetting,
        classTriple: `0x${alt.interfaceClass.toString(16).padStart(2, '0')}/0x${alt.interfaceSubclass.toString(16).padStart(2, '0')}/0x${alt.interfaceProtocol.toString(16).padStart(2, '0')}`,
        interfaceName: alt.interfaceName || null,
        endpoints: alt.endpoints.map((ep) => ({
          endpointNumber: ep.endpointNumber,
          direction: ep.direction,
          type: ep.type,
          packetSize: ep.packetSize
        }))
      }))
    }))
  }));

  const flags = [];
  if (serialTags.CPFM) flags.push(`CPFM:${serialTags.CPFM}`);
  if (serialTags.SCEP) flags.push(`SCEP:${serialTags.SCEP}`);
  if (serialTags.IBFL) flags.push(`IBFL:${serialTags.IBFL}`);
  if (serialTags.CPRV) flags.push(`CPRV:${serialTags.CPRV}`);

  return {
    vidHex,
    pidHex,
    vidPid: `${vidHex}:${pidHex}`,
    productName: device.productName || 'Unavailable',
    manufacturerName: device.manufacturerName || 'Unavailable',
    serialNumber: device.serialNumber || '',
    usbVersion,
    deviceClass,
    maxPacketSize0: device.deviceVersionMajor !== undefined
      ? `bMaxPacketSize0 N/A in WebUSB (bcdDevice ${device.deviceVersionMajor}.${device.deviceVersionMinor})`
      : 'Unavailable',
    activeConfig: device.configuration ? `#${device.configuration.configurationValue}` : 'None',
    mode,
    serialTags,
    hardware,
    flagsSummary: flags.length > 0 ? flags.join(' · ') : 'Not exposed in this mode',
    configSummary
  };
}
