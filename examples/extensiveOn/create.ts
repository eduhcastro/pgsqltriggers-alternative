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
        code: `CREATE OR REPLACE FUNCTION trigger_extensive_on() RETURNS trigger AS $$
          BEGIN
            INSERT INTO table_b (account_name) VALUES (NEW.name);
            RETURN NULL;
          END
          $$ LANGUAGE plpgsql;
          CREATE TRIGGER mytrigger_teste AFTER INSERT ON table_a FOR EACH ROW EXECUTE PROCEDURE trigger_extensive_on();`,
        action: "INSERT",
        targetTable: "table_a",
        }
      ],
      scriptsOpts: {
        extensive: true,
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