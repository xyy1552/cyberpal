import './styles/cyberpunk.css';
import { WebUSBTransport } from './usb/usb-transport.js';
import { inspectUSBDevice } from './usb/device-detector.js';
import { DFUDiagnostics } from './usb/dfu-diagnostics.js';
import { TelemetryTerminal } from './ui/terminal.js';
import { DashboardUI } from './ui/dashboard.js';

const terminal = new TelemetryTerminal(document.getElementById('terminal-output'));
const ui = new DashboardUI();

const log = (level, tag, msg) => terminal.log(level, tag, msg);

log('info', 'SYS', 'CyberPal WebUSB iOS Diagnostic Utility initialized.');

const envCheck = WebUSBTransport.checkSupport();
if (!envCheck.supported) {
  ui.showEnvironmentWarning(envCheck.reason);
  log('err', 'ENV', envCheck.reason);
} else {
  log('ok', 'ENV', 'WebUSB API & Secure Context verified. Ready for USB OTG device.');
}

const transport = new WebUSBTransport({
  onLog: log,
  onDisconnect: () => {
    ui.resetToDisconnected();
  }
});

const dfu = new DFUDiagnostics(transport, log);

function refreshDescriptorView() {
  if (!transport.device) return;
  const snapshot = inspectUSBDevice(transport.device);
  ui.renderDeviceSnapshot(snapshot, transport.claimedInterface);
  log('info', 'DETECT', `${snapshot.mode.label} | ${snapshot.hardware.modelName} | ${snapshot.hardware.soc}`);
  log('info', 'NOTE', snapshot.mode.notes);
}

ui.el.btnConnect.addEventListener('click', async () => {
  ui.setScanning(true);
  try {
    await transport.requestAndOpen();
    refreshDescriptorView();

    const snapshot = inspectUSBDevice(transport.device);
    if (snapshot.mode.supportsDfu11 && transport.claimedInterface !== null) {
      const status = await dfu.getStatus();
      ui.updateDiagnosticMetrics({
        statusText: status.statusName.split(' ')[0],
        stateText: status.stateName,
        rttMs: status.rttMs
      });
    }
  } catch (err) {
    if (err.name === 'NotFoundError') {
      log('warn', 'USB', 'Device selection canceled by user.');
    } else {
      log('err', 'USB', `${err.name || 'Error'}: ${err.message}`);
      ui.setConnectionPill('error', 'USB ERROR');
    }
    if (!transport.device) {
      ui.resetToDisconnected();
    }
  } finally {
    ui.setScanning(false);
  }
});

ui.el.btnRefresh.addEventListener('click', () => {
  log('info', 'USB', 'Re-reading cached WebUSB device descriptors…');
  refreshDescriptorView();
});

ui.el.btnDisconnect.addEventListener('click', async () => {
  await transport.close();
  ui.resetToDisconnected();
});

ui.el.opGetStatus.addEventListener('click', async () => {
  try {
    const res = await dfu.getStatus();
    ui.updateDiagnosticMetrics({
      statusText: res.statusName.split(' ')[0],
      stateText: res.stateName,
      rttMs: res.rttMs
    });
  } catch (err) {
    log('err', 'DFU', `DFU_GETSTATUS failed: ${err.message}`);
  }
});

ui.el.opGetState.addEventListener('click', async () => {
  try {
    const res = await dfu.getState();
    ui.updateDiagnosticMetrics({
      stateText: res.stateName,
      rttMs: res.rttMs
    });
  } catch (err) {
    log('err', 'DFU', `DFU_GETSTATE failed: ${err.message}`);
  }
});

ui.el.opClrStatus.addEventListener('click', async () => {
  try {
    const res = await dfu.clearStatus();
    ui.updateDiagnosticMetrics({ rttMs: res.rttMs });
  } catch (err) {
    log('err', 'DFU', `DFU_CLRSTATUS failed: ${err.message}`);
  }
});

ui.el.opAbort.addEventListener('click', async () => {
  try {
    const res = await dfu.abort();
    ui.updateDiagnosticMetrics({ rttMs: res.rttMs });
  } catch (err) {
    log('err', 'DFU', `DFU_ABORT failed: ${err.message}`);
  }
});

ui.el.opLatency.addEventListener('click', async () => {
  try {
    const res = await dfu.benchmarkControlPipe(5);
    ui.updateDiagnosticMetrics({ rttMs: `avg ${res.avg}` });
  } catch (err) {
    log('err', 'DIAG', `Benchmark failed: ${err.message}`);
  }
});

ui.el.opUsbReset.addEventListener('click', async () => {
  try {
    await transport.resetBus();
  } catch (err) {
    log('err', 'USB', `USB reset failed: ${err.message}`);
  }
});

document.getElementById('btn-clear-log').addEventListener('click', () => terminal.clear());
document.getElementById('btn-export-log').addEventListener('click', () => terminal.exportText());

if (envCheck.supported) {
  navigator.usb.getDevices().then((devices) => {
    if (devices.length > 0) {
      log(
        'info',
        'USB',
        `${devices.length} previously authorized USB device(s) detected. Tap "Connect USB Device" to open a session.`
      );
    }
  });
}
