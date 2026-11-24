# CyberPal — iOS WebUSB DFU & Recovery Diagnostic Utility

CyberPal is a 100% client-side, static WebUSB diagnostic utility designed for Android Chrome (via USB OTG) and desktop Chromium browsers. It inspects real Apple USB descriptors, detects DFU (`05AC:1227`), Port DFU (`05AC:F014`), and Recovery (`05AC:1281`) modes, parses Apple hardware serial tags (`CPID`, `BDID`, `ECID`, `SRTG`), and executes safe USB-IF DFU 1.1 diagnostic transfers.

## Capabilities
- **Real WebUSB Enumeration:** Direct connection via `navigator.usb.requestDevice()`.
- **Hardware & Mode Identification:** Parses Apple SecureROM/iBoot `serialNumber` strings and resolves public `libirecovery` CPID/BDID hardware mappings.
- **Safe DFU 1.1 Diagnostics:** Supports `DFU_GETSTATUS (0x03)`, `DFU_GETSTATE (0x05)`, `DFU_CLRSTATUS (0x04)`, `DFU_ABORT (0x06)`, EP0 control-pipe RTT benchmarking, and USB bus reset.
- **Zero Backend:** Static Vite build deployable directly to GitHub Pages over HTTPS.

## Deployment
1. Push this repository to GitHub on the `main` branch.
2. Go to **Settings -> Pages** and set **Source** to **GitHub Actions**.
3. Open the deployed HTTPS URL in **Android Chrome** and connect your iPhone via USB OTG.
