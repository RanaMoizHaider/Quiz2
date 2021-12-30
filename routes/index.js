import TasksController from '../controllers/TasksController';

var express = require('express');
var router = express.Router();

router.route("/").get(TasksController.apiGetTasks)
router.route("/task/:id").get(TasksController.apiGetTaskById)

router
  .route("/")
  .post(TasksController.apiPostTask)
  .put(TasksController.apiUpdateTask)
  .delete(TasksController.apiDeleteTask)

module.exports = router;
