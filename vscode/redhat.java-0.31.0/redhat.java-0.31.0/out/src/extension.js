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
const path = require("path");
const os = require("os");
const fs = require("fs");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const plugin_1 = require("./plugin");
const javaServerStarter_1 = require("./javaServerStarter");
const requirements = require("./requirements");
const commands_1 = require("./commands");
const protocol_1 = require("./protocol");
let oldConfig;
let lastStatus;
let languageClient;
function activate(context) {
    enableJavadocSymbols();
    return requirements.resolveRequirements().catch(error => {
        //show error
        vscode_1.window.showErrorMessage(error.message, error.label).then((selection) => {
            if (error.label && error.label === selection && error.openUrl) {
                vscode_1.commands.executeCommand(commands_1.Commands.OPEN_BROWSER, error.openUrl);
            }
        });
        // rethrow to disrupt the chain.
        throw error;
    }).then(requirements => {
        return vscode_1.window.withProgress({ location: vscode_1.ProgressLocation.Window }, p => {
            return new Promise((resolve, reject) => {
                let storagePath = context.storagePath;
                if (!storagePath) {
                    storagePath = getTempWorkspace();
                }
                let workspacePath = path.resolve(storagePath + '/jdt_ws');
                // Options to control the language client
                let clientOptions = {
                    // Register the server for java
                    documentSelector: [
                        { scheme: 'file', language: 'java' },
                        { scheme: 'jdt', language: 'java' },
                        { scheme: 'untitled', language: 'java' }
                    ],
                    synchronize: {
                        configurationSection: 'java',
                        // Notify the server about file changes to .java and project/build files contained in the workspace
                        fileEvents: [
                            vscode_1.workspace.createFileSystemWatcher('**/*.java'),
                            vscode_1.workspace.createFileSystemWatcher('**/pom.xml'),
                            vscode_1.workspace.createFileSystemWatcher('**/*.gradle'),
                            vscode_1.workspace.createFileSystemWatcher('**/.project'),
                            vscode_1.workspace.createFileSystemWatcher('**/.classpath'),
                            vscode_1.workspace.createFileSystemWatcher('**/settings/*.prefs'),
                            vscode_1.workspace.createFileSystemWatcher('**/src/**')
                        ],
                    },
                    initializationOptions: {
                        bundles: plugin_1.collectionJavaExtensions(vscode_1.extensions.all),
                        workspaceFolders: vscode_1.workspace.workspaceFolders ? vscode_1.workspace.workspaceFolders.map(f => f.uri.toString()) : null,
                        settings: { java: getJavaConfiguration() },
                        extendedClientCapabilities: {
                            progressReportProvider: getJavaConfiguration().get('progressReports.enabled'),
                            classFileContentsSupport: true
                        }
                    },
                    revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never
                };
                let item = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, Number.MIN_VALUE);
                item.text = '$(rocket)';
                item.command = commands_1.Commands.OPEN_OUTPUT;
                let progressBar = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left, Number.MIN_VALUE + 1);
                oldConfig = getJavaConfiguration();
                let serverOptions;
                let port = process.env['SERVER_PORT'];
                if (!port) {
                    serverOptions = javaServerStarter_1.prepareExecutable(requirements, workspacePath, getJavaConfiguration());
                }
                else {
                    // used during development
                    serverOptions = javaServerStarter_1.awaitServerConnection.bind(null, port);
                }
                // Create the language client and start the client.
                languageClient = new vscode_languageclient_1.LanguageClient('java', 'Language Support for Java', serverOptions, clientOptions);
                languageClient.registerProposedFeatures();
                languageClient.onReady().then(() => {
                    languageClient.onNotification(protocol_1.StatusNotification.type, (report) => {
                        switch (report.type) {
                            case 'Started':
                                item.text = '$(thumbsup)';
                                p.report({ message: 'Finished' });
                                lastStatus = item.text;
                                resolve({
                                    apiVersion: '0.1',
                                    javaRequirement: requirements,
                                });
                                break;
                            case 'Error':
                                item.text = '$(thumbsdown)';
                                lastStatus = item.text;
                                p.report({ message: 'Finished with Error' });
                                item.tooltip = report.message;
                                toggleItem(vscode_1.window.activeTextEditor, item);
                                resolve({
                                    apiVersion: '0.1',
                                    javaRequirement: requirements,
                                });
                                break;
                            case 'Starting':
                                p.report({ message: report.message });
                                item.tooltip = report.message;
                                break;
                            case 'Message':
                                item.text = report.message;
                                setTimeout(() => { item.text = lastStatus; }, 3000);
                                break;
                        }
                        item.tooltip = report.message;
                        toggleItem(vscode_1.window.activeTextEditor, item);
                    });
                    languageClient.onNotification(protocol_1.ProgressReportNotification.type, (progress) => {
                        progressBar.show();
                        progressBar.text = progress.status;
                        if (progress.complete) {
                            setTimeout(() => { progressBar.hide(); }, 500);
                        }
                    });
                    languageClient.onNotification(protocol_1.ActionableNotification.type, (notification) => {
                        let show = null;
                        switch (notification.severity) {
                            case protocol_1.MessageType.Log:
                                show = logNotification;
                                break;
                            case protocol_1.MessageType.Info:
                                show = vscode_1.window.showInformationMessage;
                                break;
                            case protocol_1.MessageType.Warning:
                                show = vscode_1.window.showWarningMessage;
                                break;
                            case protocol_1.MessageType.Error:
                                show = vscode_1.window.showErrorMessage;
                                break;
                        }
                        if (!show) {
                            return;
                        }
                        const titles = notification.commands.map(a => a.title);
                        show(notification.message, ...titles).then((selection) => {
                            for (let action of notification.commands) {
                                if (action.title === selection) {
                                    let args = (action.arguments) ? action.arguments : [];
                                    vscode_1.commands.executeCommand(action.command, ...args);
                                    break;
                                }
                            }
                        });
                    });
                    languageClient.onRequest(protocol_1.ExecuteClientCommandRequest.type, (params) => {
                        return vscode_1.commands.executeCommand(params.command, ...params.arguments);
                    });
                    languageClient.onRequest(protocol_1.SendNotificationRequest.type, (params) => {
                        return vscode_1.commands.executeCommand(params.command, ...params.arguments);
                    });
                    vscode_1.commands.registerCommand(commands_1.Commands.OPEN_OUTPUT, () => {
                        languageClient.outputChannel.show(vscode_1.ViewColumn.Three);
                    });
                    vscode_1.commands.registerCommand(commands_1.Commands.SHOW_JAVA_REFERENCES, (uri, position, locations) => {
                        vscode_1.commands.executeCommand(commands_1.Commands.SHOW_REFERENCES, vscode_1.Uri.parse(uri), languageClient.protocol2CodeConverter.asPosition(position), locations.map(languageClient.protocol2CodeConverter.asLocation));
                    });
                    vscode_1.commands.registerCommand(commands_1.Commands.SHOW_JAVA_IMPLEMENTATIONS, (uri, position, locations) => {
                        vscode_1.commands.executeCommand(commands_1.Commands.SHOW_REFERENCES, vscode_1.Uri.parse(uri), languageClient.protocol2CodeConverter.asPosition(position), locations.map(languageClient.protocol2CodeConverter.asLocation));
                    });
                    vscode_1.commands.registerCommand(commands_1.Commands.CONFIGURATION_UPDATE, uri => projectConfigurationUpdate(languageClient, uri));
                    vscode_1.commands.registerCommand(commands_1.Commands.IGNORE_INCOMPLETE_CLASSPATH, (data) => setIncompleteClasspathSeverity('ignore'));
                    vscode_1.commands.registerCommand(commands_1.Commands.IGNORE_INCOMPLETE_CLASSPATH_HELP, (data) => {
                        vscode_1.commands.executeCommand(commands_1.Commands.OPEN_BROWSER, vscode_1.Uri.parse('https://github.com/redhat-developer/vscode-java/wiki/%22Classpath-is-incomplete%22-warning'));
                    });
                    vscode_1.commands.registerCommand(commands_1.Commands.PROJECT_CONFIGURATION_STATUS, (uri, status) => setProjectConfigurationUpdate(languageClient, uri, status));
                    vscode_1.commands.registerCommand(commands_1.Commands.APPLY_WORKSPACE_EDIT, (obj) => {
                        applyWorkspaceEdit(obj, languageClient);
                    });
                    vscode_1.commands.registerCommand(commands_1.Commands.EDIT_ORGANIZE_IMPORTS, () => __awaiter(this, void 0, void 0, function* () {
                        let activeEditor = vscode_1.window.activeTextEditor;
                        if (!activeEditor || !activeEditor.document || activeEditor.document.languageId !== 'java') {
                            return;
                        }
                        if (activeEditor.document.uri instanceof vscode_1.Uri) {
                            yield vscode_1.commands.executeCommand(commands_1.Commands.EXECUTE_WORKSPACE_COMMAND, commands_1.Commands.EDIT_ORGANIZE_IMPORTS, activeEditor.document.uri.toString());
                        }
                    }));
                    vscode_1.commands.registerCommand(commands_1.Commands.EXECUTE_WORKSPACE_COMMAND, (command, ...rest) => {
                        const params = {
                            command,
                            arguments: rest
                        };
                        return languageClient.sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, params);
                    });
                    vscode_1.commands.registerCommand(commands_1.Commands.COMPILE_WORKSPACE, (isFullCompile) => {
                        return vscode_1.window.withProgress({ location: vscode_1.ProgressLocation.Window }, (p) => __awaiter(this, void 0, void 0, function* () {
                            if (typeof isFullCompile !== 'boolean') {
                                const selection = yield vscode_1.window.showQuickPick(['Incremental', 'Full'], { 'placeHolder': 'please choose compile type:' });
                                isFullCompile = selection !== 'Incremental';
                            }
                            p.report({ message: 'Compiling workspace...' });
                            const start = new Date().getTime();
                            const res = yield languageClient.sendRequest(protocol_1.CompileWorkspaceRequest.type, isFullCompile);
                            const elapsed = new Date().getTime() - start;
                            const humanVisibleDelay = elapsed < 1000 ? 1000 : 0;
                            return new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    if (res === protocol_1.CompileWorkspaceStatus.SUCCEED) {
                                        resolve(res);
                                    }
                                    else {
                                        reject(res);
                                    }
                                }, humanVisibleDelay);
                            });
                        }));
                    });
                    vscode_1.window.onDidChangeActiveTextEditor((editor) => {
                        toggleItem(editor, item);
                    });
                    let provider = {
                        onDidChange: null,
                        provideTextDocumentContent: (uri, token) => {
                            return languageClient.sendRequest(protocol_1.ClassFileContentsRequest.type, { uri: uri.toString() }, token).then((v) => {
                                return v || '';
                            });
                        }
                    };
                    vscode_1.workspace.registerTextDocumentContentProvider('jdt', provider);
                });
                languageClient.start();
                // Register commands here to make it available even when the language client fails
                vscode_1.commands.registerCommand(commands_1.Commands.OPEN_SERVER_LOG, () => openServerLogFile(workspacePath));
                let extensionPath = context.extensionPath;
                vscode_1.commands.registerCommand(commands_1.Commands.OPEN_FORMATTER, () => __awaiter(this, void 0, void 0, function* () { return openFormatter(extensionPath); }));
                context.subscriptions.push(onConfigurationChange());
                toggleItem(vscode_1.window.activeTextEditor, item);
            });
        });
    });
}
exports.activate = activate;
function deactivate() {
    if (!languageClient) {
        return undefined;
    }
    return languageClient.stop();
}
exports.deactivate = deactivate;
function enableJavadocSymbols() {
    // Let's enable Javadoc symbols autocompletion, shamelessly copied from MIT licensed code at
    // https://github.com/Microsoft/vscode/blob/9d611d4dfd5a4a101b5201b8c9e21af97f06e7a7/extensions/typescript/src/typescriptMain.ts#L186
    vscode_1.languages.setLanguageConfiguration('java', {
        indentationRules: {
            // ^(.*\*/)?\s*\}.*$
            decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
            // ^.*\{[^}"']*$
            increaseIndentPattern: /^.*\{[^}"']*$/
        },
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
        onEnterRules: [
            {
                // e.g. /** | */
                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                afterText: /^\s*\*\/$/,
                action: { indentAction: vscode_1.IndentAction.IndentOutdent, appendText: ' * ' }
            },
            {
                // e.g. /** ...|
                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: ' * ' }
            },
            {
                // e.g.  * ...|
                beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                action: { indentAction: vscode_1.IndentAction.None, appendText: '* ' }
            },
            {
                // e.g.  */|
                beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                action: { indentAction: vscode_1.IndentAction.None, removeText: 1 }
            },
            {
                // e.g.  *-----*/|
                beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
                action: { indentAction: vscode_1.IndentAction.None, removeText: 1 }
            }
        ]
    });
}
function logNotification(message, ...items) {
    return new Promise((resolve, reject) => {
        console.log(message);
    });
}
function setIncompleteClasspathSeverity(severity) {
    const config = getJavaConfiguration();
    const section = 'errors.incompleteClasspath.severity';
    config.update(section, severity, true).then(() => console.log(section + ' globally set to ' + severity), (error) => console.log(error));
}
function projectConfigurationUpdate(languageClient, uri) {
    let resource = uri;
    if (!(resource instanceof vscode_1.Uri)) {
        if (vscode_1.window.activeTextEditor) {
            resource = vscode_1.window.activeTextEditor.document.uri;
        }
    }
    if (!resource) {
        return vscode_1.window.showWarningMessage('No Java project to update!').then(() => false);
    }
    if (isJavaConfigFile(resource.path)) {
        languageClient.sendNotification(protocol_1.ProjectConfigurationUpdateRequest.type, {
            uri: resource.toString()
        });
    }
}
function setProjectConfigurationUpdate(languageClient, uri, status) {
    const config = getJavaConfiguration();
    const section = 'configuration.updateBuildConfiguration';
    const st = protocol_1.FeatureStatus[status];
    config.update(section, st).then(() => console.log(section + ' set to ' + st), (error) => console.log(error));
    if (status !== protocol_1.FeatureStatus.disabled) {
        projectConfigurationUpdate(languageClient, uri);
    }
}
function toggleItem(editor, item) {
    if (editor && editor.document &&
        (editor.document.languageId === 'java' || isJavaConfigFile(editor.document.uri.path))) {
        item.show();
    }
    else {
        item.hide();
    }
}
function isJavaConfigFile(path) {
    return path.endsWith('pom.xml') || path.endsWith('.gradle');
}
function onConfigurationChange() {
    return vscode_1.workspace.onDidChangeConfiguration(params => {
        let newConfig = getJavaConfiguration();
        if (hasJavaConfigChanged(oldConfig, newConfig)) {
            let msg = 'Java Language Server configuration changed, please restart VS Code.';
            let action = 'Restart Now';
            let restartId = commands_1.Commands.RELOAD_WINDOW;
            oldConfig = newConfig;
            vscode_1.window.showWarningMessage(msg, action).then((selection) => {
                if (action === selection) {
                    vscode_1.commands.executeCommand(restartId);
                }
            });
        }
    });
}
function hasJavaConfigChanged(oldConfig, newConfig) {
    return hasConfigKeyChanged('home', oldConfig, newConfig)
        || hasConfigKeyChanged('jdt.ls.vmargs', oldConfig, newConfig)
        || hasConfigKeyChanged('progressReports.enabled', oldConfig, newConfig);
}
function hasConfigKeyChanged(key, oldConfig, newConfig) {
    return oldConfig.get(key) !== newConfig.get(key);
}
function getTempWorkspace() {
    return path.resolve(os.tmpdir(), 'vscodesws_' + makeRandomHexString(5));
}
function makeRandomHexString(length) {
    let chars = ['0', '1', '2', '3', '4', '5', '6', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    let result = '';
    for (let i = 0; i < length; i++) {
        let idx = Math.floor(chars.length * Math.random());
        result += chars[idx];
    }
    return result;
}
function getJavaConfiguration() {
    return vscode_1.workspace.getConfiguration('java');
}
function openServerLogFile(workspacePath) {
    let serverLogFile = path.join(workspacePath, '.metadata', '.log');
    if (!serverLogFile) {
        return vscode_1.window.showWarningMessage('Java Language Server has not started logging.').then(() => false);
    }
    return vscode_1.workspace.openTextDocument(serverLogFile)
        .then(doc => {
        if (!doc) {
            return false;
        }
        return vscode_1.window.showTextDocument(doc, vscode_1.window.activeTextEditor ?
            vscode_1.window.activeTextEditor.viewColumn : undefined)
            .then(editor => !!editor);
    }, () => false)
        .then(didOpen => {
        if (!didOpen) {
            vscode_1.window.showWarningMessage('Could not open Java Language Server log file');
        }
        return didOpen;
    });
}
function openFormatter(extensionPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let defaultFormatter = path.join(extensionPath, 'formatters', 'eclipse-formatter.xml');
        let formatterUrl = getJavaConfiguration().get('format.settings.url');
        if (formatterUrl && formatterUrl.length > 0) {
            if (isRemote(formatterUrl)) {
                vscode_1.commands.executeCommand(commands_1.Commands.OPEN_BROWSER, vscode_1.Uri.parse(formatterUrl));
            }
            else {
                let document = getPath(formatterUrl);
                if (document && fs.existsSync(document)) {
                    return openDocument(extensionPath, document, defaultFormatter, null);
                }
            }
        }
        let global = vscode_1.workspace.workspaceFolders === undefined;
        let fileName = formatterUrl || 'eclipse-formatter.xml';
        let file;
        let relativePath;
        if (!global) {
            file = path.join(vscode_1.workspace.workspaceFolders[0].uri.fsPath, fileName);
            relativePath = fileName;
        }
        else {
            let root = path.join(extensionPath, '..', 'redhat.java');
            if (!fs.existsSync(root)) {
                fs.mkdirSync(root);
            }
            file = path.join(root, fileName);
        }
        if (!fs.existsSync(file)) {
            addFormatter(extensionPath, file, defaultFormatter, relativePath);
        }
        else {
            if (formatterUrl) {
                getJavaConfiguration().update('format.settings.url', (relativePath !== null ? relativePath : file), global);
                openDocument(extensionPath, file, file, defaultFormatter);
            }
            else {
                addFormatter(extensionPath, file, defaultFormatter, relativePath);
            }
        }
    });
}
function getPath(f) {
    if (vscode_1.workspace.workspaceFolders && !path.isAbsolute(f)) {
        vscode_1.workspace.workspaceFolders.forEach(wf => {
            let file = path.resolve(wf.uri.path, f);
            if (fs.existsSync(file)) {
                return file;
            }
        });
    }
    else {
        return path.resolve(f);
    }
    return null;
}
function openDocument(extensionPath, formatterUrl, defaultFormatter, relativePath) {
    return vscode_1.workspace.openTextDocument(formatterUrl)
        .then(doc => {
        if (!doc) {
            addFormatter(extensionPath, formatterUrl, defaultFormatter, relativePath);
        }
        return vscode_1.window.showTextDocument(doc, vscode_1.window.activeTextEditor ?
            vscode_1.window.activeTextEditor.viewColumn : undefined)
            .then(editor => !!editor);
    }, () => false)
        .then(didOpen => {
        if (!didOpen) {
            vscode_1.window.showWarningMessage('Could not open Formatter Settings file');
            addFormatter(extensionPath, formatterUrl, defaultFormatter, relativePath);
        }
        else {
            return didOpen;
        }
    });
}
function isRemote(f) {
    return f !== null && f.startsWith('http:/') || f.startsWith('https:/');
}
function addFormatter(extensionPath, formatterUrl, defaultFormatter, relativePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            value: (relativePath ? relativePath : formatterUrl),
            prompt: 'please enter URL or Path:',
            ignoreFocusOut: true
        };
        yield vscode_1.window.showInputBox(options).then(f => {
            if (f) {
                let global = vscode_1.workspace.workspaceFolders === undefined;
                if (isRemote(f)) {
                    vscode_1.commands.executeCommand(commands_1.Commands.OPEN_BROWSER, vscode_1.Uri.parse(f));
                    getJavaConfiguration().update('format.settings.url', f, global);
                }
                else {
                    if (!path.isAbsolute(f)) {
                        let fileName = f;
                        if (!global) {
                            f = path.join(vscode_1.workspace.workspaceFolders[0].uri.fsPath, fileName);
                            relativePath = fileName;
                        }
                        else {
                            let root = path.join(extensionPath, '..', 'redhat.java');
                            if (!fs.existsSync(root)) {
                                fs.mkdirSync(root);
                            }
                            f = path.join(root, fileName);
                        }
                    }
                    else {
                        relativePath = null;
                    }
                    getJavaConfiguration().update('format.settings.url', (relativePath !== null ? relativePath : f), global);
                    if (!fs.existsSync(f)) {
                        let name = relativePath !== null ? relativePath : f;
                        let msg = '\'' + name + '\' does not exist. Do you want to create it?';
                        let action = 'Yes';
                        vscode_1.window.showWarningMessage(msg, action, 'No').then((selection) => {
                            if (action === selection) {
                                fs.createReadStream(defaultFormatter)
                                    .pipe(fs.createWriteStream(f))
                                    .on('finish', () => openDocument(extensionPath, f, defaultFormatter, relativePath));
                            }
                        });
                    }
                    else {
                        openDocument(extensionPath, f, defaultFormatter, relativePath);
                    }
                }
            }
        });
    });
}
function applyWorkspaceEdit(obj, languageClient) {
    return __awaiter(this, void 0, void 0, function* () {
        let edit = languageClient.protocol2CodeConverter.asWorkspaceEdit(obj);
        if (edit) {
            yield vscode_1.workspace.applyEdit(edit);
            // By executing the range formatting command to correct the indention according to the VS Code editor settings.
            // More details, see: https://github.com/redhat-developer/vscode-java/issues/557
            try {
                let currentEditor = vscode_1.window.activeTextEditor;
                // If the Uri path of the edit change is not equal to that of the active editor, we will skip the range formatting
                if (currentEditor.document.uri.fsPath !== edit.entries()[0][0].fsPath) {
                    return;
                }
                let cursorPostion = currentEditor.selection.active;
                // Get the array of all the changes
                let changes = edit.entries()[0][1];
                // Get the position information of the first change
                let startPosition = new vscode_1.Position(changes[0].range.start.line, changes[0].range.start.character);
                let lineOffsets = changes[0].newText.split(/\r?\n/).length - 1;
                for (let i = 1; i < changes.length; i++) {
                    // When it comes to a discontinuous range, execute the range formatting and record the new start position
                    if (changes[i].range.start.line !== startPosition.line) {
                        yield executeRangeFormat(currentEditor, startPosition, lineOffsets);
                        startPosition = new vscode_1.Position(changes[i].range.start.line, changes[i].range.start.character);
                        lineOffsets = 0;
                    }
                    lineOffsets += changes[i].newText.split(/\r?\n/).length - 1;
                }
                yield executeRangeFormat(currentEditor, startPosition, lineOffsets);
                // Recover the cursor's original position
                currentEditor.selection = new vscode_1.Selection(cursorPostion, cursorPostion);
            }
            catch (error) {
                languageClient.error(error);
            }
        }
    });
}
function executeRangeFormat(editor, startPosition, lineOffset) {
    return __awaiter(this, void 0, void 0, function* () {
        let endPosition = editor.document.positionAt(editor.document.offsetAt(new vscode_1.Position(startPosition.line + lineOffset + 1, 0)) - 1);
        editor.selection = new vscode_1.Selection(startPosition, endPosition);
        yield vscode_1.commands.executeCommand('editor.action.formatSelection');
    });
}
//# sourceMappingURL=extension.js.map