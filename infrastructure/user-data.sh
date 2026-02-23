#!/bin/bash
dnf update -y

# Install required packages
dnf install -y nodejs git

# Install PM2 globally
npm install -g pm2

# Go to home directory
cd /home/ec2-user

# Clone GitHub repository
git clone https://github.com/TheBeard-af/Cloudgallery.git

# Navigate to backend folder
cd Cloudgallery/backend

# Install dependencies
npm install

# Start backend with PM2
pm2 start server.js
pm2 save