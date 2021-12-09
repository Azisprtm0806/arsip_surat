const nodemailer = require("nodemailer");

exports.kirimEmail = (dataEmail) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "azisprtm2@gmail.com",
      pass: "agqy pjbf vghx huse",
    },
  });
  return transporter.sendMail(dataEmail);
};
