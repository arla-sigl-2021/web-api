import {allHelpRequests, HelpRequest} from './fake-data/help-requests';

/**
 * Fake database, since we don't want to set any real database yet.
 * This will be subject of next workshop
 */
export namespace FakeDB {
    // Private base help requests. This is restore
    // on each start of the API.
    var helpRequests: HelpRequest[] = allHelpRequests; 

    // takes a slice of the help requests, based on page and limit offsets
    export const getHelpRequest = (page: number, limit: number) => {
        const start = (page - 1) * limit;
        const end = start + limit;

        return helpRequests.slice(start, end)
    }
    
}