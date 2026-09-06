# RentalHub — Production Deployment Guide
## Your Details:
- **GitHub**: https://github.com/Mayur8182/RentalHub.git
- **EC2 IP**: 44.220.153.2
- **Domain**: rentcarhub.duckdns.org (DuckDNS — free)

---

## Architecture

```
User Browser
     │
     ▼
rentcarhub.duckdns.org  (DuckDNS points → 44.220.153.2)
     │
     ▼
EC2 Instance: 44.220.153.2
     │
     ▼
Docker (rentalhub-net)
     ├── nginx-proxy  (port 80/443)  — routes traffic
     ├── frontend     (port 80)      — Nginx serving React
     └── backend      (port 5000)    — Node.js Express
              │
              ▼
       MongoDB Atlas (cloud)
```

---

## Phase 1 — DuckDNS Setup (Already have domain, just point it)

1. Go to https://www.duckdns.org
2. Login with Google/GitHub
3. Find `rentcarhub` → set IP to `44.220.153.2`
4. Click **Update IP**
5. Verify: `ping rentcarhub.duckdns.org` should return `44.220.153.2`

---

## Phase 2 — MongoDB Atlas (Free Database)

1. Go to https://cloud.mongodb.com → Sign up free
2. Create a **free M0 cluster** → choose region closest to US East (your EC2 is us-east)
3. **Database Access** → Add Database User:
   - Username: `rentalhub`
   - Password: (generate a strong password, save it)
   - Role: `Atlas admin`
4. **Network Access** → Add IP Address:
   - Click "Allow Access from Anywhere" → `0.0.0.0/0`
5. **Connect** → Connect your application → Driver: Node.js → copy the string:
   ```
   mongodb+srv://rentalhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Change `/?` to `/rentalhub?` → result:
   ```
   mongodb+srv://rentalhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rentalhub?retryWrites=true&w=majority
   ```

---

## Phase 3 — EC2 Security Group

In AWS Console → EC2 → Security Groups → your instance's group → Edit Inbound Rules:

| Type       | Port | Source    |
|------------|------|-----------|
| SSH        | 22   | Your IP   |
| HTTP       | 80   | 0.0.0.0/0 |
| HTTPS      | 443  | 0.0.0.0/0 |
| Custom TCP | 5000 | 0.0.0.0/0 |

---

## Phase 4 — Push Code to GitHub

On your Windows machine (in the project folder):

```bash
git init
git add .
git commit -m "Initial production deployment"
git remote add origin https://github.com/Mayur8182/RentalHub.git
git branch -M main
git push -u origin main
```

If the repo already exists:
```bash
git add .
git commit -m "Production config added"
git push origin main
```

---

## Phase 5 — Deploy on EC2

### SSH into your EC2 instance:
```bash
# Windows: use PowerShell or PuTTY
# Replace your-key.pem with your actual key file path
ssh -i "your-key.pem" ubuntu@44.220.153.2
```

### Run the setup script:
```bash
# Download and run in one command
curl -fsSL https://raw.githubusercontent.com/Mayur8182/RentalHub/main/deploy/ec2-setup.sh | bash
```

**OR** manually step by step:

```bash
# 1. Install Docker
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker

# 2. Clone repo
git clone https://github.com/Mayur8182/RentalHub.git
cd RentalHub

# 3. Create environment files
nano backend/.env.production
# Paste this content (fill in your MONGO_URI):
```

**`backend/.env.production` contents:**
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://rentalhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rentalhub?retryWrites=true&w=majority
JWT_SECRET=your_random_64_char_secret_here
FRONTEND_URL=http://rentcarhub.duckdns.org
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```bash
# 4. Create directories
mkdir -p nginx/ssl nginx/logs
sudo mkdir -p /var/www/certbot

# 5. Start everything
docker compose up -d --build
```

---

## Phase 6 — Verify It's Running

```bash
# Check containers
docker compose ps

# Expected output:
# NAME                  STATUS
# rentalhub-backend     Up (healthy)
# rentalhub-frontend    Up (healthy)
# rentalhub-proxy       Up

# Test the site
curl -I http://rentcarhub.duckdns.org
# Should return: HTTP/1.1 200 OK

# Test the API
curl http://rentcarhub.duckdns.org/api/vehicles
# Should return JSON array
```

Open in browser: **http://rentcarhub.duckdns.org**

---

## Phase 7 — Seed Initial Data

```bash
# Run from EC2, inside the project folder
docker compose exec backend node seedData.js
```

Default accounts:
- Admin: `admin@rentalhub.com` / `admin123`
- User:  `user@rentalhub.com` / `user123`

**Change passwords immediately after logging in.**

---

## Phase 8 — GitHub Actions Auto-Deploy (Optional)

Every time you push to `main`, this auto-deploys to EC2.

Go to **GitHub → RentalHub repo → Settings → Secrets → Actions → New secret**:

| Secret Name   | Value                                         |
|---------------|-----------------------------------------------|
| `EC2_USER`    | `ubuntu`                                      |
| `EC2_SSH_KEY` | Contents of your `.pem` file (the whole text) |

To copy .pem content on Windows PowerShell:
```powershell
Get-Content "your-key.pem" | Set-Clipboard
```
Then paste it as the `EC2_SSH_KEY` secret value.

Now every `git push origin main` → GitHub → SSH → EC2 → docker compose rebuild → live in ~2 minutes.

---

## Common Commands on EC2

```bash
# View live logs
docker compose logs -f

# Backend logs only
docker compose logs -f backend

# Restart everything
docker compose restart

# Restart only backend (after code change)
docker compose up -d --build backend

# Stop everything
docker compose down

# Update to latest code manually
git pull origin main && docker compose up -d --build

# Check disk space
df -h

# Check container resource usage
docker stats
```

---

## Add HTTPS (Free SSL — Optional but Recommended)

```bash
# On EC2
sudo apt-get install -y certbot

# Get certificate (DuckDNS domains are supported by Let's Encrypt)
sudo certbot certonly --standalone \
  -d rentcarhub.duckdns.org \
  --agree-tos --non-interactive \
  --email your-email@gmail.com

# Copy certs
sudo cp /etc/letsencrypt/live/rentcarhub.duckdns.org/fullchain.pem ~/RentalHub/nginx/ssl/
sudo cp /etc/letsencrypt/live/rentcarhub.duckdns.org/privkey.pem   ~/RentalHub/nginx/ssl/
sudo chown ubuntu:ubuntu ~/RentalHub/nginx/ssl/*.pem

# Then edit nginx/proxy.conf to uncomment the HTTPS block
nano ~/RentalHub/nginx/proxy.conf

# Also update .env.production to use https://
nano ~/RentalHub/backend/.env.production   # change FRONTEND_URL
nano ~/RentalHub/frontend/.env.production  # change VITE_API_URL

# Rebuild with HTTPS
docker compose up -d --build

# Auto-renew SSL
(sudo crontab -l 2>/dev/null; echo "0 3 * * 1 certbot renew --quiet && cp /etc/letsencrypt/live/rentcarhub.duckdns.org/*.pem /home/ubuntu/RentalHub/nginx/ssl/ && docker compose -f /home/ubuntu/RentalHub/docker-compose.yml restart nginx-proxy") | sudo crontab -
```

---

## Troubleshooting

**Site not loading:**
```bash
docker compose ps                    # are containers running?
docker compose logs nginx-proxy      # proxy errors?
sudo ufw status                      # firewall blocking?
curl http://localhost/api/vehicles   # works locally?
```

**Backend crash loop:**
```bash
docker compose logs backend          # read the error
# Usually: wrong MONGO_URI in .env.production
```

**Port 80 already in use:**
```bash
sudo lsof -i :80                     # find what's using it
sudo systemctl stop apache2          # if Apache is running
```
