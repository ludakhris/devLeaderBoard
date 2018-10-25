"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function isNullOrEmptyNode(node) {
    return _.isEmpty(node) || _.isEqual(node, [""]);
}
function ensureNode(parentNode, nodeName, defaultValue) {
    if (isNullOrEmptyNode(parentNode[nodeName])) {
        parentNode[nodeName] = [defaultValue];
    }
    return parentNode[nodeName][0];
}
function getNode(parentNode, nodeName, fallbackValue) {
    if (isNullOrEmptyNode(parentNode[nodeName])) {
        return fallbackValue;
    }
    else {
        return parentNode[nodeName][0];
    }
}
function addDependencyNode(projectNode, node) {
    const dependenciesNode = ensureNode(projectNode, "dependencies", {});
    if (isNullOrEmptyNode(dependenciesNode.dependency)) {
        dependenciesNode.dependency = [node];
    }
    else {
        //insert if not exists
        if (!dependenciesNode.dependency.find(elem => _.isEqual(elem, node))) {
            dependenciesNode.dependency.push(node);
        }
    }
}
exports.addDependencyNode = addDependencyNode;
function removeDependencyNode(projectNode, groupId, artifactId) {
    const dependenciesNode = ensureNode(projectNode, "dependencies", {});
    if (!isNullOrEmptyNode(dependenciesNode.dependency)) {
        dependenciesNode.dependency = dependenciesNode.dependency.filter(elem => !(groupId === elem.groupId[0] && artifactId === elem.artifactId[0]));
    }
}
exports.removeDependencyNode = removeDependencyNode;
function getDependencyNodes(projectNode) {
    const dependenciesNode = getNode(projectNode, "dependencies", {});
    if (dependenciesNode.dependency) {
        return [].concat(dependenciesNode.dependency);
    }
    else {
        return [];
    }
}
exports.getDependencyNodes = getDependencyNodes;
function addBomNode(projectNode, node) {
    const dependencyManagementNode = ensureNode(projectNode, "dependencyManagement", {});
    const dependenciesNode = ensureNode(dependencyManagementNode, "dependencies", {});
    if (isNullOrEmptyNode(dependenciesNode.dependency)) {
        dependenciesNode.dependency = [node];
    }
    else {
        //insert if not exists
        if (!dependenciesNode.dependency.find(elem => _.isEqual(elem, node))) {
            dependenciesNode.dependency.push(node);
        }
    }
}
exports.addBomNode = addBomNode;
function addRepositoryNode(projectNode, node) {
    const repositoriesNode = ensureNode(projectNode, "repositories", {});
    if (isNullOrEmptyNode(repositoriesNode.repository)) {
        repositoriesNode.repository = [node];
    }
    else {
        //insert if not exists
        if (!repositoriesNode.repository.find(elem => _.isEqual(elem, node))) {
            repositoriesNode.repository.push(node);
        }
    }
}
exports.addRepositoryNode = addRepositoryNode;
function getBootVersion(projectNode) {
    let bootVersion;
    const parentNode = getNode(projectNode, "parent", {});
    if (getNode(parentNode, "artifactId") === "spring-boot-starter-parent" && getNode(parentNode, "groupId") === "org.springframework.boot") {
        bootVersion = getNode(parentNode, "version");
    }
    return bootVersion;
}
exports.getBootVersion = getBootVersion;
//# sourceMappingURL=PomXml.js.map