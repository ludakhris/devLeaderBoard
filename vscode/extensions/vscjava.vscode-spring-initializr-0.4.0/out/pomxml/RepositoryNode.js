"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
const Interfaces_1 = require("../Interfaces");
class RepositoryNode {
    constructor(id, name, url, snapshotEnabled) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.snapshotEnabled = snapshotEnabled;
    }
    get node() {
        return {
            id: [this.id],
            name: [this.name],
            url: [this.url],
            snapshots: [
                {
                    enabled: [this.snapshotEnabled ? Interfaces_1.BooleanString.TRUE : Interfaces_1.BooleanString.FALSE]
                }
            ]
        };
    }
}
exports.RepositoryNode = RepositoryNode;
//# sourceMappingURL=RepositoryNode.js.map