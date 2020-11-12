import {Pool, QueryResult} from 'pg';

export type HelpRequest = {
    help_request_id: number;
    owner_id: number;
    owner_username: string;
    title: string;
    details: string;
    city: string;
    country: string;
}
/**
 * Connects to your Postgres database.
 * RDS stands for Relational Database System, which is a common designation
 * for SQL database like Postgres.
 */
export namespace RDS {
    // Create a pool of connection;
    // to control number of concurrent connections.
    // We leave default values for now.
    const pool = new Pool({
        host: "localhost",
        port: 5432,
        database: "arlaide",
        user: "sigl2021",
        password: "sigl2021"
    });

    // Handler method to perform any kind of query 
    // to your database
    const query = async <T>(sql: string): Promise<T[]> => {
        let result: QueryResult<T>;
        
        // Get the next connection available in the pool
        const client = await pool.connect()
       
        result = await client.query<T>(sql)
        
        // release the connection
        client.release();
        return result.rows;
    }
    
    /**
     * Get next 
     * @param page page number of help requests we want to query
     * @param limit the size of the page of help requests we want to query
     */
    export const getHelpRequests = async (page: number, limit: number) => {
        const helpRequests: HelpRequest[] = await query<HelpRequest>(`
            SELECT * FROM help_requests_owners
            LIMIT ${limit} OFFSET ${page};
        `)

        return helpRequests;
    }
}