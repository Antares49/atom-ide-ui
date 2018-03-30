/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {Command} from './Command';
import type {DebuggerInterface} from './DebuggerInterface';

export default class BreakpointDisableCommand implements Command {
  name = 'disable';
  helpText = '[index]: temporarily disables a breakpoint.';

  _debugger: DebuggerInterface;

  constructor(debug: DebuggerInterface) {
    this._debugger = debug;
  }

  async execute(args: string[]): Promise<void> {
    let index = -1;

    if (args.length !== 1 || isNaN((index = parseInt(args[0], 10)))) {
      throw new Error("Format is 'breakpoint disable index'");
    }

    await this._debugger.setBreakpointEnabled(index, false);
  }
}
