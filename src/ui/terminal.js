export class TelemetryTerminal {
  constructor(containerEl) {
    this.container = containerEl;
    this.entries = [];
  }

  log(level, tag, message) {
    const now = new Date();
    const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const entry = { ts, level, tag, message };
    this.entries.push(entry);

    const line = document.createElement('div');
    line.className = `log-line log-${level}`;

    const tsSpan = document.createElement('span');
    tsSpan.className = 'log-ts';
    tsSpan.textContent = `[${ts}]`;

    const tagSpan = document.createElement('span');
    tagSpan.className = 'log-tag';
    tagSpan.textContent = `[${tag}]`;

    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;

    line.append(tsSpan, tagSpan, msgSpan);
    this.container.appendChild(line);
    this.container.scrollTop = this.container.scrollHeight;
  }

  clear() {
    this.entries = [];
    this.container.innerHTML = '';
    this.log('info', 'SYS', 'Terminal buffer cleared.');
  }

  exportText() {
    const content = this.entries
      .map((e) => `[${e.ts}] [${e.level.toUpperCase()}] [${e.tag}] ${e.message}`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberpal-usb-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
