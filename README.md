# pgsqltriggers-alternative
Create triggers for your Postgres database in a simple and fast way.

# <h3>Observe</h3>
* Control your trigger creations, with restrict, to replace or not existing triggers
* Customize the function names and their identifiers
* Don't worry, if you try to add a script similar to an existing one, Postgre will warn you!


## In practice

```javascript
const TriggersPG = require('pgsqltriggers-alternative')

(async function() {
try {
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
                targetTable: "users",
                functionName: "updateuserdetails_function",
            },
            {
                code: "DELETE FROM usersdetails WHERE username = OLD.name",
                action: "DELETE",
                targetTable: "users",
                tiggerName: "deleteuserdetails_action"
            }],
        scriptsOpts: {
            extensive: false
        },
        restrict: false
    })
    console.log(create) // Return rows effects
     } catch (e) {
    console.log(e) // thow Error
  }
})()

```

The codes above are directed to actions in the "users" table

## Payload


```javascript
TriggersPG.CreateTriggers({
      pool: any, // new Pool()...
      scripts: [{
       code: string,         // ->  Code query
       action: string,       // ->  INSERT|UPDATE|DELETE,
       targetTable: string,  // ->  Table name corresponding to actions,
       functionName: string, // ->  Optional @default: "trigger_action_targetTable"
       tiggerName: string    // ->  Optional @default: "targetTable_identifytg_action"
       }],
      scriptsOpts: {        // -> Optional
          extensive: false  // -> @default : false | If you want for your own complete query, put it as true
      ,
     restrict: true // -> Optional  @default : true | If true, your code cannot replace existing functions or triggers.
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

## <h4>TiggerName and FunctionName examples</h4>
Now you can customize your tigger's function name and tag!
```javascript
scripts: [{
          code: "INSERT INTO usersdetails (username) VALUES (NEW.name)",
          action: "INSERT",
          targetTable: "users",
          functionName: "mytiggerinsert_function",
          tiggerName: "mytiggerinsert_identifier"
      }],
```
Result: </br>
<img src="https://i.ibb.co/qR07m18/Example.jpg">
