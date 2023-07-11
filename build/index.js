"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigTriggerDB = exports.CreateTriggers = void 0;
var pg_1 = require("pg");
// List of valid trigger actions
var actions = ['INSERT', 'UPDATE', 'DELETE'];
// Required parameters for each script
var params = ["action", "code", "targetTable"];
/**
 * Validates the configuration object.
 * @param arrs Configuration object for PGSQL Triggers.
 * @throws Error if any required parameter is missing or invalid.
 */
var scanConfig = function (arrs) {
    if (typeof arrs === 'undefined') {
        throw Error('config is undefined');
    }
    if (typeof arrs.pool === 'undefined') {
        throw Error('argument pool required');
    }
    if (typeof arrs !== 'object') {
        throw Error('Expected an object');
    }
    if (typeof arrs.scriptsOpts === 'undefined' && typeof arrs.tables === 'undefined') {
        throw Error('Expected a table or scripts');
    }
    if (typeof arrs.scripts !== 'undefined') {
        if (typeof arrs.tables !== 'undefined') {
            throw Error('It is not possible to use a script and option tables at the same time');
        }
        if (!Array.isArray(arrs.scripts)) {
            throw Error('Expected an array of scripts');
        }
        if (arrs.scripts.length === 0) {
            throw Error('Expected at least one script');
        }
        arrs.scripts.map(function (script) {
            for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                var arr = params_1[_i];
                if (!script.hasOwnProperty(arr)) {
                    throw Error('The parameter is missing: ' + arr + ' in ' + JSON.stringify(script));
                }
            }
            return true;
        });
    }
    if (typeof arrs.tables !== 'undefined' && !Array.isArray(arrs.tables)) {
        throw Error('Expected an array of objects in argument tables');
    }
};
/**
 * Generates a custom function name based on the provided name or the default name.
 * @param c Custom function name.
 * @param name Default function name.
 * @returns Generated function name.
 * @throws Error if the custom function name is invalid.
 */
var customFunctionName = function (c, name) {
    if (typeof c === 'undefined')
        return "".concat(name);
    if (String(c).length < 1)
        throw Error('Invalid custom function name');
    return c;
};
/**
 * Generates a custom trigger name based on the provided name or the default name.
 * @param c Custom trigger name.
 * @param name Default trigger name.
 * @returns Generated trigger name.
 * @throws Error if the custom trigger name is invalid.
 */
var customTriggerName = function (c, name) {
    if (typeof c === 'undefined')
        return "".concat(name);
    if (String(c).length < 1)
        throw Error('Invalid custom trigger name');
    return c;
};
/**
 * Configures the database connection pool.
 * @param data Configuration data for the database connection.
 * @returns Database connection pool object.
 * @throws Error if the configuration data is invalid.
 */
var ConfigDB = function (data) {
    if (!data.user || !data.password || !data.host || !data.database) {
        throw new Error('Invalid configuration');
    }
    return new pg_1.Pool(data);
};
exports.ConfigTriggerDB = ConfigDB;
/**
 * Executes a database query using the provided connection pool.
 * @param pool Database connection pool object.
 * @param query Query to be executed.
 * @param callback Callback function to handle the query result.
 * @returns Promise that resolves with the query result.
 */
var executeQuery = function (pool, query, callback) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect(function (err, client, release) {
                    if (err) {
                        return callback(err);
                    }
                    client.query(query, function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        release();
                        return callback(err, result);
                    });
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Builds the trigger functions based on the provided scripts and configuration.
 * @param scripts Array of trigger scripts.
 * @param config PGSQL Triggers configuration.
 * @returns Generated trigger functions as a string.
 * @throws Error if an invalid action is provided or the script type is not supported.
 */
var buildFunctions = function (scripts, config) {
    var _a;
    if (typeof scripts === 'undefined')
        return '';
    var scriptReturn = '';
    var type = (_a = config.scriptsOpts) === null || _a === void 0 ? void 0 : _a.extensive;
    var restrict = config.restrict ? 'CREATE ' : 'CREATE OR REPLACE';
    for (var _i = 0, scripts_1 = scripts; _i < scripts_1.length; _i++) {
        var script = scripts_1[_i];
        if (actions.indexOf(script.action.toUpperCase()) === -1) {
            throw Error("Invalid action: " + script.action);
        }
        if (!type) {
            scriptReturn += "".concat(restrict, " FUNCTION ").concat(customFunctionName(script.functionName, 'trigger_' + script.action.toLowerCase() + '_' + script.targetTable), "() RETURNS trigger AS $$\n            BEGIN\n            ").concat(script.code, ";\n            RETURN NULL;\n            END;\n            $$ LANGUAGE plpgsql;");
        }
        else {
            scriptReturn += script.code;
        }
    }
    return scriptReturn;
};
/**
 * Builds the trigger definitions based on the provided scripts and configuration.
 * @param opts Configuration options for building triggers.
 * @returns Generated trigger definitions as a string.
 * @throws Error if an invalid argument is provided or scripts are not defined.
 */
var buildTriggers = function (opts) {
    var _a;
    if (typeof opts === 'undefined') {
        throw Error('Invalid build triggers arguments');
    }
    if (typeof opts.scripts === 'undefined')
        return '';
    var triggers = '';
    var restrict = function (r, scripts, iden) {
        if (r) {
            return "DROP TRIGGER IF EXISTS ".concat(customTriggerName(scripts.triggerName, scripts.targetTable + iden), " ON ").concat(scripts.targetTable, ";");
        }
        return '';
    };
    if (!((_a = opts.scriptsOpts) === null || _a === void 0 ? void 0 : _a.extensive)) {
        for (var _i = 0, _b = opts.scripts; _i < _b.length; _i++) {
            var scripts = _b[_i];
            if (scripts.action.toUpperCase() === 'INSERT') {
                triggers += "".concat(restrict(scripts.restrict, scripts, '_identifytg_insert'), "\n            CREATE TRIGGER ").concat(customTriggerName(scripts.triggerName, scripts.targetTable + '_identifytg_insert'), " AFTER INSERT ON ").concat(scripts.targetTable, " FOR EACH ROW EXECUTE PROCEDURE\n            ").concat(customFunctionName(scripts.functionName, 'trigger_insert_' + scripts.targetTable), "();");
            }
            if (scripts.action.toUpperCase() === 'UPDATE') {
                triggers += "".concat(restrict(scripts.restrict, scripts, '_identifytg_update'), "\n            CREATE TRIGGER ").concat(customTriggerName(scripts.triggerName, scripts.targetTable + '_identifytg_update'), " AFTER UPDATE ON ").concat(scripts.targetTable, " FOR EACH ROW EXECUTE PROCEDURE\n            ").concat(customFunctionName(scripts.functionName, 'trigger_update_' + scripts.targetTable), "();");
            }
            if (scripts.action.toUpperCase() === 'DELETE') {
                triggers += "".concat(restrict(scripts.restrict, scripts, '_identifytg_delete'), "\n            CREATE TRIGGER ").concat(customTriggerName(scripts.triggerName, scripts.targetTable + '_identifytg_delete'), " AFTER DELETE ON ").concat(scripts.targetTable, " FOR EACH ROW EXECUTE PROCEDURE\n            ").concat(customFunctionName(scripts.functionName, 'trigger_delete_' + scripts.targetTable), "();");
            }
        }
    }
    return triggers;
};
/**
 * Builds the final script by combining trigger functions and trigger definitions.
 * @param functions Generated trigger functions.
 * @param triggers Generated trigger definitions.
 * @returns Final script as a string.
 */
var buildPrepare = function (functions, triggers) {
    console.log({
        functions: functions,
        triggers: triggers
    });
    return "\n    ".concat(functions, "\n    ").concat(triggers);
};
/**
 * Creates triggers in the database based on the provided configuration.
 * @param config Configuration for creating triggers.
 * @returns Promise that resolves when the triggers are created successfully.
 * @throws Error if any required parameter is missing or if an error occurs during execution.
 */
var Create = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var triggersFunctions, triggersScript;
    return __generator(this, function (_a) {
        // Checking if all parameters were filled in correctly.
        scanConfig(config);
        triggersFunctions = buildFunctions(config.scripts, config);
        triggersScript = buildTriggers(config);
        return [2 /*return*/, new Promise(function (resolve, reject) {
                executeQuery(config.pool, buildPrepare(triggersFunctions, triggersScript), function (a, b) {
                    if (a) {
                        return reject(a);
                    }
                    return resolve(b);
                });
            }).catch(function (e) {
                throw Error(e);
            })];
    });
}); };
exports.CreateTriggers = Create;
//# sourceMappingURL=index.js.map