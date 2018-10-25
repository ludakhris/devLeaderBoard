'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fse = require("fs-extra");
const _ = require("lodash");
const path = require("path");
const vscode = require("vscode");
const Constants = require("../Constants");
const Utility_1 = require("../Utility");
const TomcatServer_1 = require("./TomcatServer");
class TomcatModel {
    constructor(defaultStoragePath) {
        this.defaultStoragePath = defaultStoragePath;
        this._serverList = [];
        this._serversJsonFile = path.join(defaultStoragePath, 'servers.json');
        this.initServerListSync();
        vscode.debug.onDidTerminateDebugSession((session) => {
            if (session && session.name && session.name.startsWith(Constants.DEBUG_SESSION_NAME)) {
                this.clearServerDebugInfo(session.name.split('_').pop());
            }
        });
    }
    getServerSet() {
        return this._serverList;
    }
    getTomcatServer(serverName) {
        return this._serverList.find((item) => item.getName() === serverName);
    }
    saveServerList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fse.outputJson(this._serversJsonFile, this._serverList.map((s) => {
                    return { _name: s.getName(), _installPath: s.getInstallPath(), _storagePath: s.getStoragePath() };
                }));
                vscode.commands.executeCommand('tomcat.tree.refresh');
            }
            catch (err) {
                console.error(err.toString());
            }
        });
    }
    updateJVMOptions(serverName) {
        return __awaiter(this, void 0, void 0, function* () {
            const server = this.getTomcatServer(serverName);
            const installPath = server.getInstallPath();
            const catalinaBase = server.getStoragePath();
            const bootStrap = path.join(installPath, 'bin', 'bootstrap.jar');
            const tomcat = path.join(installPath, 'bin', 'tomcat-juli.jar');
            let result = [
                `${Constants.CLASS_PATH_KEY} "${[bootStrap, tomcat].join(path.delimiter)}"`,
                `${Constants.CATALINA_BASE_KEY}="${catalinaBase}"`,
                `${Constants.CATALINA_HOME_KEY}="${installPath}"`,
                `${Constants.ENCODING}`
            ];
            if (!(yield fse.pathExists(server.jvmOptionFile))) {
                server.jvmOptions = result.concat([Constants.BOOTSTRAP_FILE, '"$@"']);
                return;
            }
            const filterFunction = (para) => {
                if (!para.startsWith('-')) {
                    return false;
                }
                let valid = true;
                Constants.JVM_DEFAULT_OPTIONS_KEYS.forEach((key) => {
                    if (para.startsWith(key)) {
                        valid = false;
                        return;
                    }
                });
                return valid;
            };
            result = result.concat(yield Utility_1.Utility.readFileLineByLine(server.jvmOptionFile, filterFunction));
            const tmpDirConfiguration = result.find((element) => {
                return element.indexOf(Constants.JAVA_IO_TEMP_DIR_KEY) >= 0;
            });
            if (!tmpDirConfiguration) {
                result = result.concat(`${Constants.JAVA_IO_TEMP_DIR_KEY}="${path.join(catalinaBase, 'temp')}"`);
            }
            server.jvmOptions = result.concat([Constants.BOOTSTRAP_FILE, '"$@"']);
        });
    }
    deleteServer(tomcatServer) {
        const index = this._serverList.findIndex((item) => item.getName() === tomcatServer.getName());
        if (index > -1) {
            const oldServer = this._serverList.splice(index, 1);
            if (!_.isEmpty(oldServer)) {
                fse.remove(tomcatServer.getStoragePath());
                this.saveServerList();
                return true;
            }
        }
        return false;
    }
    addServer(tomcatServer) {
        const index = this._serverList.findIndex((item) => item.getName() === tomcatServer.getName());
        if (index > -1) {
            this._serverList.splice(index, 1);
        }
        this._serverList.push(tomcatServer);
        this.saveServerList();
    }
    saveServerListSync() {
        try {
            fse.outputJsonSync(this._serversJsonFile, this._serverList.map((s) => {
                return { _name: s.getName(), _installPath: s.getInstallPath(), _storagePath: s.getStoragePath() };
            }));
        }
        catch (err) {
            console.error(err.toString());
        }
    }
    initServerListSync() {
        try {
            if (fse.existsSync(this._serversJsonFile)) {
                const objArray = fse.readJsonSync(this._serversJsonFile);
                if (!_.isEmpty(objArray)) {
                    this._serverList = this._serverList.concat(objArray.map((obj) => {
                        return new TomcatServer_1.TomcatServer(obj._name, obj._installPath, obj._storagePath);
                    }));
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    clearServerDebugInfo(basePathName) {
        const server = this._serverList.find((s) => { return s.basePathName === basePathName; });
        if (server) {
            server.clearDebugInfo();
        }
    }
}
exports.TomcatModel = TomcatModel;
//# sourceMappingURL=TomcatModel.js.map