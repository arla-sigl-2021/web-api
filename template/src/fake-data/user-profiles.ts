export type UserProfile = {
    id: string;
    username: string;
    job: string;
}

export const allUserProfiles: UserProfile[] = [
    {
        id: 'U-1',
        username: 'florent.fauchille',
        job: 'developer'
    },
    {
        id: 'U-2',
        username: 'lucas.boisserie',
        job: 'devops'
    }
]