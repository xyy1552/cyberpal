import {
  DFU_REQUEST,
  DFU_STATUS_NAMES,
  DFU_STATE_NAMES
} from './usb-constants.js';

export class DFUDiagnostics {
  constructor(transport, onLog) {
    this.transport = transport;
    this.onLog = onLog || (() => {});
  }

  _interfaceIndex() {
    if (this.transport.claimedInterface === null) {
      throw new Error('DFU interface #0 is not claimed. Cannot execute class control transfers.');
    }
    return this.transport.claimedInterface;
  }

  async getStatus() {
    const t0 = performance.now();
    const data = await this.transport.controlIn(
      {
        requestType: 'class',
        recipient: 'interface',
        request: DFU_REQUEST.GETSTATUS,
        value: 0,
        index: this._interfaceIndex()
      },
      6
    );
    const rttMs = +(performance.now() - t0).toFixed(2);

    if (data.byteLength < 6) {
      throw new Error(`Expected 6 bytes from DFU_GETSTATUS, received ${data.byteLength}.`);
    }

    const bStatus = data.getUint8(0);
    const pollTimeoutMs =
      data.getUint8(1) | (data.getUint8(2) << 8) | (data.getUint8(3) << 16);
    const bState = data.getUint8(4);
    const iString = data.getUint8(5);

    const parsed = {
      bStatus,
      statusName: DFU_STATUS_NAMES[bStatus] || `0x${bStatus.toString(16)}`,
      pollTimeoutMs,
      bState,
      stateName: DFU_STATE_NAMES[bState] || `0x${bState.toString(16)}`,
      iString,
      rttMs
    };

    this.onLog(
      'ok',
      'DFU',
      `GETSTATUS -> status=0x${bStatus.toString(16).padStart(2, '0')} (${parsed.statusName}), state=${parsed.stateName}, pollTimeout=${pollTimeoutMs}ms (${rttMs}ms)`
    );
    return parsed;
  }

  async getState() {
    const t0 = performance.now();
    const data = await this.transport.controlIn(
      {
        requestType: 'class',
        recipient: 'interface',
        request: DFU_REQUEST.GETSTATE,
        value: 0,
        index: this._interfaceIndex()
      },
      1
    );
    const rttMs = +(performance.now() - t0).toFixed(2);

    if (data.byteLength < 1) {
      throw new Error('Expected 1 byte from DFU_GETSTATE, received 0.');
    }

    const bState = data.getUint8(0);
    const stateName = DFU_STATE_NAMES[bState] || `0x${bState.toString(16)}`;

    this.onLog(
      'ok',
      'DFU',
      `GETSTATE -> state=0x${bState.toString(16).padStart(2, '0')} (${stateName}) (${rttMs}ms)`
    );
    return { bState, stateName, rttMs };
  }

  async clearStatus() {
    const t0 = performance.now();
    await this.transport.controlOut({
      requestType: 'class',
      recipient: 'interface',
      request: DFU_REQUEST.CLRSTATUS,
      value: 0,
      index: this._interfaceIndex()
    });
    const rttMs = +(performance.now() - t0).toFixed(2);
    this.onLog('ok', 'DFU', `CLRSTATUS executed cleanly (${rttMs}ms).`);
    return { rttMs };
  }

  async abort() {
    const t0 = performance.now();
    await this.transport.controlOut({
      requestType: 'class',
      recipient: 'interface',
      request: DFU_REQUEST.ABORT,
      value: 0,
      index: this._interfaceIndex()
    });
    const rttMs = +(performance.now() - t0).toFixed(2);
    this.onLog('ok', 'DFU', `DFU_ABORT executed cleanly (${rttMs}ms).`);
    return { rttMs };
  }

  async benchmarkControlPipe(iterations = 5) {
    this.onLog('info', 'DIAG', `Running ${iterations}x USB EP0 control transfer RTT benchmark…`);
    const samples = [];
    for (let i = 0; i < iterations; i++) {
      const { rttMs } = await this.getState();
      samples.push(rttMs);
    }
    const min = Math.min(...samples).toFixed(2);
    const max = Math.max(...samples).toFixed(2);
    const avg = (samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(2);

    this.onLog('ok', 'DIAG', `EP0 Control RTT Benchmark -> min=${min}ms, avg=${avg}ms, max=${max}ms`);
    return { min, avg, max, samples };
  }
}
