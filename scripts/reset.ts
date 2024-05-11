import "dotenv/config"
import { drizzle } from "drizzle-orm/neon-http"
import {neon} from "@neondatabase/serverless"

import * as schema from"../db/schema"; 

const sql = neon (process.env.DATABASE_URL!)
const db =drizzle (sql, {schema}); 
// seeding the DB Script : Seeding the database allows you to 
//insert this initial data programmatically,
// rather than manually entering it each time.
const main = async () => {
    try {
        console.log("Resetting the Database"); 

        await db.delete(schema.courses);
        await db.delete(schema.userProgress);
        await db.delete(schema.units);
        await db.delete(schema.lessons);
        await db.delete(schema.challenges);
        await db.delete(schema.challengeProgress);


        console.log("Resetting finished"); 


    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to reset the DataBase ");
        

    }
} ; 

main(); // call the function main()