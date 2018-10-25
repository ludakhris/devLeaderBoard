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
const http = require("http");
const https = require("https");
const md5 = require("md5");
const os = require("os");
const path = require("path");
const url = require("url");
const vscode = require("vscode");
const xml2js = require("xml2js");
let EXTENSION_PUBLISHER;
let EXTENSION_NAME;
let EXTENSION_VERSION;
let EXTENSION_AI_KEY;
var Utils;
(function (Utils) {
    function loadPackageInfo(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { publisher, name, version, aiKey } = yield fse.readJSON(context.asAbsolutePath("./package.json"));
            EXTENSION_AI_KEY = aiKey;
            EXTENSION_PUBLISHER = publisher;
            EXTENSION_NAME = name;
            EXTENSION_VERSION = version;
        });
    }
    Utils.loadPackageInfo = loadPackageInfo;
    function getExtensionId() {
        return `${EXTENSION_PUBLISHER}.${EXTENSION_NAME}`;
    }
    Utils.getExtensionId = getExtensionId;
    function getVersion() {
        return EXTENSION_VERSION;
    }
    Utils.getVersion = getVersion;
    function getAiKey() {
        return EXTENSION_AI_KEY;
    }
    Utils.getAiKey = getAiKey;
    function getTempFolder() {
        return path.join(os.tmpdir(), getExtensionId());
    }
    Utils.getTempFolder = getTempFolder;
    function downloadFile(targetUrl, readContent, customHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
            const tempFilePath = path.join(getTempFolder(), md5(targetUrl));
            yield fse.ensureDir(getTempFolder());
            if (yield fse.pathExists(tempFilePath)) {
                yield fse.remove(tempFilePath);
            }
            return yield new Promise((resolve, reject) => {
                const urlObj = url.parse(targetUrl);
                const options = Object.assign({ headers: Object.assign({}, customHeaders, { 'User-Agent': `vscode/${getVersion()}` }) }, urlObj);
                let client;
                if (urlObj.protocol === "https:") {
                    client = https;
                    // tslint:disable-next-line:no-http-string
                }
                else if (urlObj.protocol === "http:") {
                    client = http;
                }
                else {
                    return reject(new Error("Unsupported protocol."));
                }
                client.get(options, (res) => {
                    let rawData;
                    let ws;
                    if (readContent) {
                        rawData = "";
                    }
                    else {
                        ws = fse.createWriteStream(tempFilePath);
                    }
                    res.on('data', (chunk) => {
                        if (readContent) {
                            rawData += chunk;
                        }
                        else {
                            ws.write(chunk);
                        }
                    });
                    res.on('end', () => {
                        if (readContent) {
                            resolve(rawData);
                        }
                        else {
                            ws.end();
                            resolve(tempFilePath);
                        }
                    });
                }).on("error", (err) => {
                    reject(err);
                });
            });
        });
    }
    Utils.downloadFile = downloadFile;
    function writeFileToExtensionRoot(relateivePath, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const extensionRootPath = vscode.extensions.getExtension(getExtensionId()).extensionPath;
            const filepath = path.join(extensionRootPath, relateivePath);
            yield fse.ensureFile(filepath);
            yield fse.writeFile(filepath, data);
        });
    }
    Utils.writeFileToExtensionRoot = writeFileToExtensionRoot;
    function readFileFromExtensionRoot(relateivePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const extensionRootPath = vscode.extensions.getExtension(getExtensionId()).extensionPath;
            const filepath = path.join(extensionRootPath, relateivePath);
            if (yield fse.pathExists(filepath)) {
                const buf = yield fse.readFile(filepath);
                return buf.toString();
            }
            else {
                return null;
            }
        });
    }
    Utils.readFileFromExtensionRoot = readFileFromExtensionRoot;
    function groupIdValidation(value) {
        return (/^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)*$/.test(value)) ? null : "Invalid Group Id";
    }
    Utils.groupIdValidation = groupIdValidation;
    function artifactIdValidation(value) {
        return (/^[a-z_][a-z0-9_]*(-[a-z_][a-z0-9_]*)*$/.test(value)) ? null : "Invalid Artifact Id";
    }
    Utils.artifactIdValidation = artifactIdValidation;
    function readXmlContent(xml, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const opts = Object.assign({ explicitArray: true }, options);
            return new Promise((resolve, reject) => {
                xml2js.parseString(xml, opts, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
    Utils.readXmlContent = readXmlContent;
    function buildXmlContent(obj, options) {
        const opts = Object.assign({ explicitArray: true }, options);
        return new xml2js.Builder(opts).buildObject(obj);
    }
    Utils.buildXmlContent = buildXmlContent;
    let settings;
    (function (settings) {
        function getServiceUrl() {
            return vscode.workspace.getConfiguration("spring.initializr").get("serviceUrl");
        }
        settings.getServiceUrl = getServiceUrl;
    })(settings = Utils.settings || (Utils.settings = {}));
})(Utils = exports.Utils || (exports.Utils = {}));
//# sourceMappingURL=Utils.js.map