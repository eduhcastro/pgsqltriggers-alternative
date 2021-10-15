import { Pool } from 'pg'

const actions = ['INSERT', 'UPDATE', 'DELETE']
const params = ["action", "code", "targetTable"]

interface Iscripts {
    /**
     * @param {string} code
     * @description Script for trigger according to PGSQL Trigger Procedures
     */
    code: string | undefined

    /**
     * @param {string} action
     * @description Action for trigger
     * @examples INSERT,UPDATE,DELETE
     */
    action: string | undefined

    /**
     * @param {string} targetTable
     * @description Target table for trigger
     */
    targetTable: string | undefined

    /**
     * @param {string} functionName
     * @description Name of the function
     * @examples myfunction_trigger_insert, myfunction_trigger_update, myfunction_trigger_delete
     */
    functionName?: string | undefined

    /**
     * @param {string} triggerName
     * @description Name of the trigger
     * @examples mytrigger_insert, mytrigger_update, mytrigger_delete
     */
    triggerName?: string | undefined

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
        throw Error('config is undefined')
    }

    if (typeof arrs.pool === 'undefined') {
        throw Error('argument pool required')
    }

    if (typeof arrs !== 'object') {
        throw Error('Expected an object')
    }

    if (typeof arrs.scriptsOpts === 'undefined' && typeof arrs.tables === 'undefined') {
        throw Error('Expected a table or scripts')
    }

    if (typeof arrs.scripts !== 'undefined') {

        if (typeof arrs.tables !== 'undefined') {
            throw Error('It is not possible to use a script and option tables at the same time')
        }

        if (typeof arrs.scripts !== 'object') {
            throw Error('Expected an object in scripts')
        }

        if (arrs.scripts.length === 0) {
            throw Error('Expected at least one script')
        }

        arrs.scripts.map(teste => {
            for (let arr of params) {
                if (Object.keys(teste).indexOf(arr) === -1) throw Error('The parameter is missing : ' + arr + ' in ' + JSON.stringify(teste))
            }
            return true
        })

    }

    if (typeof arrs.tables !== 'undefined' && typeof arrs.tables !== 'object') {
        throw Error('Expected an array object in argument tables')
    }

}

const customFunctionName = (c: any, name: any) => {
    if (typeof c === 'undefined') return `${name}`
    if (String(c).length < 1) throw Error('Invalid custom function name')
    return c
}

const customTriggerName = (c: any, name: any) => {
    if (typeof c === 'undefined') return `${name}`
    if (String(c).length < 1) throw Error('Invalid custom trigger name')
    return c
}




const ConfigDB = (data: {
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

        if (actions.indexOf(script.action.toUpperCase()) === -1) throw Error("Invalid action : " + script.action)
        if (!type) {
            scriptReturn += `${restrict} FUNCTION ${customFunctionName(script.functionName, 'trigger_' + script.action.toLowerCase() + '_' + script.targetTable)}() RETURNS trigger AS $$
            BEGIN
            ${script.code};
            RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;`
        } else {
            scriptReturn += script.code
        }

    }
    return scriptReturn as string
}

const buildTriggers = (opts?: any) => {

    if (typeof opts === 'undefined') throw Error('Invalid build triggers arguments')
    if (typeof opts.scripts === 'undefined') return
    let triggers = ''

    const restrict = (r: boolean, scripts: any, iden: string) => {
        if (r) {
            return `DROP TRIGGER IF EXISTS ${customTriggerName(scripts.triggerName, scripts.targetTable + iden)} ON ${scripts.targetTable};`
        }
        return ''
    }

    if (!opts.scriptsOpts.extensive) {
        for (let scripts of opts.scripts) {

            if (scripts.action.toUpperCase() === 'INSERT') {
                triggers += `${restrict(scripts.restrict, scripts, '_identifytg_insert')}
            CREATE TRIGGER ${customTriggerName(scripts.triggerName, scripts.targetTable + '_identifytg_insert')} AFTER INSERT ON ${scripts.targetTable} FOR EACH ROW EXECUTE PROCEDURE
            ${customFunctionName(scripts.functionName, 'trigger_insert_' + scripts.targetTable)}();`
            }

            if (scripts.action.toUpperCase() === 'UPDATE') {
                triggers += `${restrict(scripts.restrict, scripts, '_identifytg_update')}
            CREATE TRIGGER ${customTriggerName(scripts.triggerName, scripts.targetTable + '_identifytg_update')} AFTER UPDATE ON ${scripts.targetTable} FOR EACH ROW EXECUTE PROCEDURE
            ${customFunctionName(scripts.functionName, 'trigger_update_' + scripts.targetTable)}();`
            }

            if (scripts.action.toUpperCase() === 'DELETE') {
                triggers += `${restrict(scripts.restrict, scripts, '_identifytg_delete')}
            CREATE TRIGGER ${customTriggerName(scripts.triggerName, scripts.targetTable + '_identifytg_delete')} AFTER DELETE ON ${scripts.targetTable} FOR EACH ROW EXECUTE PROCEDURE
            ${customFunctionName(scripts.functionName, 'trigger_delete_' + scripts.targetTable)}();`
            }
        }
    }
    return triggers
}

const buildPrepare = (functions: any, triggers: any) => {
    console.log({
        functions,
        triggers
    })
    return `
    ${functions}
    ${triggers}`
}

const Create = async (config: PGSQLTriggers) => {

    /**
     * Checking if all parameters were filled in correctly.
     */
    scanConfig(config)


    const triggersFunctions = buildFunctions(config.scripts, config)
    const triggersScript = buildTriggers(config)

    return new Promise((resolve, reject) => {
        executeQuery(config.pool, buildPrepare(triggersFunctions, triggersScript), function (a: any, b: any) {
            if (a) {
                return reject(a)
            }
            return resolve(b)
        })
    }).catch(e => {
        throw Error(e)
    })

}
export {
    Create as CreateTriggers, ConfigDB as ConfigTriggerDB
}