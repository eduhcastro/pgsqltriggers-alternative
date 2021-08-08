interface Iscripts {
    /**
     * @param {string} code
     * @description Script for trigger according to PGSQL Trigger Procedures
     */
    code?: string | undefined;
    /**
     * @param {string} action
     * @description Action for trigger
     * @examples INSERT,UPDATE,DELETE
     */
    action?: string | undefined;
    /**
     * @param {string} targetTable
     * @description Target table for trigger
     */
    targetTable: string | undefined;
}
interface PGSQLTriggers {
    /**
     * @argument {string} name
     * @description Add a name for your trigger functions
     */
    name?: string | undefined;
    /**
     * @argument {any} pool
     * @description Add a pool for your database
     */
    pool?: any | undefined;
    /**
     * @argument {string} script
     * @description Add scripts for your trigger functions
     */
    scripts?: Array<Iscripts> | undefined;
    /**
     * @argument {object} scriptOpts
     * @description Options for your extensive script
     */
    scriptsOpts?: {
        /**
         * @argument {boolean} extensive
         * @description Define whether your script is simple or complex code
         * @default false
         */
        extensive: boolean | false;
    } | undefined;
    /**
     * @argument {Array< object >} tables
     * @description Soon.
     */
    tables?: Array<object> | undefined;
    /**
     * @argument {boolean} restrict
     * @description Defines the property level of the query, if true, it will not be possible to override triggers and functions with the same name
     */
    restrict?: boolean | true;
}
export declare const ConfigDB: (data: {
    host: string;
    user: string;
    database: string;
    password: string;
}) => object;
declare const Create: (config?: PGSQLTriggers | undefined) => Promise<unknown>;
export { Create as CreateTriggers, ConfigDB as ConfigTriggerDB };
