import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import { ApiError } from "../utils/api-error.js";

const sendMail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://myapp.com/",
    },
  });

  const emailText = mailGenerator.generatePlaintext(options.mailGenContent);
  const emailHtml = mailGenerator.generate(options.mailGenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAILTRAP_SMTP_USER, // generated ethereal user
      pass: process.env.MAILTRAP_SMTP_PASS, // generated ethereal password
    },
  });

  // send mail with defined transport object
  const mailOptions = {
    from: process.env.MAIL_FROM, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: emailText, // plain text body
    html: emailHtml, // html body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(
      "There was an error sending the email. Please try again later.",
      500,
      "EmailError",
    );
  }
};

const emailVerificationMailGenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Task Manager!",
      action: {
        instructions:
          "To get started with Task Manager, please verify your email address by clicking the button below:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your email address",
          link: verificationUrl,
        },
      },
      outro: "If you did not create an account, no further action is required.",
    },
  };
};

const passwordResetMailGenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "You have requested to reset your password.",
      action: {
        instructions: "To reset your password, please click the button below:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset your password",
          link: passwordResetUrl,
        },
      },
      outro:
        "If you did not request a password reset, no further action is required.",
    },
  };
};

// sendMail({
//   email: user.email,
//   subject: "Verify your email address",
//   mailGenContent: emailVerificationMailGenContent(
//     user.username,
//     verificationUrl,
//   ),
// })
//   .then(() => {
//     console.log("Email sent successfully!");
//   })
//   .catch((error) => {
//     console.error("Error sending email:", error);
//   });

export {
  sendMail,
  emailVerificationMailGenContent,
  passwordResetMailGenContent,
};
