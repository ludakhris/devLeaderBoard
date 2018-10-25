'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const VSCode = require("vscode");
const vscode_1 = require("vscode");
const commons = require("@pivotal-tools/commons-vscode");
const pipeline_builder_1 = require("@pivotal-tools/pipeline-builder");
const PROPERTIES_LANGUAGE_ID = "spring-boot-properties";
const YAML_LANGUAGE_ID = "spring-boot-properties-yaml";
const JAVA_LANGUAGE_ID = "java";
/** Called when extension is activated */
function activate(context) {
    // registerPipelineGenerator(context);
    let options = {
        DEBUG: false,
        CONNECT_TO_LS: false,
        extensionId: 'vscode-spring-boot',
        preferJdk: true,
        checkjvm: (context, jvm) => {
            if (!jvm.isJdk()) {
                VSCode.window.showWarningMessage('JAVA_HOME or PATH environment variable seems to point to a JRE. A JDK is required, hence Boot Hints are unavailable.');
            }
        },
        workspaceOptions: VSCode.workspace.getConfiguration("spring-boot.ls"),
        clientOptions: {
            // See PT-158992999 as to why a scheme is added to the document selector
            // documentSelector: [ PROPERTIES_LANGUAGE_ID, YAML_LANGUAGE_ID, JAVA_LANGUAGE_ID ],
            documentSelector: [
                {
                    language: PROPERTIES_LANGUAGE_ID,
                    scheme: 'file'
                },
                {
                    language: YAML_LANGUAGE_ID,
                    scheme: 'file'
                },
                {
                    language: JAVA_LANGUAGE_ID,
                    scheme: 'file'
                }
            ],
            synchronize: {
                configurationSection: 'boot-java'
            },
            initializationOptions: {
                workspaceFolders: vscode_1.workspace.workspaceFolders ? vscode_1.workspace.workspaceFolders.map(f => f.uri.toString()) : null
            }
        },
        highlightCodeLensSettingKey: 'boot-java.highlight-codelens.on'
    };
    return commons.activate(options, context);
}
exports.activate = activate;
// NOTE: Be sure to add this under "contributes" in package.json to enable the command:
//
// "commands": [
//     {
//       "command": "springboot.generate-concourse-pipeline",
//       "title": "Spring Boot: Generate Concourse Pipeline"
//     }
//   ],
function registerPipelineGenerator(context) {
    context.subscriptions.push(VSCode.commands.registerCommand('springboot.generate-concourse-pipeline', () => {
        let q = (property, defaultValue) => {
            defaultValue = defaultValue || '';
            return;
        };
        let projectRoot = VSCode.workspace.rootPath;
        if (projectRoot) {
            return pipeline_builder_1.generate_pipeline(projectRoot, (property, defaultValue) => new Promise((resolve, reject) => {
                VSCode.window.showInputBox({
                    prompt: `Enter '${property}': `,
                    value: defaultValue,
                    valueSelection: [0, defaultValue.length]
                }).then(resolve, reject);
            }));
        }
    }));
}
//# sourceMappingURL=Main.js.map