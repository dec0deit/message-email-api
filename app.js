require('dotenv').config()

const express = require('express')
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser')
const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");
const jwt = require('jsonwebtoken');
const app = express()
const dirPath = path.join(__dirname, "public/pdfs");
const axios = require('axios')


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true}))

const files = fs.readdirSync(dirPath).map(name => {
  return {
    url: `localhost:3000/pdfs/${name}`
  };
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.get('/template',(req,res)=>{
  console.log('hello')
  res.download(dirPath+'/template.pdf');
});

app.post('/sendMessageAndEmail', async(req, res) => {
  console.log(req.body);
  const {name,email_id,mobile_no} =req.body.transaction.customer;
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
          text: `Hello ${name} Thanks a lot for donating.`, 
        });
        console.log(info)
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        
        const headers = {
          'Content-Type':'application/json',
          'X-API-Key' : process.env.API_KEY
        }

        const body = {
          'mobile' : '+91'+mobile_no,
          'text' : `Hello ${name} Thanks a lot for Donating`
        }

        const apiResponse = await axios.post('https://api.ycloud.com/v1/sms/send_messages',body,{headers});
        
        console.log(apiResponse.data);
        res.status(200).json({message:'Success'});
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