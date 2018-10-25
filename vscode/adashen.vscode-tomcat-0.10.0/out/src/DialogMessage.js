'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const localize_1 = require("./localize");
var DialogMessage;
(function (DialogMessage) {
    DialogMessage.yes = { title: localize_1.localize('tomcatExt.yes', 'Yes') };
    DialogMessage.no = { title: localize_1.localize('tomcatExt.no', 'No'), isCloseAffordance: true };
    DialogMessage.cancel = { title: localize_1.localize('tomcatExt.cancel', 'Cancel'), isCloseAffordance: true };
    DialogMessage.never = { title: localize_1.localize('tomcatExt.never', 'Never') };
    DialogMessage.moreInfo = { title: localize_1.localize('tomcatExt.moreInfo', 'More Info') };
    DialogMessage.selectServer = localize_1.localize('tomcatExt.selectServer', 'Select Tomcat Server');
    DialogMessage.addServer = localize_1.localize('tomcatExt.addServer', 'Add New Server');
    DialogMessage.noServer = localize_1.localize('tomcatExt.noServer', 'There are no Tomcat Servers.');
    DialogMessage.noPackage = localize_1.localize('tomcatExt.noPackage', 'The selected package is not under current workspace.');
    DialogMessage.noServerConfig = localize_1.localize('tomcatExt.noServerConfig', 'The Tomcat Server is broken. It does not have server.xml');
    DialogMessage.selectWarPackage = localize_1.localize('tomcatExt.selectWarPackage', 'Select War Package');
    DialogMessage.selectDirectory = localize_1.localize('tomcatExt.selectDirectory', 'Select Tomcat Directory');
    DialogMessage.deleteConfirm = localize_1.localize('tomcatExt.deleteConfirm', 'This Tomcat Server is running, are you sure you want to delete it?');
    DialogMessage.serverRunning = localize_1.localize('tomcatExt.serverRunning', 'This Tomcat Server is already started.');
    DialogMessage.serverStopped = localize_1.localize('tomcatExt.serverStopped', 'This Tomcat Server was stopped.');
    DialogMessage.startServer = localize_1.localize('tomcatExt.startServer', 'The Tomcat server needs to be started before browsing. Would you like to start it now?');
    DialogMessage.invalidWebappFolder = localize_1.localize('tomcatExt.invalidWebappFolder', 'The folder is not a valid web app to run on Tomcat Server.');
    DialogMessage.invalidWarFile = localize_1.localize('tomcatExt.invalidWarFile', 'Please select a .war file.');
    DialogMessage.pickFolderToGenerateWar = localize_1.localize('tomcatExt.pickFolderToGenerateWar', 'Please select the folder(s) you want to generate war package');
    function getServerPortChangeErrorMessage(serverName, serverPort) {
        return localize_1.localize('tomcatExt.serverPortChangeError', 'Changing the server port of a running server {0} will cause it unable to shutdown. Would you like to change it back to {1}?', serverName, serverPort);
    }
    DialogMessage.getServerPortChangeErrorMessage = getServerPortChangeErrorMessage;
    function getConfigChangedMessage(serverName) {
        return localize_1.localize('tomcatExt.configChanged', 'server.xml of running server {0} has been changed. Would you like to restart it?', serverName);
    }
    DialogMessage.getConfigChangedMessage = getConfigChangedMessage;
    function getWarGeneratedInfo(count) {
        return localize_1.localize('tomcatExt.warGenerated', '{0} war package(s) was generated.', count);
    }
    DialogMessage.getWarGeneratedInfo = getWarGeneratedInfo;
})(DialogMessage = exports.DialogMessage || (exports.DialogMessage = {}));
//# sourceMappingURL=DialogMessage.js.map