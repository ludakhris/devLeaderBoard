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
const _ = require("lodash");
const Utils_1 = require("./Utils");
const Versions_1 = require("./Versions");
let overview;
var dependencies;
(function (dependencies) {
    const starters = {};
    function getStarters(bootVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!starters[bootVersion]) {
                const rawJSONString = yield Utils_1.Utils.downloadFile(`${Utils_1.Utils.settings.getServiceUrl()}dependencies?bootVersion=${bootVersion}`, true, { Accept: "application/vnd.initializr.v2.1+json" });
                starters[bootVersion] = JSON.parse(rawJSONString);
            }
            return _.cloneDeep(starters[bootVersion]);
        });
    }
    dependencies.getStarters = getStarters;
})(dependencies = exports.dependencies || (exports.dependencies = {}));
function getBootVersions() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!overview) {
            yield update();
        }
        if (!overview.bootVersion) {
            return [];
        }
        else {
            return overview.bootVersion.values.filter(x => x.id === overview.bootVersion.default)
                .concat(overview.bootVersion.values.filter(x => x.id !== overview.bootVersion.default));
        }
    });
}
exports.getBootVersions = getBootVersions;
function getAvailableDependencies(bootVersion) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!overview) {
            yield update();
        }
        if (!overview.dependencies) {
            return [];
        }
        else {
            const ret = [];
            for (const grp of overview.dependencies.values) {
                const group = grp.name;
                ret.push(...grp.values.filter(dep => isCompatible(dep, bootVersion)).map(dep => Object.assign({ group }, dep)));
            }
            return ret;
        }
    });
}
exports.getAvailableDependencies = getAvailableDependencies;
function isCompatible(dep, bootVersion) {
    if (bootVersion && dep && dep.versionRange) {
        return Versions_1.Versions.matchRange(bootVersion, dep.versionRange);
    }
    else {
        return true;
    }
}
function update() {
    return __awaiter(this, void 0, void 0, function* () {
        const rawJSONString = yield Utils_1.Utils.downloadFile(Utils_1.Utils.settings.getServiceUrl(), true, { Accept: "application/vnd.initializr.v2.1+json" });
        overview = JSON.parse(rawJSONString);
    });
}
//# sourceMappingURL=Metadata.js.map