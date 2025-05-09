export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

export const AvailableTaskStatuses = Object.values(TaskStatusEnum);

export const ProjectStatusEnum = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
};

export const AvailableProjectStatuses = Object.values(ProjectStatusEnum);

export const ProjectPriorityEnum = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export const AvailableProjectPriorities = Object.values(ProjectPriorityEnum);

export const ProjectVisibilityEnum = {
  PUBLIC: "public",
  PRIVATE: "private",
  TEAM: "team",
};

export const AvailableProjectVisibilities = Object.values(
  ProjectVisibilityEnum,
);

export const BoardNameEnum = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const AvailableBoardNames = Object.values(BoardNameEnum);

export const BoardToTaskStatusMap = {
  [BoardNameEnum.TODO]: TaskStatusEnum.TODO,
  [BoardNameEnum.IN_PROGRESS]: TaskStatusEnum.IN_PROGRESS,
  [BoardNameEnum.DONE]: TaskStatusEnum.DONE,
};

export const SubtaskPriorityEnum = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export const AvailableSubtaskPriorities = Object.values(SubtaskPriorityEnum);

export const NoteVisibilityEnum = {
  PUBLIC: "public",
  PRIVATE: "private",
};

export const AvailableNoteVisibilities = Object.values(NoteVisibilityEnum);
