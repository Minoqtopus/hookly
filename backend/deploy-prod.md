# Production Deployment Guide - Hookly Backend

This guide walks you through deploying your Hookly backend to Ubuntu EC2 and exposing it at `api.hookly.xyz` with SSL.

## 🚀 Complete Step-by-Step Guide (For Complete Beginners)

### Phase 1: Setup Your EC2 Server

#### 1.1 Connect to your EC2
```bash
# Replace with your actual key file and EC2 IP
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 1.2 Update Ubuntu
```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.3 Install basic tools
```bash
sudo apt install -y curl wget git build-essential
```

#### 1.4 Install NVM (Node Version Manager)
```bash
# Download and install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload your shell
source ~/.bashrc

# Verify NVM is installed
nvm --version
```

#### 1.5 Install Node.js 22.14.0
```bash
# Install the exact version your backend uses
nvm install 22.14.0
nvm use 22.14.0
nvm alias default 22.14.0

# Verify installation
node --version  # Should show v22.14.0
npm --version
```

#### 1.6 Install PM2 (Process Manager)
```bash
npm install -g pm2
```

### Phase 2: Deploy Your Backend Application

#### 2.1 Clone your repository
```bash
cd ~
git clone https://github.com/yourusername/viral-idea-one.git
cd viral-idea-one/backend
```

#### 2.2 Setup environment variables
```bash
# Copy your production environment file
cp .env.prod .env

# Edit the .env file if needed (add missing values)
nano .env
```

#### 2.3 Install dependencies and build
```bash
# Install only production dependencies
npm ci --only=production

# Build the TypeScript application
npm run build
```

#### 2.4 Create logs directory
```bash
mkdir -p logs
```

#### 2.5 Start your application with PM2
```bash
# Start using the ecosystem config
pm2 start ecosystem.config.js

# Check if it's running
pm2 status

# View logs to make sure everything is working
pm2 logs hookly-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
# Follow the command it shows you (copy and paste it)
```

#### 2.6 Test your API
```bash
# Test if your API is running locally
curl http://localhost:3001/health
# Should return something like {"status":"ok"}
```

### Phase 3: Install and Configure Nginx

#### 3.1 Install Nginx
```bash
sudo apt install -y nginx
```

#### 3.2 Start and enable Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx

# Check if it's running
sudo systemctl status nginx
```

#### 3.3 Configure Nginx for your API
```bash
# Create a new Nginx configuration file
sudo nano /etc/nginx/sites-available/api.hookly.xyz
```

**Copy and paste this configuration:**
```nginx
server {
    listen 80;
    server_name api.hookly.xyz;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase body size for file uploads
        client_max_body_size 10M;
    }

    # Health check endpoint (optional)
    location /health {
        access_log off;
        proxy_pass http://localhost:3001/health;
    }
}
```

#### 3.4 Enable the site
```bash
# Create a symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/api.hookly.xyz /etc/nginx/sites-enabled/

# Test the configuration
sudo nginx -t

# If the test passes, reload Nginx
sudo systemctl reload nginx
```

### Phase 4: Configure DNS (Namecheap)

#### 4.1 Login to Namecheap
1. Go to your Namecheap dashboard
2. Find your domain `hookly.xyz`
3. Click "Manage"

#### 4.2 Add DNS Record
1. Go to "Advanced DNS" tab
2. Click "Add New Record"
3. Set up:
   - **Type**: A Record
   - **Host**: api
   - **Value**: Your EC2 public IP address
   - **TTL**: Automatic

#### 4.3 Wait for DNS propagation
```bash
# Wait 5-15 minutes, then test DNS
nslookup api.hookly.xyz
# Should return your EC2 IP
```

### Phase 5: Add SSL Certificate (HTTPS)

#### 5.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 5.2 Get SSL certificate
```bash
# This will automatically configure Nginx for SSL
sudo certbot --nginx -d api.hookly.xyz

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

#### 5.3 Test SSL renewal
```bash
# Certbot automatically sets up renewal, but test it
sudo certbot renew --dry-run
```

### Phase 6: Setup Firewall (Security)

#### 6.1 Configure UFW (Ubuntu Firewall)
```bash
# Enable firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Check status
sudo ufw status
```

### Phase 7: Final Testing

#### 7.1 Test your API endpoints
```bash
# Test HTTP redirect to HTTPS
curl -I http://api.hookly.xyz

# Test HTTPS endpoint
curl https://api.hookly.xyz/health

# Test from your local machine
curl https://api.hookly.xyz/api/docs
```

#### 7.2 Monitor your application
```bash
# Check PM2 status
pm2 status

# View real-time logs
pm2 logs hookly-api

# Monitor system resources
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔧 Daily Operations

### Deploy Updates
```bash
cd ~/viral-idea-one/backend

# Pull latest changes
git pull origin main

# Install any new dependencies
npm ci --only=production

# Rebuild the application
npm run build

# Restart the application with zero downtime
pm2 reload hookly-api

# Check status
pm2 status
```

### View Logs
```bash
# Application logs
pm2 logs hookly-api

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart your API
pm2 restart hookly-api

# Restart Nginx
sudo systemctl restart nginx

# Restart everything (if needed)
pm2 restart all
sudo systemctl restart nginx
```

## 🚨 Troubleshooting

### API Not Responding
```bash
# Check if Node.js app is running
pm2 status

# Check logs for errors
pm2 logs hookly-api --lines 50

# Check if port 3001 is listening
sudo netstat -tlnp | grep :3001
```

### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Reload Nginx configuration
sudo systemctl reload nginx
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Test SSL
curl -I https://api.hookly.xyz
```

### DNS Issues
```bash
# Check DNS resolution
nslookup api.hookly.xyz
dig api.hookly.xyz

# Check from different location
# Use online tools like whatsmydns.net
```

## 📋 Checklist for Success

- [ ] EC2 instance is running Ubuntu
- [ ] NVM and Node.js 22.14.0 installed
- [ ] PM2 installed and configured
- [ ] Backend code cloned and built
- [ ] PM2 ecosystem started and saved
- [ ] PM2 startup configured for auto-restart
- [ ] Nginx installed and configured
- [ ] DNS A record added for api.hookly.xyz
- [ ] SSL certificate obtained and installed
- [ ] Firewall configured
- [ ] API responds at https://api.hookly.xyz/health
- [ ] CORS configured for frontend domain

## 🎯 Expected Results

After following this guide:

✅ Your API will be available at: `https://api.hookly.xyz`  
✅ SSL certificate automatically renews  
✅ PM2 automatically restarts your app if it crashes  
✅ Nginx handles all HTTP to HTTPS redirects  
✅ Your app survives server reboots  
✅ Logs are properly managed and rotated

## 🔗 Important URLs

- **API Base**: https://api.hookly.xyz
- **Health Check**: https://api.hookly.xyz/health  
- **API Documentation**: https://api.hookly.xyz/api/docs
- **Frontend**: https://www.hookly.xyz (on Vercel)

## 💡 Pro Tips

1. **Always test locally first**: Run `npm run start:dev` locally before deploying
2. **Monitor memory usage**: Use `pm2 monit` to watch resource usage
3. **Regular backups**: Your database (Neon) is automatically backed up
4. **Log monitoring**: Check logs regularly for errors or unusual activity
5. **Security updates**: Run `sudo apt update && sudo apt upgrade` monthly

---

🎉 **Congratulations!** Your Hookly backend is now live in production!

Need help? Check the troubleshooting section or review the logs for detailed error messages.