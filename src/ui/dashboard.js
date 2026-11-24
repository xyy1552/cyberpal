export class DashboardUI {
  constructor() {
    this.el = {
      envWarning: document.getElementById('env-warning'),
      pill: document.getElementById('connection-pill'),
      pillText: document.getElementById('connection-pill-text'),
      scannerBar: document.getElementById('scanner-bar'),

      btnConnect: document.getElementById('btn-connect'),
      btnRefresh: document.getElementById('btn-refresh'),
      btnDisconnect: document.getElementById('btn-disconnect'),

      modeBadge: document.getElementById('device-mode-badge'),
      usbVer: document.getElementById('val-usb-ver'),
      dfuStateBadge: document.getElementById('dfu-state-badge'),

      model: document.getElementById('val-model'),
      soc: document.getElementById('val-soc'),
      bdid: document.getElementById('val-bdid'),
      ecid: document.getElementById('val-ecid'),
      srtg: document.getElementById('val-srtg'),
      flags: document.getElementById('val-flags'),

      vidPid: document.getElementById('val-vid-pid'),
      product: document.getElementById('val-product'),
      manufacturer: document.getElementById('val-manufacturer'),
      configIf: document.getElementById('val-config-if'),
      deviceClass: document.getElementById('val-class'),
      packetSize: document.getElementById('val-packet-size'),
      rawDescriptors: document.getElementById('val-raw-descriptors'),

      opGetStatus: document.getElementById('op-get-status'),
      opGetState: document.getElementById('op-get-state'),
      opClrStatus: document.getElementById('op-clr-status'),
      opAbort: document.getElementById('op-abort'),
      opLatency: document.getElementById('op-latency'),
      opUsbReset: document.getElementById('op-usb-reset'),

      metricStatus: document.getElementById('metric-dfu-status'),
      metricState: document.getElementById('metric-dfu-state'),
      metricRtt: document.getElementById('metric-rtt')
    };
  }

  showEnvironmentWarning(message) {
    this.el.envWarning.textContent = `WEBUSB UNAVAILABLE: ${message}`;
    this.el.envWarning.classList.remove('hidden');
    this.el.btnConnect.disabled = true;
  }

  setScanning(isScanning) {
    this.el.scannerBar.classList.toggle('active', isScanning);
    if (isScanning) {
      this.setConnectionPill('scanning', 'SCANNING USB…');
    }
  }

  setConnectionPill(state, label) {
    this.el.pill.dataset.state = state;
    this.el.pillText.textContent = label;
  }

  renderDeviceSnapshot(snapshot, claimedInterface) {
    const pillState =
      snapshot.mode.code === 'dfu'
        ? 'dfu'
        : snapshot.mode.code === 'recovery'
          ? 'recovery'
          : 'connected';

    this.setConnectionPill(pillState, snapshot.mode.label);
    this.el.modeBadge.textContent = snapshot.mode.label;
    this.el.usbVer.textContent = `USB ${snapshot.usbVersion}`;

    this.el.model.textContent = snapshot.hardware.modelName;
    this.el.soc.textContent = snapshot.hardware.soc;
    this.el.bdid.textContent = snapshot.serialTags.BDID
      ? `0x${snapshot.serialTags.BDID}`
      : 'Not exposed';
    this.el.ecid.textContent = snapshot.serialTags.ECID
      ? `0x${snapshot.serialTags.ECID}`
      : 'Not exposed';
    this.el.srtg.textContent =
      snapshot.serialTags.SRTG || snapshot.serialTags.SRNM || 'Not exposed';
    this.el.flags.textContent = snapshot.flagsSummary;

    this.el.vidPid.textContent = snapshot.vidPid;
    this.el.product.textContent = snapshot.productName;
    this.el.manufacturer.textContent = snapshot.manufacturerName;
    this.el.configIf.textContent = `${snapshot.activeConfig} / IF ${claimedInterface !== null ? '#' + claimedInterface : 'Unclaimed'}`;
    this.el.deviceClass.textContent = snapshot.deviceClass;
    this.el.packetSize.textContent = snapshot.maxPacketSize0;

    this.el.rawDescriptors.textContent = JSON.stringify(
      {
        serialNumber: snapshot.serialNumber,
        parsedTags: snapshot.serialTags,
        configurations: snapshot.configSummary
      },
      null,
      2
    );

    this.el.btnRefresh.disabled = false;
    this.el.btnDisconnect.disabled = false;

    const dfuOpsReady = snapshot.mode.supportsDfu11 && claimedInterface !== null;
    this._setDfuOpsEnabled(dfuOpsReady);
    this.el.opUsbReset.disabled = false;
    this.el.dfuStateBadge.textContent = dfuOpsReady ? 'DFU 1.1 READY' : 'READ-ONLY';
  }

  updateDiagnosticMetrics({ statusText, stateText, rttMs }) {
    if (statusText !== undefined) this.el.metricStatus.textContent = statusText;
    if (stateText !== undefined) {
      this.el.metricState.textContent = stateText;
      this.el.dfuStateBadge.textContent = stateText;
    }
    if (rttMs !== undefined) this.el.metricRtt.textContent = `${rttMs} ms`;
  }

  resetToDisconnected() {
    this.setScanning(false);
    this.setConnectionPill('disconnected', 'DISCONNECTED');
    this.el.modeBadge.textContent = 'NO DEVICE';
    this.el.usbVer.textContent = 'USB —';
    this.el.dfuStateBadge.textContent = 'IDLE';

    const placeholders = [
      'model', 'soc', 'bdid', 'ecid', 'srtg', 'flags',
      'vidPid', 'product', 'manufacturer', 'configIf',
      'deviceClass', 'packetSize', 'metricStatus', 'metricState', 'metricRtt'
    ];
    placeholders.forEach((key) => {
      this.el[key].textContent = '—';
    });

    this.el.rawDescriptors.textContent = 'Awaiting USB connection…';
    this.el.btnRefresh.disabled = true;
    this.el.btnDisconnect.disabled = true;
    this._setDfuOpsEnabled(false);
    this.el.opUsbReset.disabled = true;
  }

  _setDfuOpsEnabled(enabled) {
    this.el.opGetStatus.disabled = !enabled;
    this.el.opGetState.disabled = !enabled;
    this.el.opClrStatus.disabled = !enabled;
    this.el.opAbort.disabled = !enabled;
    this.el.opLatency.disabled = !enabled;
  }
}
