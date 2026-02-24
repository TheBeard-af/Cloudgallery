#!/bin/bash
dnf update -y

# Install Node.js 18 and Git
dnf install -y nodejs git

# Install PM2 globally
npm install -g pm2

# Switch to ec2-user
cd /home/ec2-user

# Clone repository
git clone https://github.com/TheBeard-af/Cloudgallery.git

# Navigate to backend
cd Cloudgallery/backend

# Install dependencies
npm install

# Start app with PM2
pm2 start server.js --name cloudgallery-backend

# Save PM2 process list
pm2 save

# Configure PM2 to start on boot
pm2 startup systemd -u ec2-user --hp /home/ec2-user