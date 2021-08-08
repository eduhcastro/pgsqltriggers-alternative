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
        while (_) try {
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
exports.ConfigTriggerDB = exports.CreateTriggers = exports.ConfigDB = void 0;
var pg_1 = require("pg");
var actions = ['INSERT', 'UPDATE', 'DELETE'];
var scanConfig = function (arrs) {
    if (typeof arrs === 'undefined') {
        return new Error('config is undefined');
    }
    if (typeof arrs !== 'object') {
        return new Error('Expected an object');
    }
    if (typeof arrs.scriptsOpts === 'undefined' && typeof arrs.tables === 'undefined') {
        return new Error('Expected a table or scripts');
    }
    if (typeof arrs.scripts !== 'undefined') {
        if (typeof arrs.tables !== 'undefined') {
            return new Error('It is not possible to use a script and option tables at the same time');
        }
        if (typeof arrs.scripts !== 'object') {
            return new Error('Expected an object in scripts');
        }
        if (arrs.scripts.length === 0) {
            return new Error('Expected at least one script');
        }
    }
    if (typeof arrs.tables !== 'undefined' && typeof arrs.tables !== 'object') {
        return new Error('Expected an array object in argument tables');
    }
};
var ConfigDB = function (data) {
    if (!data.user && !data.password && !data.host && !data.database) {
        throw new Error('config is invalid');
    }
    return new pg_1.Pool(data);
};
exports.ConfigDB = ConfigDB;
exports.ConfigTriggerDB = exports.ConfigDB;
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
var buildFunctions = function (scripts, config) {
    if (typeof scripts === 'undefined')
        return;
    var scriptReturn = '';
    var type = config.scriptsOpts.extensive;
    var restrict = config.restrict ? 'CREATE ' : 'CREATE OR REPLACE';
    for (var _i = 0, scripts_1 = scripts; _i < scripts_1.length; _i++) {
        var script = scripts_1[_i];
        if (actions.indexOf(script.action.toUpperCase()) === -1)
            return new Error("Invalid action : " + script.action);
        if (!type) {
            scriptReturn += "\n    " + restrict + " FUNCTION trigger_" + script.action.toLowerCase() + "_" + script.targetTable + "() RETURNS trigger AS $$\n    BEGIN\n    " + script.code + ";\n    RETURN NULL;\n    END;\n   $$ LANGUAGE plpgsql;\n  ";
        }
        else {
            scriptReturn += script.code;
        }
    }
    return scriptReturn;
};
var buildTriggers = function (opts) {
    if (typeof opts === 'undefined')
        return new Error('Invalid build triggers arguments');
    if (typeof opts.scripts === 'undefined')
        return;
    var triggers = '';
    for (var _i = 0, _a = opts.scripts; _i < _a.length; _i++) {
        var scripts = _a[_i];
        if (scripts.action.toUpperCase() === 'INSERT') {
            triggers += "\n    DROP TRIGGER IF EXISTS " + scripts.targetTable + "_notify_insert ON " + scripts.targetTable + ";\n    CREATE TRIGGER " + scripts.targetTable + "_notify_insert AFTER INSERT ON " + scripts.targetTable + " FOR EACH ROW EXECUTE PROCEDURE\n    trigger_insert_" + scripts.targetTable + "();\n    ";
        }
        if (scripts.action.toUpperCase() === 'UPDATE') {
            triggers += "\n    DROP TRIGGER IF EXISTS " + scripts.targetTable + "_notify_update ON " + scripts.targetTable + ";\n    CREATE TRIGGER " + scripts.targetTable + "_notify_update AFTER UPDATE ON " + scripts.targetTable + " FOR EACH ROW EXECUTE PROCEDURE\n    trigger_update_" + scripts.targetTable + "();\n    ";
        }
        if (scripts.action.toUpperCase() === 'DELETE') {
            triggers += "\n    DROP TRIGGER IF EXISTS " + scripts.targetTable + "_notify_delete ON " + scripts.targetTable + ";\n    CREATE TRIGGER " + scripts.targetTable + "_notify_delete AFTER DELETE ON " + scripts.targetTable + " FOR EACH ROW EXECUTE PROCEDURE\n    trigger_delete_" + scripts.targetTable + "();\n    ";
        }
    }
    return triggers;
};
var buildExecute = function (functions, triggers) {
    return "\n" + functions + "\n" + triggers + "\n";
};
var Create = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var Scan, triggersFunctions, triggersScript;
    return __generator(this, function (_a) {
        Scan = scanConfig(config);
        if (Scan instanceof Error)
            return [2 /*return*/, Scan];
        if (typeof config === 'undefined')
            return [2 /*return*/, new Error('invalid config')];
        if (typeof config.pool === 'undefined')
            return [2 /*return*/, new Error('argument pool required')];
        if (buildFunctions(config.scripts, config) instanceof Error)
            return [2 /*return*/, buildFunctions(config.scripts, config)];
        triggersFunctions = buildFunctions(config.scripts, config);
        triggersScript = buildTriggers(config);
        return [2 /*return*/, new Promise(function (resolve, reject) {
                executeQuery(config.pool, buildExecute(triggersFunctions, triggersScript), function (a, b) {
                    if (a) {
                        return reject(a);
                    }
                    return resolve(b);
                });
            }).catch(function (error) {
                return error;
            })];
    });
}); };
exports.CreateTriggers = Create;
//# sourceMappingURL=index.js.map