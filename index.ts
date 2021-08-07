import { Pool } from 'pg'

const actions = ['insert', 'update', 'delete']
let myActions = [] as Array < string >

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

const scanConfig = (arrs: any) => {

  if (typeof arrs !== 'object') {
      throw new Error('Expected an object')
  }

  if (typeof arrs.scriptOpts === 'undefined' && typeof arrs.tables === 'undefined') {
      throw new Error('Expected a table or script')
  }

  if (typeof arrs.scriptOpts !== 'undefined' && typeof arrs.script === 'undefined') {
      throw new Error('Expected a script')
  }

  if (typeof arrs.scriptOpts !== 'undefined' && typeof arrs.tables !== 'undefined') {
      throw new Error('The "tables" argument cannot be called along with the "scriptOpts" argument')
  }

  if (typeof arrs.scriptOpts !== 'undefined' && typeof arrs.script !== 'string') {
      throw new Error('Invalid script, put a valid script')
  }

  if (typeof arrs.scriptOpts !== 'undefined' && typeof arrs.script === 'string' && arrs.script.length < 10) {
      throw new Error('Invalid script, put a valid script')
  }

  if (typeof arrs.tables !== 'undefined' && typeof arrs.tables !== 'object') {
      throw new Error('Expected an array object in argument tables')
  }

  if (typeof arrs.scriptOpts !== 'undefined' && typeof arrs.scriptOpts.action !== 'undefined') {

      if (typeof arrs.scriptOpts.action !== 'string') {
          throw new Error('Invalid scriptOpts.action, put a valid scriptOpts.action')
      }

      const action = arrs.scriptOpts.action.split(',')

      if (action.length > 3) {
          throw new Error('Invalid scriptOpts.action, put a valid scriptOpts.action')
      }

      const findActions = actions.filter(action => action === action.toLowerCase())

      if (findActions.length === 0) {
          throw new Error('Invalid scriptOpts.action, put a valid scriptOpts.action')
      }

      myActions = findActions

  }



}


const buildQuery = (data: any, triggers: any): string => {

  if (typeof data.scriptOpts !== 'undefined' && typeof data.script !== 'undefined') {
      return `
    CREATE OR REPLACE FUNCTION table_update_notify() RETURNS trigger AS $$
      ${data.script}
    $$ LANGUAGE plpgsql;
    ${triggers}
  `
  }
  return "any"
}

const buildTriggers = (table: any) => {
  let triggers = ''
  for (let triggerAdd of myActions) {
      if (triggerAdd === 'insert') {
          triggers += `
    DROP TRIGGER IF EXISTS ${table.fromTable}_notify_insert ON ${table.fromTable};
    CREATE TRIGGER ${table.fromTable}_notify_insert AFTER INSERT ON ${table.fromTable} FOR EACH ROW EXECUTE PROCEDURE table_update_notify('${table.id}');
    `
      }
      if (triggerAdd === 'update') {
          triggers += `
    DROP TRIGGER IF EXISTS ${table.fromTable}_notify_update ON ${table.fromTable};
    CREATE TRIGGER ${table.fromTable}_notify_update AFTER UPDATE ON ${table.fromTable} FOR EACH ROW EXECUTE PROCEDURE table_update_notify('${table.id}');
    `
      }
      if (triggerAdd === 'delete') {
          triggers += `
    DROP TRIGGER IF EXISTS ${table.fromTable}_notify_delete ON ${table.fromTable};
    CREATE TRIGGER ${table.fromTable}_notify_delete AFTER DELETE ON ${table.fromTable} FOR EACH ROW EXECUTE PROCEDURE table_update_notify('${table.id}');
    `
      }
  }
  return triggers
}



const Create = async (config: any) => {
  let result;
  try {
      scanConfig(config)
      config.conexao.connect(async function(err: any, client: any, release: any) {
          release()
          if (err) {
              throw (err)
          }
          const triggers = buildTriggers(config.scriptOpts)
          await client.query(buildQuery(config, triggers))
      })
      result = {
          status: true,
          message: `Table ${config.scriptOpts.fromTable} done`
      }
  } catch (err) {
      result = {
          status: false,
          message: `error`
      }
      throw Error(err)
  } finally {
      return result
  }

}

export {Create as CreateTriggers, ConfigDB as ConfigTriggerDB}