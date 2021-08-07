export declare const ConfigDB: (data: {
    host: string;
    user: string;
    database: string;
    password: string;
}) => object;
declare const Create: (config: any) => Promise<{
    status: boolean;
    message: string;
} | undefined>;
export { Create as CreateTriggers, ConfigDB as ConfigTriggerDB };
