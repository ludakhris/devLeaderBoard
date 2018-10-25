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
const fse = require("fs-extra");
const path = require("path");
const unzip = require("unzip-stream");
const vscode = require("vscode");
const vscode_extension_telemetry_wrapper_1 = require("vscode-extension-telemetry-wrapper");
const DependencyManager_1 = require("./DependencyManager");
const Metadata = require("./Metadata");
const BomNode_1 = require("./pomxml/BomNode");
const DependencyNode_1 = require("./pomxml/DependencyNode");
const PomXml_1 = require("./pomxml/PomXml");
const RepositoryNode_1 = require("./pomxml/RepositoryNode");
const Utils_1 = require("./Utils");
const VSCodeUI_1 = require("./VSCodeUI");
var Routines;
(function (Routines) {
    function finishStep(session, step) {
        if (session && session.extraProperties) {
            session.extraProperties.finishedSteps.push(step.name);
        }
        vscode_extension_telemetry_wrapper_1.TelemetryWrapper.info(step.info);
    }
    let GenerateProject;
    (function (GenerateProject) {
        const STEP_LANGUAGE_MESSAGE = "Specify project language.";
        const STEP_PACKAGING_MESSAGE = "Specify packaging type.";
        const STEP_GROUPID_MESSAGE = "Input Group Id for your project.";
        const STEP_ARTIFACTID_MESSAGE = "Input Artifact Id for your project.";
        const STEP_BOOTVERSION_MESSAGE = "Specify Spring Boot version.";
        const STEP_DEPENDENCY_MESSAGE = "Search for dependencies.";
        const stepLanguage = { name: "Language", info: "Language selected." };
        const stepGroupId = { name: "GroupId", info: "GroupId inputed." };
        const stepArtifactId = { name: "ArtifactId", info: "ArtifactId inputed." };
        const stepBootVersion = { name: "BootVersion", info: "BootVersion selected." };
        const stepDependencies = { name: "Dependencies", info: "Dependencies selected." };
        const stepTargetFolder = { name: "TargetFolder", info: "Target folder selected." };
        const stepDownloadUnzip = { name: "DownloadUnzip", info: "Package unzipped." };
        function specifyLanguage() {
            return __awaiter(this, void 0, void 0, function* () {
                let language = vscode.workspace.getConfiguration("spring.initializr").get("defaultLanguage");
                if (!language) {
                    language = yield vscode.window.showQuickPick(["Java", "Kotlin", "Groovy"], { ignoreFocusOut: true, placeHolder: STEP_LANGUAGE_MESSAGE });
                }
                return language && language.toLowerCase();
            });
        }
        function specifyGroupId() {
            return __awaiter(this, void 0, void 0, function* () {
                const defaultGroupId = vscode.workspace.getConfiguration("spring.initializr").get("defaultGroupId");
                return yield VSCodeUI_1.VSCodeUI.getFromInputBox({
                    prompt: STEP_GROUPID_MESSAGE,
                    placeHolder: "e.g. com.example",
                    value: defaultGroupId,
                    validateInput: Utils_1.Utils.groupIdValidation
                });
            });
        }
        function specifyArtifactId() {
            return __awaiter(this, void 0, void 0, function* () {
                const defaultArtifactId = vscode.workspace.getConfiguration("spring.initializr").get("defaultArtifactId");
                return yield VSCodeUI_1.VSCodeUI.getFromInputBox({
                    prompt: STEP_ARTIFACTID_MESSAGE,
                    placeHolder: "e.g. demo",
                    value: defaultArtifactId,
                    validateInput: Utils_1.Utils.artifactIdValidation
                });
            });
        }
        function specifyPackaging() {
            return __awaiter(this, void 0, void 0, function* () {
                let packaging = vscode.workspace.getConfiguration("spring.initializr").get("defaultPackaging");
                if (!packaging) {
                    packaging = yield vscode.window.showQuickPick(["JAR", "WAR"], { ignoreFocusOut: true, placeHolder: STEP_PACKAGING_MESSAGE });
                }
                return packaging && packaging.toLowerCase();
            });
        }
        function specifyBootVersion() {
            return __awaiter(this, void 0, void 0, function* () {
                const bootVersion = yield VSCodeUI_1.VSCodeUI.getQuickPick(Metadata.getBootVersions(), version => version.name, version => version.description, null, { placeHolder: STEP_BOOTVERSION_MESSAGE });
                return bootVersion && bootVersion.id;
            });
        }
        function run(projectType) {
            return __awaiter(this, void 0, void 0, function* () {
                const session = vscode_extension_telemetry_wrapper_1.TelemetryWrapper.currentSession();
                if (session && session.extraProperties) {
                    session.extraProperties.finishedSteps = [];
                }
                // Step: language
                const language = yield specifyLanguage();
                if (language === undefined) {
                    return;
                }
                finishStep(session, stepLanguage);
                // Step: Group Id
                const groupId = yield specifyGroupId();
                if (groupId === undefined) {
                    return;
                }
                finishStep(session, stepGroupId);
                // Step: Artifact Id
                const artifactId = yield specifyArtifactId();
                if (artifactId === undefined) {
                    return;
                }
                finishStep(session, stepArtifactId);
                // Step: Packaging
                const packaging = yield specifyPackaging();
                if (packaging === undefined) {
                    return;
                }
                // Step: bootVersion
                const bootVersion = yield specifyBootVersion();
                if (bootVersion === undefined) {
                    return;
                }
                finishStep(session, stepBootVersion);
                // Step: Dependencies
                let current = null;
                const manager = new DependencyManager_1.DependencyManager();
                do {
                    current = yield vscode.window.showQuickPick(manager.getQuickPickItems(bootVersion, { hasLastSelected: true }), { ignoreFocusOut: true, placeHolder: STEP_DEPENDENCY_MESSAGE, matchOnDetail: true, matchOnDescription: true });
                    if (current && current.itemType === "dependency") {
                        manager.toggleDependency(current.id);
                    }
                } while (current && current.itemType === "dependency");
                if (!current) {
                    return;
                }
                if (session && session.extraProperties) {
                    session.extraProperties.depsType = current.itemType;
                    session.extraProperties.dependencies = current.id;
                }
                finishStep(session, stepDependencies);
                // Step: Choose target folder
                const outputUri = yield VSCodeUI_1.VSCodeUI.openDialogForFolder({ openLabel: "Generate into this folder" });
                if (!outputUri) {
                    return;
                }
                finishStep(session, stepTargetFolder);
                // Step: Download & Unzip
                yield vscode.window.withProgress({ location: vscode.ProgressLocation.Window }, (p) => new Promise((resolve, _reject) => __awaiter(this, void 0, void 0, function* () {
                    p.report({ message: "Downloading zip package..." });
                    const params = [
                        `type=${projectType}`,
                        `language=${language}`,
                        `groupId=${groupId}`,
                        `artifactId=${artifactId}`,
                        `packaging=${packaging}`,
                        `bootVersion=${bootVersion}`,
                        `baseDir=${artifactId}`,
                        `dependencies=${current.id}`
                    ];
                    const targetUrl = `${Utils_1.Utils.settings.getServiceUrl()}/starter.zip?${params.join("&")}`;
                    const filepath = yield Utils_1.Utils.downloadFile(targetUrl);
                    p.report({ message: "Starting to unzip..." });
                    fse.createReadStream(filepath).pipe(unzip.Extract({ path: outputUri.fsPath })).on("close", () => {
                        manager.updateLastUsedDependencies(current);
                        resolve();
                    }).on("error", (err) => {
                        vscode.window.showErrorMessage(err.message);
                        resolve();
                    });
                })));
                finishStep(session, stepDownloadUnzip);
                //Open in new window
                const choice = yield vscode.window.showInformationMessage(`Successfully generated. Location: ${outputUri.fsPath}`, "Open it");
                if (choice === "Open it") {
                    const hasOpenFolder = (vscode.workspace.workspaceFolders !== undefined);
                    vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(path.join(outputUri.fsPath, artifactId)), hasOpenFolder);
                }
            });
        }
        GenerateProject.run = run;
    })(GenerateProject = Routines.GenerateProject || (Routines.GenerateProject = {}));
    let EditStarters;
    (function (EditStarters) {
        const stepBootVersion = { name: "BootVersion", info: "BootVersion identified." };
        const stepDependencies = { name: "Dependencies", info: "Dependencies selected." };
        const stepCancel = { name: "Cancel", info: "Canceled by user." };
        const stepProceed = { name: "Proceed", info: "Confirmed by user." };
        const stepWriteFile = { name: "WriteFile", info: "Pom file updated." };
        function run(entry) {
            return __awaiter(this, void 0, void 0, function* () {
                const session = vscode_extension_telemetry_wrapper_1.TelemetryWrapper.currentSession();
                if (session && session.extraProperties) {
                    session.extraProperties.finishedSteps = [];
                }
                const deps = []; // gid:aid
                // Read pom.xml for $bootVersion, $dependencies(gid, aid)
                const content = yield fse.readFile(entry.fsPath);
                const xml = yield Utils_1.Utils.readXmlContent(content.toString());
                const bootVersion = PomXml_1.getBootVersion(xml.project);
                if (!bootVersion) {
                    vscode.window.showErrorMessage("Not a valid Spring Boot project.");
                    return;
                }
                if (session && session.extraProperties) {
                    session.extraProperties.bootVersion = bootVersion;
                }
                PomXml_1.getDependencyNodes(xml.project).forEach(elem => {
                    deps.push(`${elem.groupId[0]}:${elem.artifactId[0]}`);
                });
                finishStep(session, stepBootVersion);
                // [interaction] Step: Dependencies, with pre-selected deps
                const starters = yield vscode.window.withProgress({ location: vscode.ProgressLocation.Window }, (p) => __awaiter(this, void 0, void 0, function* () {
                    p.report({ message: `Fetching metadata for version ${bootVersion} ...` });
                    return yield Metadata.dependencies.getStarters(bootVersion);
                }));
                const oldStarterIds = [];
                Object.keys(starters.dependencies).forEach(key => {
                    const elem = starters.dependencies[key];
                    if (deps.indexOf(`${elem.groupId}:${elem.artifactId}`) >= 0) {
                        oldStarterIds.push(key);
                    }
                });
                const manager = new DependencyManager_1.DependencyManager();
                manager.selectedIds = [].concat(oldStarterIds);
                let current = null;
                do {
                    current = yield vscode.window.showQuickPick(manager.getQuickPickItems(bootVersion), { ignoreFocusOut: true, placeHolder: "Select dependencies.", matchOnDetail: true, matchOnDescription: true });
                    if (current && current.itemType === "dependency") {
                        manager.toggleDependency(current.id);
                    }
                } while (current && current.itemType === "dependency");
                if (!current) {
                    return;
                }
                if (session && session.extraProperties) {
                    session.extraProperties.dependencies = current.id;
                }
                finishStep(session, stepDependencies);
                // Diff deps for add/remove
                const toRemove = oldStarterIds.filter(elem => manager.selectedIds.indexOf(elem) < 0);
                const toAdd = manager.selectedIds.filter(elem => oldStarterIds.indexOf(elem) < 0);
                if (toRemove.length + toAdd.length === 0) {
                    vscode.window.showInformationMessage("No changes.");
                    return;
                }
                const msgRemove = (toRemove && toRemove.length) ? `Removing: [${toRemove.map(d => manager.dict[d] && manager.dict[d].name).filter(Boolean).join(", ")}].` : "";
                const msgAdd = (toAdd && toAdd.length) ? `Adding: [${toAdd.map(d => manager.dict[d] && manager.dict[d].name).filter(Boolean).join(", ")}].` : "";
                const choice = yield vscode.window.showWarningMessage(`${msgRemove} ${msgAdd} Proceed?`, "Proceed", "Cancel");
                if (choice !== "Proceed") {
                    finishStep(session, stepCancel);
                    return;
                }
                else {
                    finishStep(session, stepProceed);
                }
                // add spring-boot-starter if no selected starters
                if (manager.selectedIds.length === 0) {
                    toAdd.push("spring-boot-starter");
                    starters.dependencies["spring-boot-starter"] = {
                        groupId: "org.springframework.boot",
                        artifactId: "spring-boot-starter"
                    };
                }
                // modify xml object
                const newXml = getUpdatedPomXml(xml, starters, toRemove, toAdd);
                // re-generate a pom.xml
                const output = Utils_1.Utils.buildXmlContent(newXml);
                yield fse.writeFile(entry.fsPath, output);
                vscode.window.showInformationMessage("Pom file successfully updated.");
                finishStep(session, stepWriteFile);
                return;
            });
        }
        EditStarters.run = run;
        function getUpdatedPomXml(xml, starters, toRemove, toAdd) {
            const ret = Object.assign({}, xml);
            toRemove.forEach(elem => {
                PomXml_1.removeDependencyNode(ret.project, starters.dependencies[elem].groupId, starters.dependencies[elem].artifactId);
            });
            toAdd.forEach(elem => {
                const dep = starters.dependencies[elem];
                const newDepNode = new DependencyNode_1.DependencyNode(dep.groupId, dep.artifactId, dep.version, dep.scope);
                PomXml_1.addDependencyNode(ret.project, newDepNode.node);
                if (dep.bom) {
                    const bom = starters.boms[dep.bom];
                    const newBomNode = new BomNode_1.BomNode(bom.groupId, bom.artifactId, bom.version);
                    PomXml_1.addBomNode(ret.project, newBomNode.node);
                }
                if (dep.repository) {
                    const repo = starters.repositories[dep.repository];
                    const newRepoNode = new RepositoryNode_1.RepositoryNode(dep.repository, repo.name, repo.url, repo.snapshotEnabled);
                    PomXml_1.addRepositoryNode(ret.project, newRepoNode.node);
                }
            });
            return ret;
        }
    })(EditStarters = Routines.EditStarters || (Routines.EditStarters = {}));
})(Routines = exports.Routines || (exports.Routines = {}));
//# sourceMappingURL=Routines.js.map