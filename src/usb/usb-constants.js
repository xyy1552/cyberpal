export const APPLE_VID = 0x05ac;

export const APPLE_PIDS = {
  DFU_CLASSIC: 0x1227,
  DFU_PORT: 0xf014,
  RECOVERY_1: 0x1281,
  RECOVERY_2: 0x1280,
  RECOVERY_3: 0x1282,
  RECOVERY_4: 0x1283,
  WTF_MODE: 0x1222,
  NORMAL_IPHONE: 0x12a8,
  NORMAL_IPAD: 0x12ab
};

export const APPLE_WEBUSB_FILTERS = [
  { vendorId: APPLE_VID, productId: APPLE_PIDS.DFU_CLASSIC },
  { vendorId: APPLE_VID, productId: APPLE_PIDS.DFU_PORT },
  { vendorId: APPLE_VID, productId: APPLE_PIDS.RECOVERY_1 },
  { vendorId: APPLE_VID, productId: APPLE_PIDS.RECOVERY_2 },
  { vendorId: APPLE_VID, productId: APPLE_PIDS.RECOVERY_3 },
  { vendorId: APPLE_VID, productId: APPLE_PIDS.RECOVERY_4 },
  { vendorId: APPLE_VID, productId: APPLE_PIDS.NORMAL_IPHONE },
  { vendorId: APPLE_VID, productId: APPLE_PIDS.NORMAL_IPAD }
];

export const DFU_REQUEST = {
  GETSTATUS: 0x03,
  CLRSTATUS: 0x04,
  GETSTATE: 0x05,
  ABORT: 0x06
};

export const DFU_STATUS_NAMES = {
  0x00: 'OK (No error condition)',
  0x01: 'errTARGET (File not targeted for device)',
  0x02: 'errFILE (File failed verification)',
  0x03: 'errWRITE (Unable to write memory)',
  0x04: 'errERASE (Memory erase failed)',
  0x05: 'errCHECK_ERASED (Erase check failed)',
  0x06: 'errPROG (Program memory function failed)',
  0x07: 'errVERIFY (Verification failed)',
  0x08: 'errADDRESS (Invalid address)',
  0x09: 'errNOTDONE (Received zero-length download prematurely)',
  0x0a: 'errFIRMWARE (Firmware corrupt)',
  0x0b: 'errVENDOR (Vendor-specific error)',
  0x0c: 'errUSBR (Unexpected USB reset)',
  0x0d: 'errPOR (Unexpected power-on reset)',
  0x0e: 'errUNKNOWN (Unknown error)',
  0x0f: 'errSTALLEDPKT (Unexpected stalled request)'
};

export const DFU_STATE_NAMES = {
  0x00: 'appIDLE',
  0x01: 'appDETACH',
  0x02: 'dfuIDLE',
  0x03: 'dfuDNLOAD-SYNC',
  0x04: 'dfuDNBUSY',
  0x05: 'dfuDNLOAD-IDLE',
  0x06: 'dfuMANIFEST-SYNC',
  0x07: 'dfuMANIFEST',
  0x08: 'dfuMANIFEST-WAIT-RESET',
  0x09: 'dfuUPLOAD-IDLE',
  0x0a: 'dfuERROR'
};
