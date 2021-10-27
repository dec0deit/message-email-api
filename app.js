const express = require('express')
const app = express()
app.get('/sendMessageAndEmail', (req, res) => {
  res.status(200).json({
      message:'Success'});
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})