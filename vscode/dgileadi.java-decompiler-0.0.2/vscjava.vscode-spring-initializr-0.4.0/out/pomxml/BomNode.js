"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
class BomNode {
    constructor(gid, aid, ver) {
        this.groupId = gid;
        this.artifactId = aid;
        this.version = ver;
    }
    get node() {
        return {
            groupId: [this.groupId],
            artifactId: [this.artifactId],
            version: [this.version],
            type: ["pom"],
            scope: ["import"]
        };
    }
}
exports.BomNode = BomNode;
//# sourceMappingURL=BomNode.js.map