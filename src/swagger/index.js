import { authSwagger } from "./auth.swagger.js";
import { projectSwagger } from "./project.swagger.js";
import { taskSwagger } from "./task.swagger.js";
import { boardSwagger } from "./board.swagger.js";
import { noteSwagger } from "./note.swagger.js";
import { subtaskSwagger } from "./subtask.swagger.js";
import { healthcheckSwagger } from "./healthcheck.swagger.js";

export const customSwaggerPaths = {
  ...healthcheckSwagger,
  ...authSwagger,
  ...projectSwagger,
  ...taskSwagger,
  ...boardSwagger,
  ...subtaskSwagger,
  ...noteSwagger,
};
