import { Pool } from 'pg'

const actions = ['INSERT', 'UPDATE', 'DELETE']

interface Iscripts {
  /**
   * @param {string} code
   * @description Script for trigger according to PGSQL Trigger Procedures
   */
  code?: string | undefined

  /**
   * @param {string} action
   * @description Action for trigger
   * @examples INSERT,UPDATE,DELETE
   */
  action?: string | undefined

  /**
   * @param {string} targetTable
   * @description Target table for trigger
   */
  targetTable: string | undefined

}

interface PGSQLTriggers {
  /**
   * @argument {string} name
   * @description Add a name for your trigger functions
   */
  name?: string | undefined

  /**
   * @argument {any} pool
   * @description Add a pool for your database
   */
  pool?: any | undefined,

  /**
   * @argument {string} script
   * @description Add scripts for your trigger functions
   */
  scripts?: Array<Iscripts> | undefined,

  /**
   * @argument {object} scriptOpts
   * @description Options for your extensive script
   */
  scriptsOpts?: {
    /**
     * @argument {boolean} extensive
     * @description Define whether your script is simple or complex code
     * @default false
     */
    extensive: boolean | false
  } | undefined,

  /**
   * @argument {Array< object >} tables
   * @description Soon.
   */
  tables?: Array<object> | undefined,

  /**
   * @argument {boolean} restrict
   * @description Defines the property level of the query, if true, it will not be possible to override triggers and functions with the same name
   */
  restrict?: boolean | true

}


const scanConfig = (arrs?: PGSQLTriggers) => {
  if (typeof arrs === 'undefined') {
    return new Error('config is undefined')
  }

  if (typeof arrs !== 'object') {
    return new Error('Expected an object')
  }

  if (typeof arrs.scriptsOpts === 'undefined' && typeof arrs.tables === 'undefined') {
    return new Error('Expected a table or scripts')
  }

  if (typeof arrs.scripts !== 'undefined') {

    if (typeof arrs.tables !== 'undefined') {
      return new Error('It is not possible to use a script and option tables at the same time')
    }

    if (typeof arrs.scripts !== 'object') {
      return new Error('Expected an object in scripts')
    }

    if (arrs.scripts.length === 0) {
      return new Error('Expected at least one script')
    }
  }

  if (typeof arrs.tables !== 'undefined' && typeof arrs.tables !== 'object') {
    return new Error('Expected an array object in argument tables')
  }

}



export const ConfigDB = (data: {
  host: string
  user: string
  database: string
  password: string
}): object => {

  if (!data.user && !data.password && !data.host && !data.database) {
    throw new Error('config is invalid')
  }
  return new Pool(data)
}


const executeQuery = async (pool: any, query: any, callback: any) => {
  await pool.connect(function (err: Error, client: any, release: any) {
    if (err) {
      return callback(err)
    }
    client.query(query, function (err: Error, result: any) {
      if (err) {
        return callback(err)
      }
      release();
      return callback(err, result);
    })
  })
}

const buildFunctions = (scripts: any, config: any) => {
  if (typeof scripts === 'undefined') return
  let scriptReturn = ''
  const type = config.scriptsOpts.extensive
  const restrict = config.restrict ? 'CREATE ' : 'CREATE OR REPLACE'
  for (let script of scripts) {
    if (actions.indexOf(script.action.toUpperCase()) === -1) return new Error("Invalid action : " + script.action)
    if (!type) {
      scriptReturn += `
    ${restrict} FUNCTION trigger_${script.action.toLowerCase()}_${script.targetTable}() RETURNS trigger AS $$
    BEGIN
    ${script.code};
    RETURN NULL;
    END;
   $$ LANGUAGE plpgsql;
  `
    } else {
      scriptReturn += script.code
    }
  }
  return scriptReturn as string
}

const buildTriggers = (opts?: any) => {
  if (typeof opts === 'undefined') return new Error('Invalid build triggers arguments')
  if (typeof opts.scripts === 'undefined') return
  let triggers = ''
  for (let scripts of opts.scripts) {
    if (scripts.action.toUpperCase() === 'INSERT') {
      triggers += `
    DROP TRIGGER IF EXISTS ${scripts.targetTable}_notify_insert ON ${scripts.targetTable};
    CREATE TRIGGER ${scripts.targetTable}_notify_insert AFTER INSERT ON ${scripts.targetTable} FOR EACH ROW EXECUTE PROCEDURE
    trigger_insert_${scripts.targetTable}();
    `
    }

    if (scripts.action.toUpperCase() === 'UPDATE') {
      triggers += `
    DROP TRIGGER IF EXISTS ${scripts.targetTable}_notify_update ON ${scripts.targetTable};
    CREATE TRIGGER ${scripts.targetTable}_notify_update AFTER UPDATE ON ${scripts.targetTable} FOR EACH ROW EXECUTE PROCEDURE
    trigger_update_${scripts.targetTable}();
    `
    }
    if (scripts.action.toUpperCase() === 'DELETE') {
      triggers += `
    DROP TRIGGER IF EXISTS ${scripts.targetTable}_notify_delete ON ${scripts.targetTable};
    CREATE TRIGGER ${scripts.targetTable}_notify_delete AFTER DELETE ON ${scripts.targetTable} FOR EACH ROW EXECUTE PROCEDURE
    trigger_delete_${scripts.targetTable}();
    `
    }
  }
  return triggers
}

const buildExecute = (functions: any, triggers: any) => {
  return `
${functions}
${triggers}
`
}

const Create = async (config?: PGSQLTriggers) => {

  const Scan = scanConfig(config)

  if (Scan instanceof Error) return Scan
  if (typeof config === 'undefined') return new Error('invalid config')
  if (typeof config.pool === 'undefined') return new Error('argument pool required')
  if (buildFunctions(config.scripts, config) instanceof Error) return buildFunctions(config.scripts, config)

  const triggersFunctions = buildFunctions(config.scripts, config)
  const triggersScript = buildTriggers(config)

  return new Promise((resolve, reject) => {
    executeQuery(config.pool, buildExecute(triggersFunctions, triggersScript), function (a: any, b: any) {
      if (a) {
        return reject(a)
      }
      return resolve(b)
    })
  }).catch((error) => {
    return error
  })

}

export {
  Create as CreateTriggers, ConfigDB as ConfigTriggerDB
}