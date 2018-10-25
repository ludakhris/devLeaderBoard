// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
"use strict";
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
const Routines_1 = require("./Routines");
const Utils_1 = require("./Utils");
const VSCodeUI_1 = require("./VSCodeUI");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode_extension_telemetry_wrapper_1.initializeFromJsonFile(context.asAbsolutePath("./package.json"));
        yield vscode_extension_telemetry_wrapper_1.instrumentOperation("activation", initializeExtension)(context);
    });
}
exports.activate = activate;
function initializeExtension(_operationId, context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Utils_1.Utils.loadPackageInfo(context);
        yield vscode_extension_telemetry_wrapper_1.TelemetryWrapper.initilizeFromJsonFile(context.asAbsolutePath("package.json"));
        ProjectTypes.all().forEach((projectType) => {
            context.subscriptions.push(instrumentAndRegisterCommand(`spring.initializr.${projectType.value}`, () => __awaiter(this, void 0, void 0, function* () { return yield Routines_1.Routines.GenerateProject.run(projectType.value); })));
        });
        context.subscriptions.push(instrumentAndRegisterCommand("spring.initializr.editStarters", (entry) => __awaiter(this, void 0, void 0, function* () { return yield Routines_1.Routines.EditStarters.run(entry); })));
        context.subscriptions.push(instrumentAndRegisterCommand("spring.initializr.generate", () => __awaiter(this, void 0, void 0, function* () {
            const projectType = yield VSCodeUI_1.VSCodeUI.getQuickPick(ProjectTypes.all(), item => item.title, null, null, { placeHolder: "Select project type." });
            yield vscode.commands.executeCommand(`spring.initializr.${projectType.value}`);
        })));
    });
}
function deactivate() {
    // this method is called when your extension is deactivated
}
exports.deactivate = deactivate;
var ProjectTypes;
(function (ProjectTypes) {
    ProjectTypes.MAVEN = {
        title: "Maven Project",
        value: "maven-project"
    };
    ProjectTypes.GRADLE = {
        title: "Gradle Project",
        value: "gradle-project"
    };
    function all() {
        return [ProjectTypes.MAVEN, ProjectTypes.GRADLE];
    }
    ProjectTypes.all = all;
})(ProjectTypes || (ProjectTypes = {}));
function instrumentAndRegisterCommand(name, cb) {
    const instrumented = vscode_extension_telemetry_wrapper_1.instrumentOperation(name, (_operationId, myargs) => __awaiter(this, void 0, void 0, function* () { return yield cb(myargs); }));
    return vscode.commands.registerCommand(name, instrumented);
}
//# sourceMappingURL=extension.js.map