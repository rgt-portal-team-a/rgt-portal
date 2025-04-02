import { NotificationPayload } from "@/dtos/notification.dto";
import { MailService } from "@/services/mail.service";
import { UserService } from "@/services/user.service";
import { NotificationChannel } from "./interface";
import { NotificationType } from "@/entities/notification.entity";

export class EmailNotificationChannel implements NotificationChannel {
  private mailService: MailService;
  private userService: UserService;

  constructor() {
    this.mailService = new MailService();
    this.userService = new UserService();
  }

  async sendNotification(notification: NotificationPayload): Promise<void> {
    const recipient = await this.userService.findById(notification.recipientId);
    if (!recipient || !recipient.email) return;

    const companyName = process.env.COMPANY_NAME || "RGT Portal";

    await this.mailService.sendMail({
      to: recipient.email,
      from: `"${companyName}" <${process.env.SMTP_FROM_EMAIL}>`,
      subject: notification.title,
      html: this.createEmailTemplate(notification),
    });
  }

  private createEmailTemplate(notification: NotificationPayload): string {
    const baseTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-top: 0;">${notification.title}</h2>
          <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
        </div>
        <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
          <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    switch (notification.type) {
      case NotificationType.POLL_CREATED:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">New Poll: ${notification.title}</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              ${
                notification.data?.options
                  ? `
                <div style="margin-top: 20px;">
                  <h3 style="color: #2c3e50;">Poll Options:</h3>
                  <ul style="list-style-type: none; padding-left: 0;">
                    ${notification.data.options
                      .map(
                        (option: any) => `
                      <li style="padding: 10px; background-color: #fff; margin-bottom: 5px; border-radius: 3px; border: 1px solid #e0e0e0;">
                        ${option.text}
                      </li>
                    `,
                      )
                      .join("")}
                  </ul>
                </div>
              `
                  : ""
              }
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      case NotificationType.EVENT_CREATED:
      case NotificationType.EVENT_INVITATION:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">${notification.title}</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              ${
                notification.data?.event
                  ? `
                <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                  <p><strong>Date:</strong> ${new Date(notification.data.event.date).toLocaleString()}</p>
                  <p><strong>Location:</strong> ${notification.data.event.location || "TBD"}</p>
                  <p><strong>Description:</strong> ${notification.data.event.description || "No description provided"}</p>
                </div>
              `
                  : ""
              }
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      case NotificationType.PTO_REQUEST_STATUS:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">PTO Request Update</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              ${
                notification.data?.request
                  ? `
                <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                  <p><strong>Status:</strong> ${notification.data.request.status}</p>
                  <p><strong>Start Date:</strong> ${new Date(notification.data.request.startDate).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> ${new Date(notification.data.request.endDate).toLocaleDateString()}</p>
                  <p><strong>Type:</strong> ${notification.data.request.type}</p>
                </div>
              `
                  : ""
              }
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      case NotificationType.EMPLOYEE_RECOGNITION:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">Employee Recognition</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              ${
                notification.data?.recognition
                  ? `
                <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                  <p><strong>Category:</strong> ${notification.data.recognition.category}</p>
                  <p><strong>Given By:</strong> ${notification.data.recognition.givenBy}</p>
                  <p><strong>Date:</strong> ${new Date(notification.data.recognition.date).toLocaleDateString()}</p>
                </div>
              `
                  : ""
              }
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      case NotificationType.POST_LIKED:
      case NotificationType.POST_COMMENTED:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">${notification.title}</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              ${
                notification.data?.post
                  ? `
                <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                  <p style="font-style: italic;">"${notification.data.post.content}"</p>
                  <p style="color: #7f8c8d; font-size: 14px;">Posted by ${notification.data.post.author}</p>
                </div>
              `
                  : ""
              }
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      case NotificationType.COMMENT_REPLIED:
      case NotificationType.COMMENT_LIKED:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">${notification.title}</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                <p style="font-style: italic;">"${notification.data?.commentContent || "Your comment"}"</p>
                <a href="/post/${notification.data?.postId}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; margin-top: 10px;">View Post</a>
              </div>
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      case NotificationType.PROJECT_ASSIGNMENT:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">Project Assignment</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              ${
                notification.data?.project
                  ? `
                <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                  <p><strong>Project Name:</strong> ${notification.data.project.name}</p>
                  <p><strong>Role:</strong> ${notification.data.project.role}</p>
                  <p><strong>Start Date:</strong> ${new Date(notification.data.project.startDate).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> ${notification.data.project.endDate ? new Date(notification.data.project.endDate).toLocaleDateString() : "Ongoing"}</p>
                </div>
              `
                  : ""
              }
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      case NotificationType.DEPARTMENT_ASSIGNMENT:
      case NotificationType.DEPARTMENT_REMOVAL:
      case NotificationType.DEPARTMENT_TRANSFER:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">${notification.title}</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              ${
                notification.data
                  ? `
                <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                  ${
                    notification.type === NotificationType.DEPARTMENT_TRANSFER
                      ? `
                    <p><strong>From Department:</strong> ${notification.data.fromDepartmentName}</p>
                    <p><strong>To Department:</strong> ${notification.data.toDepartmentName}</p>
                  `
                      : `
                    <p><strong>Department:</strong> ${notification.data.departmentName}</p>
                  `
                  }
                  <p><strong>Employee:</strong> ${notification.data.employeeName}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
              `
                  : ""
              }
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      case NotificationType.PTO_REQUEST_CREATED:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">New PTO Request</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              ${
                notification.data
                  ? `
                <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                  <p><strong>Employee:</strong> ${notification.data.employeeName}</p>
                  <p><strong>Start Date:</strong> ${new Date(notification.data.startDate).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> ${new Date(notification.data.endDate).toLocaleDateString()}</p>
                  <p><strong>Type:</strong> ${notification.data.type}</p>
                  <p><strong>Reason:</strong> ${notification.data.reason || "No reason provided"}</p>
                  <a href="/pto-requests/${notification.data.requestId}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; margin-top: 10px;">View Request</a>
                </div>
              `
                  : ""
              }
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      case NotificationType.DEPARTMENT_CREATED:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">${notification.title}</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              ${
                notification.data
                  ? `
                <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                  <p><strong>Department Name:</strong> ${notification.data.departmentName}</p>
                  <p><strong>Manager Name:</strong> ${notification.data.managerName}</p>
                  <p><strong>Date Created:</strong> ${new Date().toLocaleDateString()}</p>
                  <a href="/departments/${notification.data.departmentId}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; margin-top: 10px;">View Department</a>
                </div>
              `
                  : ""
              }
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      case NotificationType.EMPLOYEE_BIRTHDAY:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="color: #2c3e50; margin-top: 0;">${notification.title}</h2>
              <p style="color: #34495e; line-height: 1.6;">${notification.content}</p>
              ${
                notification.data
                  ? `
                <div style="margin-top: 20px; background-color: #fff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                  <p><strong>Employee Name:</strong> ${notification.data.employeeName}</p>
                  <p><strong>Birthday:</strong> ${new Date(notification.data.birthday).toLocaleDateString()}</p>
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="/employees/${notification.data.employeeId}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px;">View Employee Profile</a>
                  </div>
                </div>
              `
                  : ""
              }
            </div>
            <div style="color: #7f8c8d; font-size: 12px; text-align: center; margin-top: 20px;">
              <p>This is an automated message from RGT Portal. Please do not reply to this email.</p>
            </div>
          </div>
        `;

      default:
        return baseTemplate;
    }
  }
}
