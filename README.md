# pgsqltriggers-alternative
Create triggers for your Postgres database in a simple and fast way.

## In practice

```javascript
const TriggersPG = require('pgsqltriggers-alternative')

(async function() {

    const database = {
        host: 'HOST',
        user: 'USER',
        database: 'DATA',
        password: 'PASS'
    }

    const connect = TriggersPG.ConfigTriggerDB(database)

    const create = await TriggersPG.CreateTriggers({
        pool: connect,
        scripts: [{
                code: "INSERT INTO usersdetails (username) VALUES (NEW.name)",
                action: "INSERT",
                targetTable: "users"
            }, {
                code: "UPDATE usersdetails SET username = NEW.name WHERE username = OLD.name",
                action: "UPDATE",
                targetTable: "users"
            },
            {
                code: "DELETE FROM usersdetails WHERE username = OLD.name",
                action: "DELETE",
                targetTable: "users"
            }],
        scriptsOpts: {
            extensive: false
        },
        restrict: false
    })
    console.log(create) // Return rows effects
})()

```

The codes above are directed to actions in the "users" table

## Payload


```javascript
TriggersPG.CreateTriggers({
      pool: any, // new Pool()...
      scripts: [{
       code: string,        // -> Code query
       action: string,      // -> INSERT|UPDATE|DELETE,
       targetTable: string  // -> Table name corresponding to actions
       }],
      scriptsOpts: {        // -> Optional
          extensive: false  // -> @default : false | If you want for your own complete query, put it as true
      ,
     restrict: true // -> Optional  @default : true | If true, your code cannot overwrite existing functions
  })
```

## <h4>Extensive examples</h4>
<span>True:</span>
```javascript
{ code: `CREATE FUNCTION trigger_function_name() RETURNS event_trigger AS $$
      BEGIN
        RAISE NOTICE 'funtion: % %', tg_event, tg_tag;
         END;
      $$ LANGUAGE plpgsql;` ...}
```
<span>False:</span>
```javascript
{ code: "INSERT INTO usersdetails (username) VALUES (NEW.name)" ...}
```
When the value is false your code is embedded in a ready-to-run query
