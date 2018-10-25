'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTP = 'HTTP/';
exports.CATALINA = 'Catalina';
exports.INVALID_SERVER_DIRECTORY = 'Please make sure you select a valid Tomcat Directory.';
// tslint:disable-next-line:no-http-string
exports.UNABLE_SHUTDOWN_URL = 'https://stackoverflow.com/questions/36566401/severe-could-not-contact-localhost8005-tomcat-may-not-be-running-error-while/48636631#48636631';
exports.RESTART_CONFIG_ID = 'restart_when_http(s)_port_change';
// tslint:disable-next-line:no-http-string
exports.LOCALHOST = 'http://localhost';
exports.JVM_OPTION_FILE = 'jvm.options';
exports.DEBUG_ARGUMENT_KEY = '-agentlib:jdwp=transport=dt_socket,suspend=n,server=y,address=localhost:';
exports.CLASS_PATH_KEY = '-classpath';
exports.CATALINA_BASE_KEY = '-Dcatalina.base';
exports.CATALINA_HOME_KEY = '-Dcatalina.home';
exports.JAVA_IO_TEMP_DIR_KEY = '-Djava.io.tmpdir';
exports.ENCODING = '-Dfile.encoding=UTF8';
exports.BOOTSTRAP_FILE = 'org.apache.catalina.startup.Bootstrap';
exports.WAR_FILE_EXTENSION = '.war';
exports.DEBUG_SESSION_NAME = 'Tomcat Debug (Attach)';
exports.JVM_DEFAULT_OPTIONS_KEYS = [exports.CLASS_PATH_KEY, exports.CATALINA_BASE_KEY, exports.CATALINA_HOME_KEY];
var ServerState;
(function (ServerState) {
    ServerState["RunningServer"] = "runningserver";
    ServerState["IdleServer"] = "idleserver";
})(ServerState = exports.ServerState || (exports.ServerState = {}));
var PortKind;
(function (PortKind) {
    PortKind["Server"] = "Server";
    PortKind["Http"] = "Http";
    PortKind["Https"] = "Https";
})(PortKind = exports.PortKind || (exports.PortKind = {}));
//# sourceMappingURL=Constants.js.map