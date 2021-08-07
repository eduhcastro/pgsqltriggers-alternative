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
var actions = ['insert', 'update', 'delete'];
var myActions = [];
var ConfigDB = function (data) {
    if (!data.user && !data.password && !data.host && !data.database) {
        throw new Error('config is invalid');
    }
    return new pg_1.Pool(data);
};
exports.ConfigDB = ConfigDB;
exports.ConfigTriggerDB = exports.ConfigDB;
var scanConfig = function (arrs) {
    if (typeof arrs !== 'object') {
        throw new Error('Expected an object');
    }
    if (typeof arrs.scriptOpts === 'undefined' && typeof arrs.tables === 'undefined') {
        throw new Error('Expected a table or script');
    }
    if (typeof arrs.scriptOpts !== 'undefined' && typeof arrs.script === 'undefined') {
        throw new Error('Expected a script');
    }
    if (typeof arrs.scriptOpts !== 'undefined' && typeof arrs.tables !== 'undefined') {
        throw new Error('The "tables" argument cannot be called along with the "scriptOpts" argument');
    }
    if (typeof arrs.scriptOpts !== 'undefined' && typeof arrs.script !== 'string') {
        throw new Error('Invalid script, put a valid script');
    }
    if (typeof arrs.scriptOpts !== 'undefined' && typeof arrs.script === 'string' && arrs.script.length < 10) {
        throw new Error('Invalid script, put a valid script');
    }
    if (typeof arrs.tables !== 'undefined' && typeof arrs.tables !== 'object') {
        throw new Error('Expected an array object in argument tables');
    }
    if (typeof arrs.scriptOpts !== 'undefined' && typeof arrs.scriptOpts.action !== 'undefined') {
        if (typeof arrs.scriptOpts.action !== 'string') {
            throw new Error('Invalid scriptOpts.action, put a valid scriptOpts.action');
        }
        var action = arrs.scriptOpts.action.split(',');
        if (action.length > 3) {
            throw new Error('Invalid scriptOpts.action, put a valid scriptOpts.action');
        }
        var findActions = actions.filter(function (action) { return action === action.toLowerCase(); });
        if (findActions.length === 0) {
            throw new Error('Invalid scriptOpts.action, put a valid scriptOpts.action');
        }
        myActions = findActions;
    }
};
var buildQuery = function (data, triggers) {
    if (typeof data.scriptOpts !== 'undefined' && typeof data.script !== 'undefined') {
        return "\n    CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$\n      " + data.script + "\n    $$ LANGUAGE plpgsql;\n    " + triggers + "\n  ";
    }
    return "any";
};
var buildTriggers = function (table) {
    var triggers = '';
    for (var _i = 0, myActions_1 = myActions; _i < myActions_1.length; _i++) {
        var triggerAdd = myActions_1[_i];
        if (triggerAdd === 'insert') {
            triggers += "\n    DROP TRIGGER IF EXISTS " + table.fromTable + "_notify_insert ON " + table.fromTable + ";\n    CREATE TRIGGER " + table.fromTable + "_notify_insert AFTER INSERT ON " + table.fromTable + " FOR EACH ROW EXECUTE PROCEDURE table_update_notify('" + table.id + "');\n    ";
        }
        if (triggerAdd === 'update') {
            triggers += "\n    DROP TRIGGER IF EXISTS " + table.fromTable + "_notify_update ON " + table.fromTable + ";\n    CREATE TRIGGER " + table.fromTable + "_notify_update AFTER UPDATE ON " + table.fromTable + " FOR EACH ROW EXECUTE PROCEDURE table_update_notify('" + table.id + "');\n    ";
        }
        if (triggerAdd === 'delete') {
            triggers += "\n    DROP TRIGGER IF EXISTS " + table.fromTable + "_notify_delete ON " + table.fromTable + ";\n    CREATE TRIGGER " + table.fromTable + "_notify_delete AFTER DELETE ON " + table.fromTable + " FOR EACH ROW EXECUTE PROCEDURE table_update_notify('" + table.id + "');\n    ";
        }
    }
    return triggers;
};
var Create = function (config) { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        try {
            scanConfig(config);
            config.conexao.connect(function (err, client, release) {
                return __awaiter(this, void 0, void 0, function () {
                    var triggers;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                release();
                                if (err) {
                                    throw (err);
                                }
                                triggers = buildTriggers(config.scriptOpts);
                                return [4 /*yield*/, client.query(buildQuery(config, triggers))];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            });
            result = {
                status: true,
                message: "Table " + config.scriptOpts.fromTable + " done"
            };
        }
        catch (err) {
            result = {
                status: false,
                message: "error"
            };
            throw Error(err);
        }
        finally {
            return [2 /*return*/, result];
        }
        return [2 /*return*/];
    });
}); };
exports.CreateTriggers = Create;
//# sourceMappingURL=index.js.map