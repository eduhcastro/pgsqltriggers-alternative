# pgsqltriggers-alternative
Create triggers for your Postgres database in a simple and fast way.

## In practice

```javascript
const TriggersPG = require('pgsqltriggers-alternative')

(async function() {

  const database = {
      host: 'HOST',
      user: 'USER',
      database: 'DATABASE',
      password: 'MYPASSWORD'
  }

  const conexao = TriggersPG.ConfigTriggerDB(database)

  const create = await TriggersPG.CreateTriggers({
      conexao,
      script: `BEGIN
  INSERT INTO users_details (username) VALUES (NEW.name);
  RETURN NULL;
  END;`,
      scriptOpts: {
          action: 'insert,update',
          fromTable: 'users'
      }
  })
  console.log(create) 
  /**
    * Return
    * {status: boolean, msg...}
    */
})()

```

When the users table receives an Update or an Insert, the users_details table will receive the new value "name"

## Payload


```javascript
TriggersPG.CreateTriggers({
      conexao: any, // new Pool()...
      script: string // code
      scriptOpts: {
          action: 'insert or update or delete', // separate by commas
          fromTable: 'users' // action table
      }
  })
```

