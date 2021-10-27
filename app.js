require('dotenv').config()
const express = require('express')
const nodemailer = require("nodemailer");
const app = express()
app.get('/sendMessageAndEmail', async(req, res) => {
  console.log(process.env.EMAIL,process.env.PASSWORD)
 
  let transporter = nodemailer.createTransport(
  {
    service:'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    }
  });
 
  try{
    let info = await transporter.sendMail({
      from: 'TEST EMAIL', // sender address
      to: "singlanipun29@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });

    console.log(info)
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.status(200).json({message:'Success'});
  }
  catch(err){
    console.log(err)
    res.status(401).json({message : 'Bad Request'})
  }
})
app.get('/', (req, res) => {
    res.status(200).json({
        message:'Home Page'});
  })

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})