# HireFlow AWS Cloud Deployment Readiness Guide

This document describes the target production architecture, network topology, infrastructure provisioning, and deployment strategy for running HireFlow on Amazon Web Services (AWS).

---

## 1. Target AWS Cloud Architecture

```mermaid
flowchart TD
    subgraph Route53_Edge [DNS & Edge Acceleration]
        R53["Route 53 Hosted Zone"]
        CF_FE["CloudFront Distribution<br/>(SPA Web Client)"]
        ALB["Application Load Balancer (ALB)<br/>(TLS 1.3 Termination via ACM)"]
    end

    subgraph AWS_VPC [VPC 10.0.0.0/16]
        subgraph Public_Subnets [Public Subnets (AZ1, AZ2)]
            NAT["NAT Gateways"]
        end

        subgraph Private_App_Subnets [Private Application Subnets]
            ECS["ECS Fargate Service / EKS<br/>(Spring Boot Backend Tasks)"]
        end

        subgraph Isolated_Data_Subnets [Isolated Database Subnets]
            RDS[("Amazon RDS PostgreSQL 16<br/>(Multi-AZ, KMS Encrypted)")]
        end
    end

    subgraph AWS_Managed_Services [AWS Serverless & Storage Tier]
        S3_DOCS[("Amazon S3 Bucket<br/>(Candidate Documents & Resumes)")]
        SM["AWS Secrets Manager<br/>(DB Passwords, JWT Secret)"]
        CW["Amazon CloudWatch Logs & Alarms"]
    end

    R53 --> CF_FE & ALB
    CF_FE -->|Static Assets| S3_DOCS
    ALB -->|Forward /api/v1/*| ECS
    ECS -->|JDBC / SSL| RDS
    ECS -->|AWS SDK v2 (S3 API)| S3_DOCS
    ECS -->|Fetch Secrets on Startup| SM
    ECS -->|Stdout Logs| CW
```

---

## 2. Infrastructure Components

### 2.1 Compute Tier (ECS Fargate)
- **Container Engine:** AWS Elastic Container Service (ECS) running on AWS Fargate (serverless containers).
- **Auto-Scaling:** Target tracking policies on CPU utilization (threshold 70%) and ALB request count per target.
- **Task Definition:** 1 vCPU, 2GB RAM per task. Minimum 2 tasks across AZ1 and AZ2 for high availability.
- **Zero-Downtime Deployments:** ECS rolling update with minimum healthy percent = 100% and maximum percent = 200%.

### 2.2 Database Tier (Amazon RDS PostgreSQL)
- **Engine:** PostgreSQL 16.3 on `db.t4g.medium` (or `db.r6g.large` for high concurrency).
- **Storage:** General Purpose SSD (gp3) with 100GB initial storage and auto-scaling up to 1TB.
- **High Availability:** Multi-AZ enabled for synchronous standby replication and automatic failover.
- **Security:** Storage encrypted using AWS KMS customer managed key; SSL required (`rds.force_ssl=1`).

### 2.3 Document Storage (Amazon S3)
- **Bucket:** `hireflow-documents-${stage}`
- **Security:**
  - Block Public Access enabled on bucket level.
  - Server-Side Encryption with AWS KMS (SSE-KMS).
  - Versioning enabled to prevent accidental document loss.
  - Lifecycle rules transitioning inactive files to S3 Standard-Infrequent Access after 90 days.
- **Application Integration:**
  - The Spring Boot backend supports switching from local file storage to S3 by setting `HIREFLOW_STORAGE_TYPE=s3` and supplying `HIREFLOW_STORAGE_S3_BUCKET_NAME`.

---

## 3. Production Environment Variables

Configure these secrets in AWS Secrets Manager and inject them into ECS task definition:

| Variable | Source | Production Value / Description |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Task Definition | `prod` |
| `SPRING_DATASOURCE_URL` | Secrets Manager | `jdbc:postgresql://hireflow-rds.cluster-xyz.us-east-1.rds.amazonaws.com:5432/hireflow?ssl=true&sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Secrets Manager | `hireflow_admin` |
| `SPRING_DATASOURCE_PASSWORD` | Secrets Manager | Strong generated password |
| `HIREFLOW_JWT_SECRET` | Secrets Manager | 512-bit Base64-encoded secret key |
| `HIREFLOW_STORAGE_TYPE` | Task Definition | `s3` |
| `HIREFLOW_STORAGE_S3_BUCKET_NAME` | Task Definition | `hireflow-documents-production` |
| `HIREFLOW_STORAGE_S3_REGION` | Task Definition | `us-east-1` |

---

## 4. Database Migration Execution Strategy

In production, Flyway migrations should not be executed concurrently by multiple auto-scaled web tasks. Recommended pattern:

1. **ECS One-Off Task Execution:**
   - In the CI/CD pipeline (GitHub Actions), prior to updating the ECS service, trigger a one-off standalone ECS task that runs `java -jar app.jar` with a migration runner profile or Maven Flyway goal:
     ```bash
     aws ecs run-task \
       --cluster hireflow-prod \
       --task-definition hireflow-migration:latest \
       --launch-type FARGATE \
       --network-configuration "awsvpcConfiguration={subnets=[subnet-123],securityGroups=[sg-456]}"
     ```
2. **Backward-Compatible Schema Evolution:**
   - Flyway scripts must maintain backward compatibility with running code (expand-contract pattern) so that blue/green deployments do not fail during task replacement.
