import {
  ConfigTriggerDB,
  CreateTriggers
} from "../../index"

(async function () {
  try {

    const database = {
      host: "localhost",
      user: "postgres",
      database: "mydatabase",
      password: "123456",
    }

    const connect = ConfigTriggerDB(database)

    const createTrigger = await CreateTriggers({
      pool: connect,
      scripts: [
        {
        code: "INSERT INTO table_b (account_name) VALUES (NEW.name)",
        action: "INSERT",
        targetTable: "table_a",
        },
        {
        code: "INSERT INTO table_c (old_name) VALUES (NEW.name)",
        action: "INSERT",
        targetTable: "table_b",
        }
      ],
      scriptsOpts: {
        extensive: false,
      },
      restrict: true,
    })
    console.log({
      createTrigger
    })
  } catch (e) {
    console.log("ERROR:" + e)
  }
})()