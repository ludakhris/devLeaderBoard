"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const os = require("os");
const vscode_1 = require("vscode");
var VSCodeUI;
(function (VSCodeUI) {
    const terminals = {};
    function runInTerminal(command, options) {
        const defaultOptions = { addNewLine: true, name: "default" };
        const { addNewLine, name, cwd } = Object.assign(defaultOptions, options);
        if (terminals[name] === undefined) {
            terminals[name] = vscode_1.window.createTerminal({ name });
        }
        terminals[name].show();
        if (cwd) {
            terminals[name].sendText(getCDCommand(cwd), true);
        }
        terminals[name].sendText(getCommand(command), addNewLine);
    }
    VSCodeUI.runInTerminal = runInTerminal;
    function getCommand(cmd) {
        if (os.platform() === "win32") {
            const windowsShell = vscode_1.workspace.getConfiguration("terminal").get("integrated.shell.windows")
                .toLowerCase();
            if (windowsShell && windowsShell.indexOf("powershell.exe") > -1) {
                return `& ${cmd}`; // PowerShell
            }
            else {
                return cmd; // others, try using common one.
            }
        }
        else {
            return cmd;
        }
    }
    VSCodeUI.getCommand = getCommand;
    function getCDCommand(cwd) {
        if (os.platform() === "win32") {
            const windowsShell = vscode_1.workspace.getConfiguration("terminal").get("integrated.shell.windows")
                .toLowerCase();
            if (windowsShell && windowsShell.indexOf("bash.exe") > -1 && windowsShell.indexOf("git") > -1) {
                return `cd "${cwd.replace(/\\+$/, "")}"`; // Git Bash: remove trailing '\'
            }
            else if (windowsShell && windowsShell.indexOf("powershell.exe") > -1) {
                return `cd "${cwd}"`; // PowerShell
            }
            else if (windowsShell && windowsShell.indexOf("cmd.exe") > -1) {
                return `cd /d "${cwd}"`; // CMD
            }
            else {
                return `cd "${cwd}"`; // Unknown, try using common one.
            }
        }
        else {
            return `cd "${cwd}"`;
        }
    }
    VSCodeUI.getCDCommand = getCDCommand;
    function onDidCloseTerminal(closedTerminal) {
        delete terminals[closedTerminal.name];
    }
    VSCodeUI.onDidCloseTerminal = onDidCloseTerminal;
    function openDialogForFolder(customOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false
            };
            const result = yield vscode_1.window.showOpenDialog(Object.assign(options, customOptions));
            if (result && result.length) {
                return Promise.resolve(result[0]);
            }
            else {
                return Promise.resolve(null);
            }
        });
    }
    VSCodeUI.openDialogForFolder = openDialogForFolder;
    function openDialogForFile(customOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false
            };
            const result = yield vscode_1.window.showOpenDialog(Object.assign(options, customOptions));
            if (result && result.length) {
                return Promise.resolve(result[0]);
            }
            else {
                return Promise.resolve(null);
            }
        });
    }
    VSCodeUI.openDialogForFile = openDialogForFile;
    function openFileIfExists(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield fs.pathExists(filepath)) {
                vscode_1.window.showTextDocument(vscode_1.Uri.file(filepath), { preview: false });
            }
        });
    }
    VSCodeUI.openFileIfExists = openFileIfExists;
    function getQuickPick(itemsSource, labelfunc, descfunc, detailfunc, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemWrappersPromise = new Promise((resolve, _reject) => __awaiter(this, void 0, void 0, function* () {
                const ret = (yield itemsSource).map((item) => Object.assign({}, {
                    description: (detailfunc && descfunc(item)),
                    detail: (detailfunc && detailfunc(item)),
                    label: (labelfunc && labelfunc(item)),
                    value: item
                }));
                resolve(ret);
            }));
            const selected = yield vscode_1.window.showQuickPick(itemWrappersPromise, Object.assign({ ignoreFocusOut: true }, options));
            return selected && selected.value;
        });
    }
    VSCodeUI.getQuickPick = getQuickPick;
    function getFromInputBox(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield vscode_1.window.showInputBox(Object.assign({ ignoreFocusOut: true }, options));
        });
    }
    VSCodeUI.getFromInputBox = getFromInputBox;
})(VSCodeUI = exports.VSCodeUI || (exports.VSCodeUI = {}));
//# sourceMappingURL=VSCodeUI.js.map