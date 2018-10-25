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
const Constants = require("./Constants");
const Constants_1 = require("./Constants");
const WarPackage_1 = require("./Tomcat/WarPackage");
class TomcatSeverTreeProvider {
    constructor(_context, _tomcatModel) {
        this._context = _context;
        this._tomcatModel = _tomcatModel;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return __awaiter(this, void 0, void 0, function* () {
            return element;
        });
    }
    refresh(element) {
        this._onDidChangeTreeData.fire(element);
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!element) {
                return this._tomcatModel.getServerSet().map((server) => {
                    server.iconPath = this._context.asAbsolutePath(path.join('resources', `${server.getState()}.svg`));
                    server.contextValue = server.getState();
                    server.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
                    return server;
                });
            }
            else if (element.contextValue === Constants_1.ServerState.IdleServer || element.contextValue === Constants_1.ServerState.RunningServer) {
                const server = element;
                const webapps = path.join(server.getStoragePath(), 'webapps');
                const iconPath = this._context.asAbsolutePath(path.join('resources', 'war.jpg'));
                if (yield fse.pathExists(webapps)) {
                    const wars = [];
                    let temp;
                    let fileExtension;
                    // show war packages with no extension if there is one
                    // and no need to show war packages if its unzipped folder exists
                    const promises = (yield fse.readdir(webapps)).map((w) => __awaiter(this, void 0, void 0, function* () {
                        if (w.toUpperCase() !== 'ROOT') {
                            temp = yield fse.stat(path.join(webapps, w));
                            fileExtension = path.extname(path.join(webapps, w));
                            if (temp.isDirectory() || (temp.isFile() && fileExtension === Constants.WAR_FILE_EXTENSION)) {
                                wars.push(fileExtension === Constants.WAR_FILE_EXTENSION ? path.basename(w, fileExtension) : w);
                            }
                        }
                    }));
                    yield Promise.all(promises);
                    // tslint:disable-next-line:underscore-consistent-invocation
                    return _.uniq(wars).map((w) => {
                        return new WarPackage_1.WarPackage(w, server.getName(), iconPath, path.join(webapps, w));
                    });
                }
                return [];
            }
        });
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
}
exports.TomcatSeverTreeProvider = TomcatSeverTreeProvider;
//# sourceMappingURL=TomcatSeverTreeProvider.js.map