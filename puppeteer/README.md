Puppeteer in non-headless mode can be configured with a normal profile which
can contain WebUSB approvals. We use this to test the app with a connected
device.

Most tests still run in headless mode. We just use this scenario for flash
and serial tests.
