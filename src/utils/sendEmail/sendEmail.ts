import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface IEmail {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export const sendEmail = async ({ to, subject, template, context }: IEmail) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PASS_USER,
    },
  });

  // Verify transporter
  await transporter.verify();

  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        extName: ".hbs",
        defaultLayout: false,
      } as any,
      viewPath: path.join(__dirname, "../../templates"),
      extName: ".hbs",
    })
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    template,
    context,
  } as any;

  await transporter.sendMail(mailOptions);
  console.log(`Email (${template}) sent to ${to}`);
};
