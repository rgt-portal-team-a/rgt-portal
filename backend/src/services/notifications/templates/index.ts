import { User } from "@/entities/user.entity";
import { Post } from "@/entities/post.entity";
import { Project } from "@/entities/project.entity";
import { PtoRequest } from "@/entities/pto-request.entity";
import { Event } from "@/entities/event.entity";
import { NotificationPayload } from "@/dtos/notification.dto";
import { NotificationType } from "@/entities/notification.entity";
import { Department } from "@/entities/department.entity";
import { Employee } from "@/entities/employee.entity";

export class NotificationTemplates {
  static postLiked(sender: User, post: Post): NotificationPayload {
    return {
      type: NotificationType.POST_LIKED,
      recipientId: post.authorId,
      senderId: sender.id,
      title: "New Like on Your Post",
      content: `${sender.username} liked your post`,
      data: {
        postId: post.id,
        postTitle: post.content.substring(0, 50),
      },
    };
  }

  static postCommented(sender: User, post: Post, commentContent: string): NotificationPayload {
    return {
      type: NotificationType.POST_COMMENTED,
      recipientId: post.authorId,
      senderId: sender.id,
      title: "New Comment on Your Post",
      content: `${sender.username} commented on your post: "${commentContent.substring(0, 50)}${commentContent.length > 50 ? "..." : ""}"`,
      data: {
        postId: post.id,
        postTitle: post.content.substring(0, 50),
        commentContent,
      },
    };
  }

  static commentReplied(sender: User, parentCommentAuthorId: number, commentContent: string, postId: number): NotificationPayload {
    return {
      type: NotificationType.COMMENT_REPLIED,
      recipientId: parentCommentAuthorId,
      senderId: sender.id,
      title: "New Reply to Your Comment",
      content: `${sender.username} replied to your comment: "${commentContent.substring(0, 50)}${commentContent.length > 50 ? "..." : ""}"`,
      data: {
        postId,
        commentContent,
      },
    };
  }

  static commentLiked(sender: User, commentAuthorId: number, commentContent: string, postId: number): NotificationPayload {
    return {
      type: NotificationType.COMMENT_LIKED,
      recipientId: commentAuthorId,
      senderId: sender.id,
      title: "New Like on Your Comment",
      content: `${sender.username} liked your comment: "${commentContent.substring(0, 50)}${commentContent.length > 50 ? "..." : ""}"`,
      data: {
        postId,
        commentContent,
      },
    };
  }

  // todo: post comment replies notification to post comment author
  // todo: post comment likes notification to post comment author

  static eventCreated(event: Event, recipientId: number): NotificationPayload {
    return {
      type: NotificationType.EVENT_CREATED,
      recipientId,
      senderId: event.organizer.user.id,
      title: "New Event Created",
      content: `A new event "${event.title}" has been created`,
      data: {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.startTime,
      },
    };
  }

  static eventReminder(event: Event, receipientId: number): NotificationPayload {
    return {
      type: NotificationType.EVENT_REMINDER,
      recipientId: receipientId,
      senderId: event.organizer.user.id,
      title: "Event Reminder",
      content: `Reminder: ${event.title} is coming up soon!`,
      data: {
        eventId: event.id,
        eventTitle: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
      },
    };
  }

  static eventInvitation(event: Event, recipientId: number): NotificationPayload {
    return {
      type: NotificationType.EVENT_INVITATION,
      recipientId,
      senderId: event.organizer.user.id,
      title: "Event Invitation",
      content: `You have been invited to the event "${event.title}"`,
      data: {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.startTime,
      },
    };
  }

  static ptoRequestStatusUpdate(ptoRequest: PtoRequest, updatedBy: User): NotificationPayload {
    const statusText = ptoRequest.status.charAt(0).toUpperCase() + ptoRequest.status.slice(1).toLowerCase();

    return {
      type: NotificationType.PTO_REQUEST_STATUS,
      recipientId: ptoRequest.employee.user.id,
      senderId: updatedBy.employee.user.id,
      title: "PTO Request Status Update",
      content: `Your PTO request has been ${statusText}`,
      data: {
        requestId: ptoRequest.id,
        status: ptoRequest.status,
        startDate: ptoRequest.startDate,
        endDate: ptoRequest.endDate,
      },
    };
  }

  static ptoRequestCreated(ptoRequest: any, recipientId: number): NotificationPayload {
    console.log("PTO Data", ptoRequest);

    return {
      type: NotificationType.PTO_REQUEST_CREATED,
      recipientId,
      senderId: ptoRequest.employee.user.id,
      title: "New PTO Request",
      content: `${ptoRequest.employee.user.username} has submitted a PTO request`,
      data: {
        requestId: ptoRequest.id,
        employeeId: ptoRequest.employee.id,
        employeeName: ptoRequest.employee.user.username,
        startDate: ptoRequest.startDate,
        endDate: ptoRequest.endDate,
        reason: ptoRequest.reason,
      },
    };
  }

  //
  static employeeBirthday(employee: Employee, birthday: Date, recipientId: number): NotificationPayload {
    return {
      type: NotificationType.EMPLOYEE_BIRTHDAY,
      recipientId,
      senderId: employee.user.id,
      title: "Employee Birthday",
      content: `${employee.user.username} has a birthday today. You are receiving this because you have signed up for this. Ignore if you already took an action or wished this employee`,
      data: {
        employeeId: employee.id,
        employeeName: employee.user.username,
        birthday,
      },
    };
  }

  static employeeRecognition(sender: User, recipientId: number, message: string): NotificationPayload {
    return {
      type: NotificationType.EMPLOYEE_RECOGNITION,
      recipientId,
      senderId: sender.id,
      title: "Employee Recognition",
      content: `${sender.username} recognized your work: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`,
      data: {
        message,
      },
    };
  }

  static pollCreated(sender: User, recipientId: number, pollTitle: string, pollId: number): NotificationPayload {
    return {
      type: NotificationType.POLL_CREATED,
      recipientId,
      senderId: sender.id,
      title: "New Poll Created",
      content: `A new poll "${pollTitle}" has been created`,
      data: {
        pollId,
        pollTitle,
      },
    };
  }

  static departmentCreated(department: Department, manager: Employee): NotificationPayload {
    return {
      type: NotificationType.DEPARTMENT_CREATED,
      recipientId: manager.user.id,
      title: "Department Manager Assignment",
      content: `You have been assigned as manager of the new department "${department.name}"`,
      data: {
        departmentId: department.id,
        departmentName: department.name,
        managerId: manager.id,
        managerName: `${manager.firstName} ${manager.lastName}`,
      },
    };
  }

  static departmentAssignment(employee: Employee, department: Department, assignedBy: User): NotificationPayload {
    return {
      type: NotificationType.DEPARTMENT_ASSIGNMENT,
      recipientId: employee.user.id,
      senderId: assignedBy.id,
      title: "Department Assignment",
      content: `You have been assigned to department "${department.name}"`,
      data: {
        departmentId: department.id,
        departmentName: department.name,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
      },
    };
  }

  static departmentRemoval(employee: Employee, department: Department, removedBy: User): NotificationPayload {
    return {
      type: NotificationType.DEPARTMENT_REMOVAL,
      recipientId: employee.user.id,
      senderId: removedBy.id,
      title: "Department Removal",
      content: `You have been removed from department "${department.name}"`,
      data: {
        departmentId: department.id,
        departmentName: department.name,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
      },
    };
  }

  static departmentTransfer(employee: Employee, fromDepartment: Department, toDepartment: Department, transferredBy: User): NotificationPayload {
    return {
      type: NotificationType.DEPARTMENT_TRANSFER,
      recipientId: employee.user.id,
      senderId: transferredBy.id,
      title: "Department Transfer",
      content: `You have been transferred from department "${fromDepartment.name}" to "${toDepartment.name}"`,
      data: {
        fromDepartmentId: fromDepartment.id,
        fromDepartmentName: fromDepartment.name,
        toDepartmentId: toDepartment.id,
        toDepartmentName: toDepartment.name,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
      },
    };
  }
}
