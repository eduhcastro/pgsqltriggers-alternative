import {
  ConfigTriggerDB,
  CreateTriggers
} from '../index'

(async function() {

  const database = {
      host: 'localhost',
      user: 'postgres',
      database: 'Teste',
      password: '123456'
  }

  const conexao = ConfigTriggerDB(database)


  const create = await CreateTriggers({
      pool: conexao,
      scripts: [{
          code: "INSERT INTO usersdetails (username) VALUES (NEW.name)",
          action: "INSERT",
          targetTable: "users"
      }],
      scriptsOpts: {
          extensive: false
      },
      restrict: true
  })
  console.log(create)
})()