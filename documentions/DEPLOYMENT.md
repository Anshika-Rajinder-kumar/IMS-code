# 🚀 Deployment Guide - Wissen IMS

## Table of Contents
- [Quick Docker Deployment](#quick-docker-deployment)
- [Production Deployment](#production-deployment)
- [Cloud Deployment Options](#cloud-deployment-options)
- [CI/CD Setup](#cicd-setup)
- [Monitoring](#monitoring)

## Quick Docker Deployment

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2+
- 4GB RAM minimum
- 10GB disk space

### Step 1: Clone Repository
```powershell
git clone <repository-url>
cd IMS_Frontedn
```

### Step 2: Configure Environment
Edit `docker-compose.yml` to update:
- Database passwords
- JWT secret (for production)
- Allowed origins (your domain)

### Step 3: Build and Deploy
```powershell
# Build all images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Database: localhost:5432

### Step 5: Create First Admin User
1. Navigate to http://localhost:3000
2. Click "Register"
3. Fill in details with userType: ADMIN
4. Login with credentials

## Production Deployment

### Security Hardening

#### 1. Update Database Credentials
```yaml
# docker-compose.yml
postgres:
  environment:
    POSTGRES_DB: wissen_ims_prod
    POSTGRES_USER: wissen_prod_user
    POSTGRES_PASSWORD: <STRONG_PASSWORD_HERE>
```

#### 2. Change JWT Secret
```properties
# backend/src/main/resources/application.properties
jwt.secret=<GENERATE_LONG_RANDOM_STRING>
```

Generate secure secret:
```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

#### 3. Enable HTTPS
Update `nginx.conf`:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Rest of config...
}
```

#### 4. Update CORS Origins
```properties
cors.allowed-origins=https://yourdomain.com,https://www.yourdomain.com
```

### Database Backup Strategy

#### Automated Backups
```powershell
# Create backup script: backup.ps1
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backup_$timestamp.sql"

docker exec wissen-postgres pg_dump -U wissen_user -d wissen_ims > $backupFile
```

#### Schedule with Task Scheduler
```powershell
# Create scheduled task (run as Administrator)
$action = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument '-File C:\path\to\backup.ps1'
$trigger = New-ScheduledTaskTrigger -Daily -At 2AM
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "WissenIMS-Backup" -Description "Daily backup of Wissen IMS database"
```

### Resource Limits

Update `docker-compose.yml`:
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G

postgres:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 1G
      reservations:
        cpus: '1'
        memory: 512M
```

## Cloud Deployment Options

### AWS Deployment

#### Option 1: EC2 with Docker
```bash
# Launch EC2 instance (Ubuntu 22.04, t3.medium)
# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker

# Clone and deploy
git clone <repository-url>
cd IMS_Frontedn
sudo docker-compose up -d
```

#### Option 2: ECS (Elastic Container Service)
1. Push images to ECR:
```bash
# Authenticate
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag wissen-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/wissen-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/wissen-backend:latest
```

2. Create ECS task definitions
3. Deploy to ECS cluster
4. Use RDS for PostgreSQL

#### Option 3: EKS (Kubernetes)
See `kubernetes/` folder for manifests (coming soon)

### Azure Deployment

#### Azure Container Instances
```powershell
# Create resource group
az group create --name wissen-ims-rg --location eastus

# Create container group
az container create `
  --resource-group wissen-ims-rg `
  --name wissen-ims `
  --image <your-registry>/wissen-backend:latest `
  --dns-name-label wissen-ims `
  --ports 8080
```

#### Azure App Service
1. Create App Service plan
2. Deploy using Docker Compose
3. Use Azure Database for PostgreSQL

### Google Cloud Platform

#### Cloud Run
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/<project-id>/wissen-backend

# Deploy to Cloud Run
gcloud run deploy wissen-backend \
  --image gcr.io/<project-id>/wissen-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### GKE (Google Kubernetes Engine)
```bash
# Create cluster
gcloud container clusters create wissen-ims-cluster --num-nodes=3

# Deploy application
kubectl apply -f k8s/
```

### DigitalOcean

#### Droplet Deployment
1. Create Droplet (Ubuntu 22.04)
2. Install Docker & Docker Compose
3. Clone and run with docker-compose

#### App Platform
1. Connect GitHub repository
2. Configure build settings
3. Add PostgreSQL database
4. Deploy

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Build Backend
      run: |
        cd backend
        mvn clean package -DskipTests
    
    - name: Build Frontend
      run: |
        npm ci
        npm run build
    
    - name: Build Docker Images
      run: |
        docker-compose build
    
    - name: Push to Registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker-compose push
    
    - name: Deploy to Server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /opt/wissen-ims
          git pull
          docker-compose pull
          docker-compose up -d
```

### GitLab CI/CD

Create `.gitlab-ci.yml`:
```yaml
stages:
  - build
  - test
  - deploy

build-backend:
  stage: build
  image: maven:3.9-eclipse-temurin-17
  script:
    - cd backend
    - mvn clean package -DskipTests
  artifacts:
    paths:
      - backend/target/*.jar

build-frontend:
  stage: build
  image: node:20-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy-production:
  stage: deploy
  only:
    - main
  script:
    - docker-compose build
    - docker-compose push
    - ssh $SERVER_USER@$SERVER_HOST "cd /opt/wissen-ims && docker-compose pull && docker-compose up -d"
```

## Monitoring

### Health Checks

#### Application Health Endpoint
Add to `application.properties`:
```properties
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
```

Access at: http://localhost:8080/actuator/health

#### Docker Health Checks
Already configured in `docker-compose.yml`:
```yaml
postgres:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U wissen_user -d wissen_ims"]
    interval: 10s
    timeout: 5s
    retries: 5
```

### Logging

#### Centralized Logging with ELK Stack
```yaml
# Add to docker-compose.yml
elasticsearch:
  image: elasticsearch:8.11.0
  environment:
    - discovery.type=single-node
  ports:
    - "9200:9200"

kibana:
  image: kibana:8.11.0
  ports:
    - "5601:5601"
  depends_on:
    - elasticsearch

logstash:
  image: logstash:8.11.0
  volumes:
    - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  depends_on:
    - elasticsearch
```

#### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Export logs
docker-compose logs > logs.txt
```

### Monitoring with Prometheus + Grafana

Add to `docker-compose.yml`:
```yaml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  depends_on:
    - prometheus
```

### Alerts

#### Slack Notifications
```yaml
# alertmanager.yml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts'
        text: 'Alert: {{ .CommonAnnotations.summary }}'
```

#### Email Alerts
Configure SMTP in backend `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

## Rollback Strategy

### Quick Rollback
```powershell
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and deploy
docker-compose up -d --build
```

### Zero-Downtime Deployment
```powershell
# Scale up new version
docker-compose up -d --scale backend=2 --no-recreate

# Health check new instances
# If healthy, remove old instances
docker stop wissen-backend-old

# If issues, rollback
docker-compose down
docker-compose up -d
```

## Performance Optimization

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_intern_status ON interns(status);
CREATE INDEX idx_intern_email ON interns(email);
CREATE INDEX idx_document_intern ON documents(intern_id);
CREATE INDEX idx_offer_intern ON offers(intern_id);
```

### Nginx Caching
```nginx
# Add to nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
}
```

### JVM Tuning
```yaml
# docker-compose.yml
backend:
  environment:
    JAVA_OPTS: >-
      -Xms512m
      -Xmx2g
      -XX:+UseG1GC
      -XX:MaxGCPauseMillis=200
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```powershell
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### 2. Backend Not Starting
```powershell
# Check Java version
docker exec wissen-backend java -version

# Check application logs
docker-compose logs backend

# Check database connectivity
docker exec wissen-backend ping postgres
```

#### 3. Frontend Not Loading
```powershell
# Check if Nginx is running
docker-compose ps frontend

# Check Nginx logs
docker-compose logs frontend

# Test API connectivity
docker exec wissen-frontend curl http://backend:8080/actuator/health
```

## Support

For deployment issues:
- Email: devops@wissen.com
- Slack: #wissen-ims-support
- Create an issue in the repository

---

**Last Updated**: 2024
**Maintained By**: Wissen Technology DevOps Team
