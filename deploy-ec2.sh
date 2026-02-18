#!/bin/bash

# EC2 Deployment Script for Sandevex Backend

echo "🚀 Starting EC2 deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Git
sudo apt install git -y

# Clone repository
cd /var/www/
sudo git clone https://github.com/rashmi-br-dev/sandevex-offer-backend.git
cd sandevex-offer-backend

# Install dependencies
sudo npm install

# Build the project
sudo npm run build

# Create environment file
sudo cat > .env << EOF
MONGODB_URI=mongodb+srv://rashmibrsandhut_db_user:FoRgsm1Dw7juzllc@cluster0.7ibhc6d.mongodb.net/sandevex-assessment?appName=Cluster0
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sandevex@gmail.com
SMTP_PASS=mjob zdvq xuqc hhfe
FROM_EMAIL=sandevex@gmail.com
EMAILJS_PUBLIC_KEY=sj-BevXC_06XNy5Wm
EMAILJS_SERVICE_ID=service_54zkh4f
EMAILJS_DEFAULT_TEMPLATE_ID=template_rcuob8s
HR_NOTIFY_EMAIL=Hello.prakashrakashr@gmail.com
FRONTEND_URL=https://sandevex-offer-frontend.vercel.app
BOOKING_TEMPLATE_ID=template_oanrrbl
NODE_ENV=production
PORT=5000
EOF

# Start with PM2
sudo pm2 start dist/server.js --name "sandevex-backend"
sudo pm2 startup
sudo pm2 save

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000
sudo ufw --force enable

echo "✅ Deployment completed!"
echo "🌐 Your API is running on: http://$(curl -s ifconfig.me):5000"
