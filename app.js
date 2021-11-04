require('dotenv').config()

const express = require('express')
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser')
const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");
const jwt = require('jsonwebtoken');
const app = express()
const axios = require('axios')

jwt.sign("AA","AAA")
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true}))



app.set("view engine", "ejs");
app.use(express.static("public"));
app.get('/template',(req,res)=>{
  console.log('hello')
  res.download(dirPath+'/template.pdf');
});

app.post('/sendMessageAndEmail', async(req, res) => {
  console.log(req.body);
  const {name,email_id,mobile_no} =(req.body?.transaction?.customer);
  const amount = req.body.gross_amount;
  if(email_id && mobile_no){
      console.log(process.env.EMAIL,process.env.PASSWORD)
      let transporter = nodemailer.createTransport(
      {
        service:'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
        tls :{
          rejectUnauthorized : false
        }

      });
      try{
        let info = await transporter.sendMail({
          from: process.env.EMAIL,
          to: [email_id], 
          subject: "Thanks For Donating", 
          text: `Hello ${name} Thanks a lot for donating. Please download your certificate at `, 
        });
        console.log(info)
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      
        client.messages
        .create({
          to: '+91' + mobile_no,
          from: '+15306758417',
          body: `Hello ${name} Thanks for donating. Please download your certificate at  `,
        })
        .then(message =>{
           console.log(message);
           console.log(message.sid)
           res.status(200).json({message:'Success'});
        });
    }
    catch(err){
      console.log(err)
      res.status(401).json({message : 'Bad Request'})
    }
  }
  else{
    res.status(401).json({message : 'Enter Proper Email and Phone Number'})
  }
})
app.get('/', (req, res) => {
  console.log(req);

  res.status(200).json({message:'Home Page'});
})

app.get('/getCertificate', (req, res) => {
  console.log(req.query)
  let donorInfo = {
    Name : jwt.decode(req.query.Name),
    Amount : jwt.decode(req.query.Amount),
    Date : jwt.decode(req.query.Date)
  }

  res.render(__dirname + "/public/pdfGenerator.ejs", {DonorInfo: donorInfo}, (err, data) => {
    var config = 
    {
      format: 'A5',
      orientation: "landscape"
    };

    pdf.create(data, config).toFile(dirPath + "/receipt-donation.pdf", function (err, data) {
      if (err) {
        return res.send(err);
      } 
      else {
        return res.download(dirPath + "/receipt-donation.pdf");
      }
    });
  });

});
  
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})