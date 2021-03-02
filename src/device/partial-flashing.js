/**
 * Implementation of partial flashing for the micro:bit.
 *
 * This could do with some love to make it easier to follow.
 */
import * as DAPjs from "dapjs";
import * as PartialFlashingUtils from "./partial-flashing-utils";

// NOTICE
//
// This file is made up of a combination of original code, along with code
// extracted from the following repositories:
//
// https://github.com/mmoskal/dapjs/tree/a32f11f54e9e76a9c61896ddd425c1cb1a29c143
// https://github.com/microsoft/pxt-microbit
//
// The pxt-microbit license is included below.

// PXT - Programming Experience Toolkit
//
// The MIT License (MIT)
//
// Copyright (c) Microsoft Corporation
//
// All rights reserved.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export class DAPWrapper {
  constructor(device) {
    this.reconnected = false;
    this.flashing = true;
    this.device = device;
    this.pageSize = null;
    this.numPages = null;
    this.allocDAP();
  }

  allocBoardID() {
    // The micro:bit board ID is the serial number first 4 hex digits
    if (!(this.device && this.device.serialNumber)) {
      throw new Error("Could not detected ID from connected board.");
    }
    this.boardId = this.device.serialNumber.substring(0, 4);
    PartialFlashingUtils.log("Detected board ID " + this.boardId);
  }

  allocDAP() {
    this.transport = new DAPjs.WebUSB(this.device);
    this.daplink = new DAPjs.DAPLink(this.transport);
    this.cortexM = new DAPjs.CortexM(this.transport);
  }

  // Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L119
  async reconnectAsync() {
    // Only fully reconnect after the first time this object has reconnected.
    if (!this.reconnected) {
      this.reconnected = true;
      this.allocDAP();
      await this.disconnectAsync();
    }
    await this.daplink.connect();
    await this.cortexM.connect();
    this.allocBoardID();
  }

  async disconnectAsync() {
    if (this.device.opened && this.transport.interfaceNumber !== undefined) {
      return this.daplink.disconnect();
    }
  }

  // Send a packet to the micro:bit directly via WebUSB and return the response.
  // Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/transport/cmsis_dap.ts#L161
  async send(packet) {
    const array = Uint8Array.from(packet);
    await this.transport.write(array.buffer);

    const response = await this.transport.read();
    return new Uint8Array(response.buffer);
  }

  // Send a command along with relevant data to the micro:bit directly via WebUSB and handle the response.
  // Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/transport/cmsis_dap.ts#L74
  async cmdNums(op, data) {
    data.unshift(op);

    const buf = await this.send(data);

    if (buf[0] !== op) {
      throw new Error(`Bad response for ${op} -> ${buf[0]}`);
    }

    switch (op) {
      case 0x02: // DapCmd.DAP_CONNECT:
      case 0x00: // DapCmd.DAP_INFO:
      case 0x05: // DapCmd.DAP_TRANSFER:
      case 0x06: // DapCmd.DAP_TRANSFER_BLOCK:
        break;
      default:
        if (buf[1] !== 0) {
          throw new Error(`Bad status for ${op} -> ${buf[1]}`);
        }
    }

    return buf;
  }

  // Read a certain register a specified amount of times.
  // Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/dap/dap.ts#L117
  async readRegRepeat(regId, cnt) {
    const request = PartialFlashingUtils.regRequest(regId);
    const sendargs = [0, cnt];

    for (let i = 0; i < cnt; ++i) {
      sendargs.push(request);
    }

    // Transfer the read requests to the micro:bit and retrieve the data read.
    const buf = await this.cmdNums(0x05 /* DapCmd.DAP_TRANSFER */, sendargs);

    if (buf[1] !== cnt) {
      throw new Error("(many) Bad #trans " + buf[1]);
    } else if (buf[2] !== 1) {
      throw new Error("(many) Bad transfer status " + buf[2]);
    }

    return buf.subarray(3, 3 + cnt * 4);
  }

  // Write to a certain register a specified amount of data.
  // Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/dap/dap.ts#L138
  async writeRegRepeat(regId, data) {
    const request = PartialFlashingUtils.regRequest(regId, true);
    const sendargs = [0, data.length, 0, request];

    data.forEach((d) => {
      // separate d into bytes
      sendargs.push(
        d & 0xff,
        (d >> 8) & 0xff,
        (d >> 16) & 0xff,
        (d >> 24) & 0xff
      );
    });

    // Transfer the write requests to the micro:bit and retrieve the response status.
    const buf = await this.cmdNums(0x06 /* DapCmd.DAP_TRANSFER */, sendargs);

    if (buf[3] !== 1) {
      throw new Error("(many-wr) Bad transfer status " + buf[2]);
    }
  }

  // Core functionality reading a block of data from micro:bit RAM at a specified address.
  // Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/memory/memory.ts#L181
  async readBlockCore(addr, words) {
    // Set up CMSIS-DAP to read/write from/to the RAM address addr using the register ApReg.DRW to write to or read from.
    await this.cortexM.writeAP(
      0x00 /* ApReg.CSW */,
      PartialFlashingUtils.CSW_VALUE /* Csw.CSW_VALUE */ |
        0x00000002 /* Csw.CSW_SIZE32 */
    );
    await this.cortexM.writeAP(0x04 /* ApReg.TAR */, addr);

    let lastSize = words % 15;
    if (lastSize === 0) {
      lastSize = 15;
    }

    const blocks = [];

    for (let i = 0; i < Math.ceil(words / 15); i++) {
      const b = await this.readRegRepeat(
        PartialFlashingUtils.apReg(
          0x0c /* ApReg.DRW */,
          1 << 1 /* DapVal.READ */
        ),
        i === blocks.length - 1 ? lastSize : 15
      );
      blocks.push(b);
    }

    return PartialFlashingUtils.bufferConcat(blocks).subarray(0, words * 4);
  }

  // Core functionality writing a block of data to micro:bit RAM at a specified address.
  // Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/memory/memory.ts#L205
  async writeBlockCore(addr, words) {
    try {
      // Set up CMSIS-DAP to read/write from/to the RAM address addr using the register ApReg.DRW to write to or read from.
      await this.cortexM.writeAP(
        0x00 /* ApReg.CSW */,
        PartialFlashingUtils.CSW_VALUE /* Csw.CSW_VALUE */ |
          0x00000002 /* Csw.CSW_SIZE32 */
      );
      await this.cortexM.writeAP(0x04 /* ApReg.TAR */, addr);

      await this.writeRegRepeat(
        PartialFlashingUtils.apReg(
          0x0c /* ApReg.DRW */,
          0 << 1 /* DapVal.WRITE */
        ),
        words
      );
    } catch (e) {
      if (e.dapWait) {
        // Retry after a delay if required.
        PartialFlashingUtils.log(`transfer wait, write block`);
        await new Promise((resolve) => setTimeout(resolve, 100));
        return await this.writeBlockCore(addr, words);
      } else {
        throw e;
      }
    }
  }

  // Reads a block of data from micro:bit RAM at a specified address.
  // Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/memory/memory.ts#L143
  async readBlockAsync(addr, words) {
    const bufs = [];
    const end = addr + words * 4;
    let ptr = addr;

    // Read a single page at a time.
    while (ptr < end) {
      let nextptr = ptr + this.pageSize;
      if (ptr === addr) {
        nextptr &= ~(this.pageSize - 1);
      }
      const len = Math.min(nextptr - ptr, end - ptr);
      bufs.push(await this.readBlockCore(ptr, len >> 2));
      ptr = nextptr;
    }
    const result = PartialFlashingUtils.bufferConcat(bufs);
    return result.subarray(0, words * 4);
  }

  // Writes a block of data to micro:bit RAM at a specified address.
  async writeBlockAsync(address, data) {
    let payloadSize = this.transport.packetSize - 8;
    if (data.buffer.byteLength > payloadSize) {
      let start = 0;
      let end = payloadSize;

      // Split write up into smaller writes whose data can each be held in a single packet.
      while (start != end) {
        let temp = new Uint32Array(data.buffer.slice(start, end));
        await this.writeBlockCore(address + start, temp);

        start = end;
        end = Math.min(data.buffer.byteLength, end + payloadSize);
      }
    } else {
      await this.writeBlockCore(address, data);
    }
  }

  // Execute code at a certain address with specified values in the registers.
  // Waits for execution to halt.
  async executeAsync(address, code, sp, pc, lr, ...registers) {
    if (registers.length > 12) {
      throw new Error(
        `Only 12 general purpose registers but got ${registers.length} values`
      );
    }

    await this.cortexM.halt(true);
    await this.writeBlockAsync(address, code);
    await this.cortexM.writeCoreRegister(
      PartialFlashingUtils.CoreRegister.PC,
      pc
    );
    await this.cortexM.writeCoreRegister(
      PartialFlashingUtils.CoreRegister.LR,
      lr
    );
    await this.cortexM.writeCoreRegister(
      PartialFlashingUtils.CoreRegister.SP,
      sp
    );
    for (let i = 0; i < registers.length; ++i) {
      await this.cortexM.writeCoreRegister(i, registers[i]);
    }
    await this.cortexM.resume(true);
    return this.waitForHalt();
  }

  // Checks whether the micro:bit has halted or timeout has been reached.
  // Recurses otherwise.
  async waitForHaltCore(halted, deadline) {
    if (new Date().getTime() > deadline) {
      throw new Error(PartialFlashingUtils.timeoutMessage);
    }
    if (!halted) {
      const isHalted = await this.cortexM.isHalted();
      // NB this is a Promise so no stack risk.
      return this.waitForHaltCore(isHalted, deadline);
    }
  }

  // Initial function to call to wait for the micro:bit halt.
  async waitForHalt(timeToWait = 10000) {
    const deadline = new Date().getTime() + timeToWait;
    return this.waitForHaltCore(false, deadline);
  }

  // Resets the micro:bit in software by writing to NVIC_AIRCR.
  // Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/cortex/cortex.ts#L347
  async softwareReset() {
    await this.cortexM.writeMem32(
      3758157068 /* NVIC_AIRCR */,
      100270080 /* NVIC_AIRCR_VECTKEY */ | 4 /* NVIC_AIRCR_SYSRESETREQ */
    );

    // wait for the system to come out of reset
    let dhcsr = await this.cortexM.readMem32(3758157296 /* DHCSR */);

    while ((dhcsr & 33554432) /* S_RESET_ST */ !== 0) {
      dhcsr = await this.cortexM.readMem32(3758157296 /* DHCSR */);
    }
  }

  // Reset the micro:bit, possibly halting the core on reset.
  // Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/cortex/cortex.ts#L248
  async reset(halt = false) {
    if (halt) {
      await this.cortexM.halt(true);

      let demcrAddr = 3758157308;

      // VC_CORERESET causes the core to halt on reset.
      const demcr = await this.cortexM.readMem32(demcrAddr);
      await this.cortexM.writeMem32(
        demcrAddr,
        demcr | 1 /* DEMCR_VC_CORERESET */
      );

      await this.softwareReset();
      await this.waitForHalt();

      // Unset the VC_CORERESET bit
      await this.cortexM.writeMem32(demcrAddr, demcr);
    } else {
      await this.softwareReset();
    }
  }
}

// Source code for binaries in can be found at https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/external/sha/source/main.c
// Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L243
// Update from https://github.com/microsoft/pxt-microbit/commit/a35057717222b8e48335144f497b55e29e9b0f25
// prettier-ignore
const flashPageBIN = new Uint32Array([
  0xbe00be00, // bkpt - LR is set to this
  0x2502b5f0, 0x4c204b1f, 0xf3bf511d, 0xf3bf8f6f, 0x25808f4f, 0x002e00ed,
  0x2f00595f, 0x25a1d0fc, 0x515800ed, 0x2d00599d, 0x2500d0fc, 0xf3bf511d,
  0xf3bf8f6f, 0x25808f4f, 0x002e00ed, 0x2f00595f, 0x2501d0fc, 0xf3bf511d,
  0xf3bf8f6f, 0x599d8f4f, 0xd0fc2d00, 0x25002680, 0x00f60092, 0xd1094295,
  0x511a2200, 0x8f6ff3bf, 0x8f4ff3bf, 0x2a00599a, 0xbdf0d0fc, 0x5147594f,
  0x2f00599f, 0x3504d0fc, 0x46c0e7ec, 0x4001e000, 0x00000504,
]);

// void computeHashes(uint32_t *dst, uint8_t *ptr, uint32_t pageSize, uint32_t numPages)
// Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L253
// prettier-ignore
const computeChecksums2 = new Uint32Array([
  0x4c27b5f0, 0x44a52680, 0x22009201, 0x91004f25, 0x00769303, 0x24080013,
  0x25010019, 0x40eb4029, 0xd0002900, 0x3c01407b, 0xd1f52c00, 0x468c0091,
  0xa9044665, 0x506b3201, 0xd1eb42b2, 0x089b9b01, 0x23139302, 0x9b03469c,
  0xd104429c, 0x2000be2a, 0x449d4b15, 0x9f00bdf0, 0x4d149e02, 0x49154a14,
  0x3e01cf08, 0x2111434b, 0x491341cb, 0x405a434b, 0x4663405d, 0x230541da,
  0x4b10435a, 0x466318d2, 0x230541dd, 0x4b0d435d, 0x2e0018ed, 0x6002d1e7,
  0x9a009b01, 0x18d36045, 0x93003008, 0xe7d23401, 0xfffffbec, 0xedb88320,
  0x00000414, 0x1ec3a6c8, 0x2f9be6cc, 0xcc9e2d51, 0x1b873593, 0xe6546b64,
]);

const membase = 0x20000000;
const loadAddr = membase;
const dataAddr = 0x20002000;
const stackAddr = 0x20001000;

export class PartialFlashing {
  // Returns a new DAPWrapper or reconnects a previously used one.
  // Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L161
  async dapAsync() {
    if (this.dapwrapper) {
      if (this.dapwrapper.device.opened) {
        // Always fully reconnect to handle device unplugged mid-session
        await this.dapwrapper.reconnectAsync(false);
        return this.dapwrapper;
      }
    }
    if (this.dapwrapper) {
      this.dapwrapper.disconnectAsync();
    }
    const device = await (async () => {
      if (this.dapwrapper && this.dapwrapper.device) {
        return this.dapwrapper.device;
      }
      return navigator.usb.requestDevice({
        filters: [{ vendorId: 0x0d28, productId: 0x0204 }],
      });
    })();
    this.dapwrapper = new DAPWrapper(device);
    await this.dapwrapper.reconnectAsync(true);
  }

  // Runs the checksum algorithm on the micro:bit's whole flash memory, and returns the results.
  // Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L365
  async getFlashChecksumsAsync() {
    await this.dapwrapper.executeAsync(
      loadAddr,
      computeChecksums2,
      stackAddr,
      loadAddr + 1,
      0xffffffff,
      dataAddr,
      0,
      this.dapwrapper.pageSize,
      this.dapwrapper.numPages
    );
    return this.dapwrapper.readBlockAsync(
      dataAddr,
      this.dapwrapper.numPages * 2
    );
  }

  // Runs the code on the micro:bit to copy a single page of data from RAM address addr to the ROM address specified by the page.
  // Does not wait for execution to halt.
  // Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L340
  async runFlash(page, addr) {
    await this.dapwrapper.cortexM.halt(true);
    await Promise.all([
      this.dapwrapper.cortexM.writeCoreRegister(
        PartialFlashingUtils.CoreRegister.PC,
        loadAddr + 4 + 1
      ),
      this.dapwrapper.cortexM.writeCoreRegister(
        PartialFlashingUtils.CoreRegister.LR,
        loadAddr + 1
      ),
      this.dapwrapper.cortexM.writeCoreRegister(
        PartialFlashingUtils.CoreRegister.SP,
        stackAddr
      ),
      this.dapwrapper.cortexM.writeCoreRegister(0, page.targetAddr),
      this.dapwrapper.cortexM.writeCoreRegister(1, addr),
      this.dapwrapper.cortexM.writeCoreRegister(
        2,
        this.dapwrapper.pageSize >> 2
      ),
    ]);
    return this.dapwrapper.cortexM.resume(false);
  }

  // Write a single page of data to micro:bit ROM by writing it to micro:bit RAM and copying to ROM.
  // Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L385
  async partialFlashPageAsync(page, nextPage, i) {
    // TODO: This short-circuits UICR, do we need to update this?
    if (page.targetAddr >= 0x10000000) {
      return;
    }

    // Use two slots in RAM to allow parallelisation of the following two tasks.
    // 1. DAPjs writes a page to one slot.
    // 2. flashPageBIN copies a page to flash from the other slot.
    let thisAddr = i & 1 ? dataAddr : dataAddr + this.dapwrapper.pageSize;
    let nextAddr = i & 1 ? dataAddr + this.dapwrapper.pageSize : dataAddr;

    // Write first page to slot in RAM.
    // All subsequent pages will have already been written to RAM.
    if (i == 0) {
      let u32data = new Uint32Array(page.data.length / 4);
      for (let j = 0; j < page.data.length; j += 4) {
        u32data[j >> 2] = PartialFlashingUtils.read32FromUInt8Array(
          page.data,
          j
        );
      }
      await this.dapwrapper.writeBlockAsync(thisAddr, u32data);
    }

    await this.runFlash(page, thisAddr);
    // Write next page to micro:bit RAM if it exists.
    if (nextPage) {
      let buf = new Uint32Array(nextPage.data.buffer);
      await this.dapwrapper.writeBlockAsync(nextAddr, buf);
    }
    return this.dapwrapper.waitForHalt();
  }

  // Write pages of data to micro:bit ROM.
  async partialFlashCoreAsync(pages, updateProgress) {
    PartialFlashingUtils.log("Partial flash");
    for (let i = 0; i < pages.length; ++i) {
      updateProgress(i / pages.length);
      await this.partialFlashPageAsync(pages[i], pages[i + 1], i);
    }
    updateProgress(1);
  }

  // Flash the micro:bit's ROM with the provided image by only copying over the pages that differ.
  // Falls back to a full flash if partial flashing fails.
  // Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L335
  async partialFlashAsync(flashBytes, hexBuffer, updateProgress) {
    const checksums = await this.getFlashChecksumsAsync();
    await this.dapwrapper.writeBlockAsync(loadAddr, flashPageBIN);
    let aligned = PartialFlashingUtils.pageAlignBlocks(
      flashBytes,
      0,
      this.dapwrapper.pageSize
    );
    const totalPages = aligned.length;
    PartialFlashingUtils.log("Total pages: " + totalPages);
    aligned = PartialFlashingUtils.onlyChanged(
      aligned,
      checksums,
      this.dapwrapper.pageSize
    );
    PartialFlashingUtils.log("Changed pages: " + aligned.length);
    if (aligned.length > totalPages / 2) {
      try {
        await this.fullFlashAsync(hexBuffer, updateProgress);
      } catch (e) {
        PartialFlashingUtils.log(e);
        PartialFlashingUtils.log(
          "Full flash failed, attempting partial flash."
        );
        await this.partialFlashCoreAsync(aligned, updateProgress);
      }
    } else {
      try {
        await this.partialFlashCoreAsync(aligned, updateProgress);
      } catch (e) {
        PartialFlashingUtils.log(e);
        PartialFlashingUtils.log(
          "Partial flash failed, attempting full flash."
        );
        await this.fullFlashAsync(hexBuffer, updateProgress);
      }
    }

    try {
      await this.dapwrapper.reset();
    } catch (e) {
      // Allow errors on resetting, user can always manually reset if necessary.
    }
    PartialFlashingUtils.log("Flashing Complete");
    this.dapwrapper.flashing = false;
  }

  // Perform full flash of micro:bit's ROM using daplink.
  async fullFlashAsync(image, updateProgress) {
    PartialFlashingUtils.log("Full flash");
    // Event to monitor flashing progress
    // TODO: surely we need to remove this?
    this.dapwrapper.daplink.on(DAPjs.DAPLink.EVENT_PROGRESS, (progress) => {
      updateProgress(progress, true);
    });
    await this.dapwrapper.transport.open();
    await this.dapwrapper.daplink.flash(image);
    // TODO: reinstate eventing
  }

  // Connect to the micro:bit using WebUSB and setup DAPWrapper.
  // Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L439
  async connectDapAsync() {
    if (this.dapwrapper) {
      this.dapwrapper.flashing = true;
      // TODO: Why?
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await this.dapAsync();
    PartialFlashingUtils.log("Connection Complete");
    this.dapwrapper.pageSize = await this.dapwrapper.cortexM.readMem32(
      PartialFlashingUtils.FICR.CODEPAGESIZE
    );
    this.dapwrapper.numPages = await this.dapwrapper.cortexM.readMem32(
      PartialFlashingUtils.FICR.CODESIZE
    );
    // This isn't what I expected. What about serial?
    return this.dapwrapper.disconnectAsync();
  }

  async disconnectDapAsync() {
    return this.dapwrapper.disconnectAsync();
  }

  // Flash the micro:bit's ROM with the provided image, resetting the micro:bit first.
  // Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L439
  async flashAsync(flashBytes, hexBuffer, updateProgress) {
    let resetPromise = (async () => {
      // Reset micro:bit to ensure interface responds correctly.
      PartialFlashingUtils.log("Begin reset");
      try {
        await this.dapwrapper.reset(true);
      } catch (e) {
        PartialFlashingUtils.log("Retrying reset");
        await this.dapwrapper.reconnectAsync(false);
        await this.dapwrapper.reset(true);
      }
    })();

    let timeout = new Promise((resolve) => {
      setTimeout(() => {
        resolve("timeout");
      }, 1000);
    });

    // Use race to timeout the reset.
    try {
      const result = await Promise.race([resetPromise, timeout]);
      if (result === "timeout") {
        PartialFlashingUtils.log("Resetting micro:bit timed out");
        PartialFlashingUtils.log(
          "Partial flashing failed. Attempting Full Flash"
        );
        await this.fullFlashAsync(hexBuffer, updateProgress);
      } else {
        PartialFlashingUtils.log("Begin Flashing");
        await this.partialFlashAsync(flashBytes, hexBuffer, updateProgress);
      }
    } finally {
      // NB cannot return Promises above!
      await this.dapwrapper.disconnectAsync();
    }
  }
}
