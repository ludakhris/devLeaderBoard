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
const vscode = require("vscode");
const vscode_extension_telemetry_wrapper_1 = require("vscode-extension-telemetry-wrapper");
const TomcatController_1 = require("./Tomcat/TomcatController");
const TomcatModel_1 = require("./Tomcat/TomcatModel");
const TomcatSeverTreeProvider_1 = require("./TomcatSeverTreeProvider");
const Utility_1 = require("./Utility");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let storagePath = context.storagePath;
        yield vscode_extension_telemetry_wrapper_1.TelemetryWrapper.initilizeFromJsonFile(context.asAbsolutePath('package.json'));
        if (!storagePath) {
            storagePath = Utility_1.Utility.getTempStoragePath();
        }
        const tomcatModel = new TomcatModel_1.TomcatModel(storagePath);
        const tomcatServerTree = new TomcatSeverTreeProvider_1.TomcatSeverTreeProvider(context, tomcatModel);
        const tomcatController = new TomcatController_1.TomcatController(tomcatModel, context.extensionPath);
        context.subscriptions.push(tomcatController);
        context.subscriptions.push(tomcatServerTree);
        context.subscriptions.push(vscode.window.registerTreeDataProvider('tomcatServerExplorer', tomcatServerTree));
        context.subscriptions.push(registerCommandWrapper('tomcat.tree.refresh', (server) => tomcatServerTree.refresh(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.war.browse', (war) => tomcatController.browseWarPackage(war)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.rename', (server) => tomcatController.renameServer(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.add', () => tomcatController.addServer()));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.start', (server) => tomcatController.startServer(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.restart', (server) => tomcatController.stopOrRestartServer(server, true)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.stop', (server) => tomcatController.stopOrRestartServer(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.delete', (server) => tomcatController.deleteServer(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.browse', (server) => tomcatController.browseServer(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.debug', (server) => tomcatController.runOrDebugOnServer(undefined, true, server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.war.run', (uri) => tomcatController.runOrDebugOnServer(uri)));
        context.subscriptions.push(registerCommandWrapper('tomcat.war.debug', (uri) => tomcatController.runOrDebugOnServer(uri, true)));
        context.subscriptions.push(registerCommandWrapper('tomcat.webapp.run', (uri) => tomcatController.runOrDebugOnServer(uri)));
        context.subscriptions.push(registerCommandWrapper('tomcat.webapp.debug', (uri) => tomcatController.runOrDebugOnServer(uri, true)));
        context.subscriptions.push(registerCommandWrapper('tomcat.config.open', (server) => tomcatController.openServerConfig(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.war.delete', (warPackage) => tomcatController.deleteWarPackage(warPackage)));
        context.subscriptions.push(registerCommandWrapper('tomcat.war.reveal', (warPackage) => tomcatController.revealWarPackage(warPackage)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.customizejvmoptions', (server) => tomcatController.customizeJVMOptions(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.package', () => tomcatController.generateWarPackage()));
        // .context commands are duplicate for better naming the context commands and make it more clear and elegant
        context.subscriptions.push(registerCommandWrapper('tomcat.server.rename.context', (server) => tomcatController.renameServer(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.start.context', (server) => tomcatController.startServer(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.restart.context', (server) => tomcatController.stopOrRestartServer(server, true)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.stop.context', (server) => tomcatController.stopOrRestartServer(server)));
        context.subscriptions.push(registerCommandWrapper('tomcat.server.delete.context', (server) => tomcatController.deleteServer(server)));
    });
}
exports.activate = activate;
// tslint:disable no-any
function registerCommandWrapper(command, callback) {
    return vscode_extension_telemetry_wrapper_1.TelemetryWrapper.registerCommand(command, (param) => {
        Utility_1.Utility.initTelemetrySteps();
        callback(param);
    });
} // tslint:enable no-any
// tslint:disable-next-line:no-empty
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map