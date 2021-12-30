import TaskDb from "../db/TaskDb";

export default class TasksController {
    static async apiPostTask(req, res, next) {
        try {
            const userId = req.body.user_id
            const task = req.body.task
            const duedate = req.body.date
            const status = req.body.status
            const lastupdate = new Date()
            const creationdate = new Date()

            const TaskResponse = await TaskDb.addTask(
                userId,
                task,
                duedate,
                status,
                lastupdate,
                creationdate
            )
            res.json({ status: "success" })
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    }

    static async apiUpdateTask(req, res, next) {
        try {
            const taskId = req.body.task_id
            const userId = req.body.user_id
            const task = req.body.task
            const duedate = req.body.date
            const status = req.body.status
            const lastupdate = new Date()

            const taskResponse = await TaskDb.updateTask(
                taskId,
                userId,
                task,
                duedate,
                status,
                lastupdate
            )

            var { error } = taskResponse
            if (error) {
                res.status(400).json({ error })
            }

            if (taskResponse.modifiedCount === 0) {
                throw new Error(
                    "unable to update task - user may not be original poster",
                )
            }

            res.json({ status: "success" })
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    }

    static async apiDeleteTask(req, res, next) {
        try {
            const taskId = req.query.task_id
            const userId = req.body.user_id
            console.log(taskId)
            const taskResponse = await TaskDb.deleteTask(
                taskId,
                userId,
            )
            res.json({ status: "success" })
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    }

    static async apiGetTasks(req, res, next) {
        const tasksPerPage = req.query.tasksPerPage ? parseInt(req.query.tasksPerPage, 10) : 20
        const page = req.query.page ? parseInt(req.query.page, 10) : 0
        const userId = req.body.user_id
        let filters = {}
        if (req.query.task) {
            filters.task = req.query.task
        } else if (req.query.status) {
            filters.status = req.query.status
        }

        const { tasksList, totalNumTasks } = await TaskDb.getTasks({
            filters,
            page,
            tasksPerPage,
            userId
        })

        let response = {
            tasks: tasksList,
            page: page,
            filters: filters,
            entries_per_page: tasksPerPage,
            total_results: totalNumTasks,
        }
        res.json(response)
    }
    static async apiGetTaskById(req, res, next) {
        const userId = req.body.user_id
        try {
            let id = req.params.id || {}
            let task = await TaskDb.getTaskByID(id, userId)
            if (!task) {
                res.status(404).json({ error: "Not found" })
                return
            }
            res.json(task)
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

}
