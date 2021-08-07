import { ConfigTriggerDB, CreateTriggers } from './'

(async function() {

  const database = {
      host: 'localhost',
      user: 'postgres',
      database: 'Teste',
      password: '123456'
  }

  const conexao = ConfigTriggerDB(database)

  const create = await CreateTriggers({
      conexao,
      script: `BEGIN
  INSERT INTO usersdetails (usery) VALUES (NEW.name);
  RETURN NULL;
  END;`,
      scriptOpts: {
          action: 'insert,update',
          fromTable: 'users'
      }
  })
  console.log(create)
})()


