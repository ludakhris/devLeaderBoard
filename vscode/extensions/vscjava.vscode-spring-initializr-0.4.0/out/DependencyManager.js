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
const Metadata = require("./Metadata");
const Utils_1 = require("./Utils");
const PLACEHOLDER = "";
const HINT_CONFIRM = "Press <Enter> to continue.";
const DEPENDENCIES_HISTORY_FILENAME = ".last_used_dependencies";
class DependencyManager {
    constructor() {
        this.lastselected = null;
        this.dependencies = [];
        this.dict = {};
        this.selectedIds = [];
    }
    updateLastUsedDependencies(v) {
        Utils_1.Utils.writeFileToExtensionRoot(DEPENDENCIES_HISTORY_FILENAME, v.id);
        this.lastselected = this.genLastSelectedItem(v.id);
    }
    initialize(dependencies) {
        return __awaiter(this, void 0, void 0, function* () {
            this.dependencies = dependencies;
            for (const dep of this.dependencies) {
                this.dict[dep.id] = dep;
            }
            const idList = yield Utils_1.Utils.readFileFromExtensionRoot(DEPENDENCIES_HISTORY_FILENAME);
            this.lastselected = this.genLastSelectedItem(idList);
        });
    }
    getQuickPickItems(bootVersion, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.dependencies.length === 0) {
                yield this.initialize(yield Metadata.getAvailableDependencies(bootVersion));
            }
            const ret = [];
            if (this.selectedIds.length === 0) {
                if (options && options.hasLastSelected && this.lastselected) {
                    ret.push(this.lastselected);
                }
            }
            ret.push({
                itemType: "selection",
                id: this.selectedIds.join(","),
                label: `$(checklist) Selected ${this.selectedIds.length} dependenc${this.selectedIds.length === 1 ? "y" : "ies"}`,
                description: "",
                detail: HINT_CONFIRM
            });
            return ret.concat(this.getSelectedDependencies().concat(this.getUnselectedDependencies()).map((dep) => {
                return {
                    itemType: "dependency",
                    id: dep.id,
                    label: `${this.selectedIds.indexOf(dep.id) >= 0 ? "$(check) " : PLACEHOLDER}${dep.name}`,
                    description: dep.group,
                    detail: dep.description
                };
            }));
        });
    }
    getSelectedDependencies() {
        return this.selectedIds.map((id) => this.dict[id]).filter(Boolean);
    }
    getUnselectedDependencies() {
        return this.dependencies.filter((dep) => this.selectedIds.indexOf(dep.id) < 0);
    }
    toggleDependency(id) {
        const index = this.selectedIds.indexOf(id);
        if (index >= 0) {
            this.selectedIds = this.selectedIds.filter((x) => x !== id);
        }
        else {
            this.selectedIds.push(id);
        }
    }
    genLastSelectedItem(idList) {
        const availIdList = idList && idList.split(",").filter((id) => this.dict[id]);
        const availNameList = availIdList && availIdList.map((id) => this.dict[id].name).filter(Boolean);
        if (availNameList && availNameList.length) {
            return {
                itemType: "lastUsed",
                id: availIdList.join(","),
                label: "$(clock) Last used",
                description: "",
                detail: availNameList.join(", ")
            };
        }
        else {
            return null;
        }
    }
}
exports.DependencyManager = DependencyManager;
//# sourceMappingURL=DependencyManager.js.map