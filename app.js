require('dotenv').config()

const express = require('express')
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser')
const fs = require("fs");
const path = require("path");
const app = express()
const dirPath = path.join(__dirname, "public/pdfs");

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false}))

const files = fs.readdirSync(dirPath).map(name => {
  return {
    url: `localhost:3000/pdfs/${name}`
  };
});

app.set("view engine", "pdf");
app.use(express.static("public"));
app.get('/template',async(req,res)=>{
  res.redirect(files[0].url);
});

app.post('/sendMessageAndEmail', async(req, res) => {
  console.log(req.body)
  const {email,phoneNo} =req.body;
  if(email && phoneNo){
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
        from: 'TEST EMAIL',
        to: [email,phoneNo], 
        subject: "Hello ✔", 
        text: "Hello world?", 
        html: "<b>Hello world?</b>", 
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
  }
  else{
    res.status(401).json({message : 'Enter Proper Email and Phone Number'})
  }
})
app.get('/', (req, res) => {
  console.log(req);

  res.status(200).json({message:'Home Page'});
})

app.get('/sumOfTwoNumber',(req,res) =>{
  const {one,Two} = req.query;
  console.log(req.params);
  res.status(200).json({sum:one+Two});
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})