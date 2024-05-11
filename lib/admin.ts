import {auth} from "@clerk/nextjs"; 
// you can add all users Id that are Admins : 
const adminIds=[
    "user_2fpuE6e5Rxs6KMpbSzVB4ws2yEK" // souha Garfa 
]
export const isAdmin = () => {
    const { userId } = auth () ; 
    if (!userId) {
        return false;
    }

    return adminIds.indexOf(userId) !== -1 ; 

}