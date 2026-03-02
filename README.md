# 🌩 CloudGallery — Full AWS Production Architecture

---

# 📌 Project Overview

CloudGallery is a fully cloud‑native, production‑style image gallery application built entirely on AWS using cloud architecture best practices.

This project demonstrates:

- Custom VPC networking
- Public and private subnet segmentation
- Application Load Balancer
- Auto Scaling Group with Launch Templates
- Bastion host architecture
- MongoDB running in isolated subnet
- S3 static website hosting
- S3 image storage
- Lambda event-driven processing
- IAM least‑privilege policies
- Immutable infrastructure deployment
- Cross-origin frontend/backend integration

This is not just an application — it is a complete AWS production architecture.

---

# 🏗 High-Level Architecture

```
User (Browser)
      ↓
S3 Static Website (Frontend)
      ↓
Application Load Balancer (Public Subnet)
      ↓
Auto Scaling Group (Private App Subnets)
      ↓
MongoDB EC2 (Private DB Subnets)
      ↓
S3 Images Bucket
      ↓
Lambda (Thumbnail Generator)
      ↓
S3 Thumbnails Bucket
```

---

# 🌐 Networking Architecture

## ✅ VPC

Custom VPC with CIDR:

```
10.0.0.0/16
```

Spanning multiple Availability Zones for resilience.

---

## ✅ Subnet Design

### 1️⃣ Public Subnets

Used for:

- Application Load Balancer
- Bastion Host
- NAT Gateway

Route:

```
0.0.0.0/0 → Internet Gateway
```

These subnets allow inbound and outbound internet access.

---

### 2️⃣ Private Application Subnets

Used for:

- Auto Scaling Group (Node.js backend)

Route:

```
0.0.0.0/0 → NAT Gateway
```

No inbound internet access allowed.

---

### 3️⃣ Private Database Subnets

Used for:

- MongoDB EC2 instance

No route to Internet Gateway.
No route to NAT Gateway.
Fully isolated from the public internet.

---

## ✅ Internet Gateway

Allows public subnets to communicate with the internet.

---

## ✅ NAT Gateway

Allows private app instances to:

- Install packages
- Pull GitHub repo
- Perform updates

Prevents inbound internet traffic.

---

## ✅ S3 Gateway Endpoint

Allows private subnets to access S3 without using the public internet.

Improves:

- Security
- Performance
- Cost efficiency

---

# 🔐 Security Architecture

## ✅ Security Groups

### ALB Security Group

- Allows HTTP (80) from 0.0.0.0/0
- Sends traffic to App Security Group

---

### App Security Group

- Allows port 80 from ALB SG only
- Allows MongoDB port 27017 to DB SG
- No public access

---

### DB Security Group

- Allows port 27017 from App SG only
- Not publicly accessible

---

### Bastion Security Group

- Allows SSH (22) from developer IP only
- Used to access private instances securely

---

# 🔑 IAM Roles & Least Privilege

## ✅ EC2 Instance Role

Allows:

- s3:PutObject (images bucket)
- s3:GetObject (images + thumbnails)
- s3:ListBucket (images + thumbnails)

No hardcoded AWS credentials anywhere.

---

## ✅ Lambda Execution Role

Allows:

- s3:GetObject from images bucket
- s3:PutObject to thumbnails bucket
- CloudWatch Logs access

Follows least privilege principle.

---

# 🖥 Backend (Node.js + Express)

Location:

```
/backend
```

Runs on:

- Amazon Linux 2023
- Node.js 18
- PM2 process manager
- Auto Scaling Group

---

## ✅ Backend Endpoints

### Health Check

```
GET /
```

---

### Upload Image

```
POST /upload
```

Uploads image to S3 images bucket.

---

### List Originals

```
GET /images
```

---

### List Thumbnails

```
GET /thumbnails
```

---

### Gallery (Paired Images)

```
GET /gallery
```

Returns:

```
[
  {
    "original": "...",
    "thumbnail": "..."
  }
]
```

---

## ✅ MongoDB

Runs on EC2 inside private database subnet.

Connection string:

```
mongodb://10.0.x.x:27017/cloudgallery
```

---

## ✅ CORS

Enabled to allow:

Frontend (S3 domain) → Backend (ALB domain)

---

# 🖼 Frontend (Static Website on S3)

Location:

```
/frontend
```

Hosted on:

```
cloudgallery-frontend-2026
```

Responsibilities:

- Upload image
- Fetch gallery
- Display thumbnails
- Open original image in new tab

Pure client-side application.

---

# 🪣 S3 Buckets

## 1️⃣ Frontend Bucket

- Static website hosting enabled
- Public read access enabled

---

## 2️⃣ Images Bucket

- Stores uploaded images
- Public read enabled for browser access

---

## 3️⃣ Thumbnails Bucket

- Stores resized images
- Public read enabled

---

# ⚡ Lambda — Thumbnail Generator

Triggered by:

```
s3:ObjectCreated:*
```

Process:

1. Retrieve uploaded image
2. Resize to 200px width using sharp
3. Save as:
   thumb-originalfilename.jpg
4. Upload to thumbnails bucket

Runtime:

- Node.js 18

---

# 🔄 Deployment Model — Immutable Infrastructure

We NEVER SSH to update code.

Deployment process:

1. Push code to GitHub
2. Create new Launch Template version
3. Update Auto Scaling Group
4. Start Instance Refresh
5. Old instance replaced
6. New instance boots and pulls latest GitHub repo

Each deployment = new Launch Template version.

Provides:

- Rollback capability
- Version history
- Production best practice

---

# 🚀 Backend Redeployment Commands

```powershell
aws ec2 create-launch-template-version ...
aws autoscaling update-auto-scaling-group ...
aws autoscaling start-instance-refresh ...
```

---

# 🧪 Testing Endpoints

## Backend

```
http://ALB-DNS/
```

## Gallery API

```
http://ALB-DNS/gallery
```

## Frontend

```
http://cloudgallery-frontend-2026.s3-website-region.amazonaws.com
```

---

# 💰 Cost Considerations

Main cost components:

- EC2 instances
- NAT Gateway (most expensive component)
- Application Load Balancer
- S3 storage
- Lambda invocations

Cost reduction ideas:

- Replace NAT Gateway with NAT Instance (dev only)
- Use smallest instance types
- Shut down when not in use
- Use CloudFront for optimized S3 delivery

---

# 🛠 Rebuild Order (From Scratch)

1. Create VPC
2. Create public/private/database subnets
3. Create Internet Gateway
4. Create NAT Gateway
5. Configure route tables
6. Create security groups
7. Create S3 buckets
8. Configure bucket policies
9. Create IAM roles
10. Create Lambda function
11. Create Launch Template
12. Create Auto Scaling Group
13. Create Application Load Balancer
14. Deploy frontend

---

# 🔮 Future Improvements

- Add HTTPS with ACM
- Add CloudFront distribution
- Use signed URLs instead of public buckets
- Replace MongoDB EC2 with DocumentDB
- Use RDS instead of self-managed DB
- Containerize backend (ECS/EKS)
- Add CI/CD pipeline (GitHub Actions)
- Add authentication (Cognito)
- Add image metadata storage
- Add caching layer (ElastiCache)

---

# 📚 AWS Services Used

- EC2
- VPC
- IAM
- S3
- Lambda
- Auto Scaling
- Application Load Balancer
- CloudWatch Logs
- NAT Gateway
- Internet Gateway

---

# 🧠 Cloud Concepts Demonstrated

- Network segmentation
- Public vs private subnets
- Least privilege IAM
- Event-driven architecture
- Horizontal scaling
- Multi-AZ resilience
- Immutable deployments
- Serverless integration
- Static + dynamic architecture separation

---

# ✅ Final Result

CloudGallery is a production-style AWS architecture demonstrating modern best practices for scalable, secure, and event-driven web applications.

This project serves as both:

- A functional application
- A cloud architecture reference implementation

---

# 🔚 End of Documentation

# 🌩 CloudGallery — Infrastructure Pause Report & Recovery Guide

---

# 📌 PROJECT STATUS: FULLY PAUSED (COST MINIMIZED)

CloudGallery has been safely paused.  
All runtime billing components have been removed.  
All data and architecture configuration remain intact.

Estimated current monthly cost: **~\$3–\$6/month**

---

# ✅ WHAT WAS DONE (FULL CLEANUP SUMMARY)

## 1️⃣ Removed Old Practice Infrastructure

Deleted:

- Auto Scaling Group: `web-asg`
- 3 EC2 instances belonging to `web-asg`
- Old Load Balancer: `ALB`
- Old Target Group: `web-tgs`
- Old NAT Gateway: `nat-0277b046b543d1722`
- Unused Elastic IP: `13.236.17.150`
- Elastic IP previously attached to old ALB: `13.55.66.214`

Result:

- Eliminated unused compute
- Eliminated duplicate load balancer
- Removed old NAT charges (~\$45/month)
- Removed unused EIP charges

---

## 2️⃣ Paused CloudGallery Runtime Infrastructure

### ✅ Scaled Auto Scaling Group to Zero

Auto Scaling Group:

- Name: `CloudGallery-ASG`
- Launch Template: `CloudGallery-App-LT (v14)`
- Min: 0
- Desired: 0
- Max: 0

Terminated:

- App Instance: `i-08e3996de40ad780a`

---

### ✅ Stopped Compute Instances

Stopped:

- MongoDB EC2: `i-054117cab543ad7a9`
- Bastion EC2: `i-06561a922b6108831`

Compute billing stopped.

---

### ✅ Deleted Runtime Networking Components

Deleted:

- Load Balancer: `CloudGallery-ALB`
- NAT Gateway: `nat-0dccfab2838b0ef77`
- Released Elastic IP: `3.105.121.212`

All runtime networking costs eliminated.

---

# 🏗 CURRENT INFRASTRUCTURE STATE

## ✅ VPC

- VPC Name: `CloudGallery-VPC`
- VPC ID: `vpc-04ac36b0fe47f1f7d`

---

## ✅ Subnets

Public Subnets:

- `subnet-00378382c950c18de` (CloudGallery-Public-2a)
- `subnet-0247b7264fcc9add1` (CloudGallery-Public-2b)
- `subnet-09ea950429aa9456e` (CloudGallery-Public-2c)

Private App Subnet:

- `subnet-0cfdb2c38e2fd0de1` (CloudGallery-PrivateApp-2b)

Private DB Subnet:

- Within CloudGallery-VPC (MongoDB location preserved)

---

## ✅ EC2 Instances (Stopped)

### MongoDB

- Instance ID: `i-054117cab543ad7a9`
- Type: `t3.micro`
- Volume: `vol-0326049b3cdf539c8` (8 GiB gp2)

### Bastion

- Instance ID: `i-06561a922b6108831`
- Type: `t3.micro`
- Volume: `vol-06ae69927b5c48132` (8 GiB gp2)

---

## ✅ EBS Volumes (Persisting)

- `vol-06ae69927b5c48132` (Bastion root)
- `vol-0326049b3cdf539c8` (MongoDB root)
- `vol-09ad6c4f23765d51f` (Former app volume)

All volumes are preserved.
No orphaned volumes exist.

---

## ✅ S3 Buckets (Unchanged)

- Frontend bucket
- Images bucket
- Thumbnails bucket

All data preserved.
Public website remains hosted (if static hosting enabled).

---

# 💰 CURRENT COST PROFILE

Previously:
~\$150/month

Now:

- EBS storage (~16–24 GB total)
- S3 storage (minimal)
- CloudWatch logs (minimal)

Estimated:
✅ ~\$3–\$6/month

---

# 🚀 HOW TO RESTORE CLOUDGALLERY

To bring the full production architecture back online:

---

## STEP 1 — Recreate NAT

### Option A — NAT Gateway (Simple, Expensive)

1. VPC → NAT Gateways → Create
2. VPC: `CloudGallery-VPC`
3. Subnet: Public subnet
4. Allocate new Elastic IP
5. Update private route table:
   `0.0.0.0/0 → NAT Gateway`

Cost: ~\$45/month

---

### Option B — NAT Instance (Cheaper Recommended)

1. Launch EC2 (`t3.nano` or `t3.micro`)
2. Place in public subnet
3. Assign Elastic IP
4. Disable Source/Destination Check
5. Update private route table:
   `0.0.0.0/0 → NAT Instance`

Cost: ~\$7–10/month

---

## STEP 2 — Recreate Application Load Balancer

1. EC2 → Load Balancers → Create
2. Type: Application
3. VPC: `CloudGallery-VPC`
4. Select all public subnets
5. Create Listener: HTTP : 80
6. Attach Target Group: `CloudGallery-TG`

Cost: ~\$15/month

---

## STEP 3 — Start MongoDB

EC2 → Instances  
Start:

- `i-054117cab543ad7a9`

---

## STEP 4 — Scale Auto Scaling Group

EC2 → Auto Scaling Groups → `CloudGallery-ASG`

Set:

- Min: 1
- Desired: 1
- Max: 1

This launches a new backend app instance automatically.

---

## STEP 5 — (Optional) Start Bastion

Start:

- `i-06561a922b6108831`

Only needed for SSH access.

---

## STEP 6 — Validate Application

Test:

- ALB DNS loads
- `/gallery` endpoint responds
- Image upload works
- Lambda thumbnail generation works
- S3 buckets accessible

---

# 🔄 RESTORE TIME ESTIMATE

Full restart time:
~10–15 minutes

No infrastructure rebuild required.
All architecture definitions remain intact.

---

# ✅ FINAL STATE SUMMARY

CloudGallery is currently:

- ✅ Architecturally preserved
- ✅ Data preserved
- ✅ IAM roles intact
- ✅ Launch template intact
- ✅ Auto Scaling configuration intact
- ✅ VPC + Subnets intact
- ✅ Runtime billing eliminated

The system is in controlled cold storage mode and can be reactivated at any time.

---

# 🎯 RESULT

You now have:

- Full cost control
- No runtime waste
- Minimal monthly storage cost
- Complete restart capability
- Clean, production-grade architecture preserved
