export const SOC_BY_CPID = {
  0x8960: 'Apple A7 (S5L8960X)',
  0x7000: 'Apple A8 (T7000)',
  0x7001: 'Apple A8X (T7001)',
  0x8000: 'Apple A9 (S8000 Samsung)',
  0x8003: 'Apple A9 (S8003 TSMC)',
  0x8001: 'Apple A9X (S8001)',
  0x8010: 'Apple A10 Fusion (T8010)',
  0x8011: 'Apple A10X Fusion (T8011)',
  0x8015: 'Apple A11 Bionic (T8015)',
  0x8020: 'Apple A12 Bionic (T8020)',
  0x8027: 'Apple A12X/A12Z Bionic',
  0x8030: 'Apple A13 Bionic (T8030)',
  0x8101: 'Apple A14 Bionic (T8101)',
  0x8110: 'Apple A15 Bionic (T8110)',
  0x8120: 'Apple A16 Bionic (T8120)',
  0x8130: 'Apple A17 Pro (T8130)',
  0x8140: 'Apple A18 / A18 Pro (T8140)'
};

export const MODELS_BY_CPID_BDID = {
  '8960:00': { productType: 'iPhone6,1', board: 'n51ap', name: 'iPhone 5s (GSM)' },
  '8960:02': { productType: 'iPhone6,2', board: 'n53ap', name: 'iPhone 5s (Global)' },
  '7000:04': { productType: 'iPhone7,1', board: 'n56ap', name: 'iPhone 6 Plus' },
  '7000:06': { productType: 'iPhone7,2', board: 'n61ap', name: 'iPhone 6' },
  '8000:04': { productType: 'iPhone8,1', board: 'n71ap', name: 'iPhone 6s (Samsung)' },
  '8003:04': { productType: 'iPhone8,1', board: 'n71map', name: 'iPhone 6s (TSMC)' },
  '8000:06': { productType: 'iPhone8,2', board: 'n66ap', name: 'iPhone 6s Plus (Samsung)' },
  '8003:06': { productType: 'iPhone8,2', board: 'n66map', name: 'iPhone 6s Plus (TSMC)' },
  '8000:02': { productType: 'iPhone8,4', board: 'n69uap', name: 'iPhone SE (1st gen, Samsung)' },
  '8003:02': { productType: 'iPhone8,4', board: 'n69ap', name: 'iPhone SE (1st gen, TSMC)' },
  '8010:08': { productType: 'iPhone9,1', board: 'd10ap', name: 'iPhone 7 (Global)' },
  '8010:0A': { productType: 'iPhone9,3', board: 'd101ap', name: 'iPhone 7 (GSM)' },
  '8010:0C': { productType: 'iPhone9,2', board: 'd11ap', name: 'iPhone 7 Plus (Global)' },
  '8010:0E': { productType: 'iPhone9,4', board: 'd111ap', name: 'iPhone 7 Plus (GSM)' },
  '8015:02': { productType: 'iPhone10,1', board: 'd20ap', name: 'iPhone 8 (Global)' },
  '8015:0A': { productType: 'iPhone10,4', board: 'd201ap', name: 'iPhone 8 (GSM)' },
  '8015:04': { productType: 'iPhone10,2', board: 'd21ap', name: 'iPhone 8 Plus (Global)' },
  '8015:0C': { productType: 'iPhone10,5', board: 'd211ap', name: 'iPhone 8 Plus (GSM)' },
  '8015:06': { productType: 'iPhone10,3', board: 'd22ap', name: 'iPhone X (Global)' },
  '8015:0E': { productType: 'iPhone10,6', board: 'd221ap', name: 'iPhone X (GSM)' },
  '8020:08': { productType: 'iPhone11,2', board: 'd321ap', name: 'iPhone XS' },
  '8020:0E': { productType: 'iPhone11,6', board: 'd331pap', name: 'iPhone XS Max' },
  '8020:06': { productType: 'iPhone11,8', board: 'n841ap', name: 'iPhone XR' },
  '8030:0E': { productType: 'iPhone12,1', board: 'n104ap', name: 'iPhone 11' },
  '8030:0C': { productType: 'iPhone12,3', board: 'd421ap', name: 'iPhone 11 Pro' },
  '8030:0A': { productType: 'iPhone12,5', board: 'd431ap', name: 'iPhone 11 Pro Max' },
  '8030:10': { productType: 'iPhone12,8', board: 'd79ap', name: 'iPhone SE (2nd gen)' },
  '8101:0A': { productType: 'iPhone13,1', board: 'd52gap', name: 'iPhone 12 mini' },
  '8101:0C': { productType: 'iPhone13,2', board: 'd53gap', name: 'iPhone 12' },
  '8101:0E': { productType: 'iPhone13,3', board: 'd53pap', name: 'iPhone 12 Pro' },
  '8101:08': { productType: 'iPhone13,4', board: 'd54pap', name: 'iPhone 12 Pro Max' }
};

export function lookupAppleHardware(cpidHex, bdidHex) {
  if (!cpidHex) {
    return {
      soc: 'Unknown SoC',
      modelName: 'Unidentified Apple Device',
      productType: null,
      board: null
    };
  }

  const normalizedCpid = parseInt(cpidHex, 16);
  const soc = SOC_BY_CPID[normalizedCpid] || `Apple Silicon (CPID 0x${cpidHex.toUpperCase()})`;

  if (bdidHex) {
    const key = `${cpidHex.toUpperCase()}:${bdidHex.toUpperCase().padStart(2, '0')}`;
    const match = MODELS_BY_CPID_BDID[key];
    if (match) {
      return {
        soc,
        modelName: `${match.name} (${match.productType})`,
        productType: match.productType,
        board: match.board
      };
    }
  }

  return {
    soc,
    modelName: `Unmapped Model (CPID 0x${cpidHex.toUpperCase()})`,
    productType: null,
    board: null
  };
}
