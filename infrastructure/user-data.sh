#!/bin/bash
dnf update -y

# Install Node.js (Amazon Linux 2023 supports modern Node)
dnf install -y nodejs

# Install PM2 globally
npm install -g pm2

# Create app directory
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

cat <<EOF > server.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('CloudGallery App Server Running - Healthy (AL2023)');
});

app.listen(80, () => {
  console.log('Server running on port 80');
});
EOF

npm init -y
npm install express

pm2 start server.js
pm2 save