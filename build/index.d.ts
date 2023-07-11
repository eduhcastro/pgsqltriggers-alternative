/**
 * Interface for defining trigger scripts.
 */
interface IScript {
    /**
     * Script code for the trigger according to PGSQL Trigger Procedures.
     */
    code: string | undefined;
    /**
     * Action for the trigger.
     * Valid actions are INSERT, UPDATE, DELETE.
     */
    action: string | undefined;
    /**
     * Target table for the trigger.
     */
    targetTable: string | undefined;
    /**
     * Optional name of the function.
     */
    functionName?: string | undefined;
    /**
     * Optional name of the trigger.
     */
    triggerName?: string | undefined;
}
/**
 * Interface for PGSQL Triggers configuration.
 */
interface PGSQLTriggers {
    /**
     * Add a name for your trigger functions.
     */
    name?: string | undefined;
    /**
     * Add a pool for your database.
     */
    pool?: any | undefined;
    /**
     * Add scripts for your trigger functions.
     */
    scripts?: Array<IScript> | undefined;
    /**
     * Options for your extensive script.
     */
    scriptsOpts?: {
        /**
         * Define whether your script is simple or complex code.
         * Default is false.
         */
        extensive: boolean | false;
    } | undefined;
    /**
     * Soon.
     */
    tables?: Array<object> | undefined;
    /**
     * Defines the property level of the query.
     * If true, it will not be possible to override triggers and functions with the same name.
     */
    restrict?: boolean | true;
}
/**
 * Configures the database connection pool.
 * @param data Configuration data for the database connection.
 * @returns Database connection pool object.
 * @throws Error if the configuration data is invalid.
 */
declare const ConfigDB: (data: {
    host: string;
    user: string;
    database: string;
    password: string;
}) => object;
/**
 * Creates triggers in the database based on the provided configuration.
 * @param config Configuration for creating triggers.
 * @returns Promise that resolves when the triggers are created successfully.
 * @throws Error if any required parameter is missing or if an error occurs during execution.
 */
declare const Create: (config: PGSQLTriggers) => Promise<unknown>;
export { Create as CreateTriggers, ConfigDB as ConfigTriggerDB };
