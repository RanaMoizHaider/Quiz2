var mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId

let tasks

export default class TaskDb {
    static async injectDB(conn) {
        if (tasks) {
            return
        }
        try {
            tasks = await conn.db("todo").collection("tasks")
        } catch (e) {
            console.error(`Unable to establish collection handles in userdb: ${e}`)
        }
    }

    static async addTask(userId, task, duedate, status, lastupdate, creationdate) {
        try {
            const taskDoc = {
                user_id: userId,
                task: task,
                duedate: duedate,
                status: status,
                lastupdate: lastupdate,
                creationdate: creationdate
            }

            return await tasks.insertOne(taskDoc)
        } catch (e) {
            console.error(`Unable to post task: ${e}`)
            return { error: e }
        }
    }

    static async updateTask(taskId, userId, task, duedate, status, lastupdate) {
        try {
            const updateResponse = await tasks.updateOne(
                { user_id: userId, _id: ObjectId(taskId) },
                { $set: { task: task, duedate: duedate, status: status, lastupdate: lastupdate } },
            )

            return updateResponse
        } catch (e) {
            console.error(`Unable to update task: ${e}`)
            return { error: e }
        }
    }

    static async deleteTask(taskId, userId) {

        try {
            const deleteResponse = await tasks.deleteOne({
                _id: ObjectId(taskId),
                user_id: userId,
            })

            return deleteResponse
        } catch (e) {
            console.error(`Unable to delete task: ${e}`)
            return { error: e }
        }
    }

    static async getTasks({
        filters = null,
        page = 0,
        tasksPerPage = 20,
        userId
    } = {}) {
        let query
        if (filters) {
            if ("task" in filters) {
                query = { $text: { $search: filters["task"] }, user_id: userId }
            } else if ("status" in filters) {
                query = { "status": { $eq: filters["status"] } }
            }
        }

        let cursor

        try {
            cursor = await tasks
                .find(query)
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return { tasksList: [], totalNumTasks: 0 }
        }

        const displayCursor = cursor.limit(tasksPerPage).skip(tasksPerPage * page)

        try {
            const tasksList = await displayCursor.toArray()
            const totalNumTasks = await tasks.countDocuments(query)

            return { tasksList, totalNumTasks }
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents, ${e}`,
            )
            return { tasksList: [], totalNumTasks: 0 }
        }
    }
    static async getTaskByID(id, userId) {
        try {
            const pipeline = [
                {
                    $match: {
                        _id: new ObjectId(id),
                        user_id: userId
                    },
                },
            ]
            return await tasks.aggregate(pipeline).next()
        } catch (e) {
            console.error(`Something went wrong in getTaskByID: ${e}`)
            throw e
        }
    }
}