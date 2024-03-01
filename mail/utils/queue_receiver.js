const amqp = require("amqplib");
const { queue_url } = require("../config/config");
const prisma = require("./prisma");
const nodemailer = require("nodemailer");

const receiveFromQueue = async (queue, exchange, callback) => {
  console.log(queue_url, queue);
  const connection = await amqp.connect(queue_url);
  const channel = await connection.createChannel();

  // const exchange = "mail";

  await channel.assertExchange(exchange, "direct", { durable: true });

  const q = await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(q.queue, exchange, queue);

  console.log(q);
  channel.consume(
    q.queue,
    (msg) => {
      if (msg) {
        callback(msg.content.toString());
      }
    },
    { noAck: true }
  );
};

receiveFromQueue("send-mail", "mail", async (message) => {
  console.log("Received Mail: ", message);
  const parsedBody = JSON.parse(message);

  const { email, verificationCode } = parsedBody;

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
  });

  // Create mail options
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Email Verification",
    html: `Thank you for signing up. Please verify your email with the following code: ${verificationCode}`,
  };

  // send mail
  const { rejected } = await transporter.sendMail(mailOptions);

  if (rejected.length) {
    console.log("Email rejected: ", rejected);
    return;
  }

  const mail = await prisma.mail.create({
    data: {
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Email Verification",
      body: `Thank you for signing up. Please verify your email with the following code: ${verificationCode}`,
    },
  });

  console.log("Email sent", mail);
});
