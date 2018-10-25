"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
var Versions;
(function (Versions) {
    const strictRange = /\[(.*),(.*)\]/;
    const halfopenRightRange = /\[(.*),(.*)\)/;
    const halfopenLeftRange = /\((.*),(.*)\]/;
    const qualifiers = ['M', 'RC', 'BUILD-SNAPSHOT', 'RELEASE'];
    function matchRange(version, range) {
        const strictMatchGrp = range.match(strictRange);
        if (strictMatchGrp) {
            return compareVersions(strictMatchGrp[1], version) <= 0
                && compareVersions(strictMatchGrp[2], version) >= 0;
        }
        const horMatchGrp = range.match(halfopenRightRange);
        if (horMatchGrp) {
            return compareVersions(horMatchGrp[1], version) <= 0
                && compareVersions(horMatchGrp[2], version) > 0;
        }
        const holMatchGrp = range.match(halfopenLeftRange);
        if (holMatchGrp) {
            return compareVersions(holMatchGrp[1], version) < 0
                && compareVersions(holMatchGrp[2], version) >= 0;
        }
        return compareVersions(range, version) <= 0;
    }
    Versions.matchRange = matchRange;
    function compareVersions(a, b) {
        let result;
        const versionA = a.split(".");
        const versionB = b.split(".");
        for (let i = 0; i < 3; i += 1) {
            result = parseInt(versionA[i], 10) - parseInt(versionB[i], 10);
            if (result !== 0) {
                return result;
            }
        }
        const aqual = parseQualifier(versionA[3]);
        const bqual = parseQualifier(versionB[3]);
        result = qualifiers.indexOf(aqual) - qualifiers.indexOf(bqual);
        if (result !== 0) {
            return result;
        }
        return versionA[3].localeCompare(versionB[3]);
    }
    function parseQualifier(version) {
        const qual = version.replace(/\d+/g, "");
        return qualifiers.indexOf(qual) !== -1 ? qual : "RELEASE";
    }
})(Versions = exports.Versions || (exports.Versions = {}));
//# sourceMappingURL=Versions.js.map