"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
class DependencyNode {
    constructor(gid, aid, ver, scp) {
        this.groupId = gid;
        this.artifactId = aid;
        this.version = ver;
        this.scope = scp;
    }
    get node() {
        const ret = {
            groupId: [this.groupId],
            artifactId: [this.artifactId]
        };
        if (this.version) {
            ret.version = [this.version];
        }
        if (this.scope) {
            ret.scope = [this.scope];
        }
        return ret;
    }
}
exports.DependencyNode = DependencyNode;
//# sourceMappingURL=DependencyNode.js.map