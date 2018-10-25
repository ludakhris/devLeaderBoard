'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const Constants = require("../Constants");
const Constants_1 = require("../Constants");
class TomcatServer extends vscode.TreeItem {
    constructor(_name, _installPath, _storagePath) {
        super(_name);
        this._name = _name;
        this._installPath = _installPath;
        this._storagePath = _storagePath;
        this.needRestart = false;
        this._state = Constants_1.ServerState.IdleServer;
        this._isDebugging = false;
        this.label = _name;
        this.jvmOptionFile = path.join(_storagePath, Constants.JVM_OPTION_FILE);
        this._configurationPath = path.join(_storagePath, 'conf', 'server.xml');
        this.basePathName = path.basename(_storagePath);
    }
    setDebugInfo(port, workspace) {
        this._isDebugging = true;
        this._debugPort = port;
        this._debugWorkspace = workspace;
    }
    clearDebugInfo() {
        this._isDebugging = false;
        this._debugPort = undefined;
        this._debugWorkspace = undefined;
    }
    getDebugPort() {
        return this._debugPort;
    }
    getDebugWorkspace() {
        return this._debugWorkspace;
    }
    isDebugging() {
        return this._isDebugging;
    }
    setStarted(started) {
        this._state = started ? Constants_1.ServerState.RunningServer : Constants_1.ServerState.IdleServer;
        vscode.commands.executeCommand('tomcat.tree.refresh');
    }
    isStarted() {
        return this._state === Constants_1.ServerState.RunningServer;
    }
    getState() {
        return this._state;
    }
    getName() {
        return this._name;
    }
    rename(newName) {
        this._name = newName;
        this.label = newName;
    }
    getInstallPath() {
        return this._installPath;
    }
    getServerConfigPath() {
        return this._configurationPath;
    }
    getStoragePath() {
        return this._storagePath;
    }
}
exports.TomcatServer = TomcatServer;
//# sourceMappingURL=TomcatServer.js.map