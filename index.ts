import { Pool } from 'pg';

// List of valid trigger actions
const actions = ['INSERT', 'UPDATE', 'DELETE'];

// Required parameters for each script
const params = ["action", "code", "targetTable"];

/**
 * Interface for defining trigger scripts.
 */
interface IScript {
  /**
   * Script code for the trigger according to PGSQL Trigger Procedures.
   */
  code: string | undefined;

  /**
   * Action for the trigger.
   * Valid actions are INSERT, UPDATE, DELETE.
   */
  action: string | undefined;

  /**
   * Target table for the trigger.
   */
  targetTable: string | undefined;

  /**
   * Optional name of the function.
   */
  functionName?: string | undefined;

  /**
   * Optional name of the trigger.
   */
  triggerName?: string | undefined;
}

/**
 * Interface for PGSQL Triggers configuration.
 */
interface PGSQLTriggers {
  /**
   * Add a name for your trigger functions.
   */
  name?: string | undefined;

  /**
   * Add a pool for your database.
   */
  pool?: any | undefined;

  /**
   * Add scripts for your trigger functions.
   */
  scripts?: Array<IScript> | undefined;

  /**
   * Options for your extensive script.
   */
  scriptsOpts?: {
    /**
     * Define whether your script is simple or complex code.
     * Default is false.
     */
    extensive: boolean | false;
  } | undefined;

  /**
   * Soon.
   */
  tables?: Array<object> | undefined;

  /**
   * Defines the property level of the query.
   * If true, it will not be possible to override triggers and functions with the same name.
   */
  restrict?: boolean | true;
}

/**
 * Validates the configuration object.
 * @param arrs Configuration object for PGSQL Triggers.
 * @throws Error if any required parameter is missing or invalid.
 */
const scanConfig = (arrs?: PGSQLTriggers) => {
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

    arrs.scripts.map((script: IScript) => {
      for (let arr of params) {
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
const customFunctionName = (c: any, name: any) => {
  if (typeof c === 'undefined') return `${name}`;
  if (String(c).length < 1) throw Error('Invalid custom function name');
  return c;
};

/**
 * Generates a custom trigger name based on the provided name or the default name.
 * @param c Custom trigger name.
 * @param name Default trigger name.
 * @returns Generated trigger name.
 * @throws Error if the custom trigger name is invalid.
 */
const customTriggerName = (c: any, name: any) => {
  if (typeof c === 'undefined') return `${name}`;
  if (String(c).length < 1) throw Error('Invalid custom trigger name');
  return c;
};

/**
 * Configures the database connection pool.
 * @param data Configuration data for the database connection.
 * @returns Database connection pool object.
 * @throws Error if the configuration data is invalid.
 */
const ConfigDB = (data: {
  host: string;
  user: string;
  database: string;
  password: string;
}): object => {
  if (!data.user || !data.password || !data.host || !data.database) {
    throw new Error('Invalid configuration');
  }
  return new Pool(data);
};

/**
 * Executes a database query using the provided connection pool.
 * @param pool Database connection pool object.
 * @param query Query to be executed.
 * @param callback Callback function to handle the query result.
 * @returns Promise that resolves with the query result.
 */
const executeQuery = async (pool: any, query: any, callback: any) => {
  await pool.connect(function (err: Error, client: any, release: any) {
    if (err) {
      return callback(err);
    }
    client.query(query, function (err: Error, result: any) {
      if (err) {
        return callback(err);
      }
      release();
      return callback(err, result);
    });
  });
};

/**
 * Builds the trigger functions based on the provided scripts and configuration.
 * @param scripts Array of trigger scripts.
 * @param config PGSQL Triggers configuration.
 * @returns Generated trigger functions as a string.
 * @throws Error if an invalid action is provided or the script type is not supported.
 */
const buildFunctions = (scripts: any, config: any) => {
  if (typeof scripts === 'undefined') return '';

  let scriptReturn = '';

  const type = config.scriptsOpts?.extensive;
  const restrict = config.restrict ? 'CREATE ' : 'CREATE OR REPLACE';

  for (let script of scripts) {
    if (actions.indexOf(script.action.toUpperCase()) === -1) {
      throw Error("Invalid action: " + script.action);
    }

    if (!type) {
      scriptReturn += `${restrict} FUNCTION ${customFunctionName(script.functionName, 'trigger_' + script.action.toLowerCase() + '_' + script.targetTable)}() RETURNS trigger AS $$
            BEGIN
            ${script.code};
            RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;`;
    } else {
      scriptReturn += script.code;
    }
  }

  return scriptReturn as string;
};

/**
 * Builds the trigger definitions based on the provided scripts and configuration.
 * @param opts Configuration options for building triggers.
 * @returns Generated trigger definitions as a string.
 * @throws Error if an invalid argument is provided or scripts are not defined.
 */
const buildTriggers = (opts?: any) => {
  if (typeof opts === 'undefined') {
    throw Error('Invalid build triggers arguments');
  }
  
  if (typeof opts.scripts === 'undefined') return '';

  let triggers = '';

  const restrict = (r: boolean, scripts: any, iden: string) => {
    if (r) {
      return `DROP TRIGGER IF EXISTS ${customTriggerName(scripts.triggerName, scripts.targetTable + iden)} ON ${scripts.targetTable};`;
    }
    return '';
  };

  if (!opts.scriptsOpts?.extensive) {
    for (let scripts of opts.scripts) {
      if (scripts.action.toUpperCase() === 'INSERT') {
        triggers += `${restrict(scripts.restrict, scripts, '_identifytg_insert')}
            CREATE TRIGGER ${customTriggerName(scripts.triggerName, scripts.targetTable + '_identifytg_insert')} AFTER INSERT ON ${scripts.targetTable} FOR EACH ROW EXECUTE PROCEDURE
            ${customFunctionName(scripts.functionName, 'trigger_insert_' + scripts.targetTable)}();`;
      }

      if (scripts.action.toUpperCase() === 'UPDATE') {
        triggers += `${restrict(scripts.restrict, scripts, '_identifytg_update')}
            CREATE TRIGGER ${customTriggerName(scripts.triggerName, scripts.targetTable + '_identifytg_update')} AFTER UPDATE ON ${scripts.targetTable} FOR EACH ROW EXECUTE PROCEDURE
            ${customFunctionName(scripts.functionName, 'trigger_update_' + scripts.targetTable)}();`;
      }

      if (scripts.action.toUpperCase() === 'DELETE') {
        triggers += `${restrict(scripts.restrict, scripts, '_identifytg_delete')}
            CREATE TRIGGER ${customTriggerName(scripts.triggerName, scripts.targetTable + '_identifytg_delete')} AFTER DELETE ON ${scripts.targetTable} FOR EACH ROW EXECUTE PROCEDURE
            ${customFunctionName(scripts.functionName, 'trigger_delete_' + scripts.targetTable)}();`;
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
const buildPrepare = (functions: any, triggers: any) => {
  console.log({
    functions,
    triggers
  });
  return `
    ${functions}
    ${triggers}`;
};

/**
 * Creates triggers in the database based on the provided configuration.
 * @param config Configuration for creating triggers.
 * @returns Promise that resolves when the triggers are created successfully.
 * @throws Error if any required parameter is missing or if an error occurs during execution.
 */
const Create = async (config: PGSQLTriggers) => {
  // Checking if all parameters were filled in correctly.
  scanConfig(config);

  const triggersFunctions = buildFunctions(config.scripts, config);
  const triggersScript = buildTriggers(config);

  return new Promise((resolve, reject) => {
    executeQuery(config.pool, buildPrepare(triggersFunctions, triggersScript), function (a: any, b: any) {
      if (a) {
        return reject(a);
      }
      return resolve(b);
    });
  }).catch(e => {
    throw Error(e);
  });
};

export {
  Create as CreateTriggers,
  ConfigDB as ConfigTriggerDB
};
