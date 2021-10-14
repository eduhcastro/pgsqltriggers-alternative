import {ConfigTriggerDB, CreateTriggers} from "../index"

import {Pool} from "pg"
;(async function () {
  try {
    const ConfigDB = (data: {host: string; user: string; database: string; password: string}): object => {
      if (!data.user && !data.password && !data.host && !data.database) {
        throw new Error("config is invalid")
      }
      return new Pool(data)
    }

    const CreateTables = async (pool: any, query: any, callback: any) => {
      await pool.connect(function (err: Error, client: any, release: any) {
        if (err) {
          return callback(err)
        }
        client.query(query, function (err: Error, result: any) {
          if (err) {
            return callback(err)
          }
          release()
          return callback(err, result)
        })
      })
    }

    const database = {
      host: "localhost",
      user: "postgres",
      database: "travis_ci_test",
      password: "123456",
    }

    const conexao = ConfigTriggerDB(database)

    CreateTables(
      ConfigDB(database),
      `CREATE TABLE IF NOT EXISTS table_a (id bigserial primary key, name varchar(20));
         CREATE TABLE IF NOT EXISTS table_b (id bigserial primary key, account_name varchar(20));`,
      async function (a: any, b: any) {
        if (a) {
          console.log("ERROR:" + a)
        }
        const create = await CreateTriggers({
          pool: conexao,
          scripts: [
            {
              code: "INSERT INTO table_b (account_name) VALUES (NEW.name)",
              action: "INSERT",
              targetTable: "table_a",
              functionName: "mytriggerinsert_function",
              triggerName: "mytriggerinsert_identifier",
            },
          ],
          scriptsOpts: {
            extensive: false,
          },
          restrict: true,
        })
        console.log({create})
      },
    )
  } catch (e) {
    console.log("ERROR:" + e)
  }
})()
