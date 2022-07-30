import { MongoClient } from "mongodb"

export default async function (connectionString, app) {
    const client = new MongoClient(connectionString)
    try {
        await client.connect()
        app.locals.db = client.db("mern-firebase")
        console.log("++ Database connected.")
    } catch (error) {
        await client.close()
        console.log(error)
        throw new Error("Database connection error.")
    }
}