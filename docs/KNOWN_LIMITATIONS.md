# HireFlow Architectural Tradeoffs & Known Limitations

In accordance with product principles (preferring understandable engineering over unnecessary complexity), certain architectural choices and deliberate tradeoffs were made.

---

## 1. Deliberate Architectural Tradeoffs

### 1.1 In-Memory & Event-Driven Monolith vs Message Broker
- **Decision:** Asynchronous post-transaction operations (notifications, audit logging) use Spring Application Events (`@Async` listeners) backed by thread pools rather than Apache Kafka or RabbitMQ.
- **Tradeoff:** Simplifies deployment, operations, and developer onboarding without broker overhead. For extreme scale (>10,000 events/sec), an external broker like AWS SQS or Kafka could replace the internal event bus.

### 1.2 Relational Text Search vs Elasticsearch
- **Decision:** Candidate, requisition, and lead keyword searches utilize PostgreSQL B-tree indexes and `ILIKE` / TSVector operators.
- **Tradeoff:** Avoids operating and synchronizing a dedicated Elasticsearch cluster. Sufficient for hundreds of thousands of active requisitions and candidate records.

### 1.3 Meeting Integration vs Native WebRTC Calling
- **Decision:** Recruiters paste standard meeting links (Google Meet, Zoom, Microsoft Teams) during interview scheduling.
- **Tradeoff:** Avoids managing complex WebRTC TURN/STUN infrastructure while allowing companies to use their approved enterprise communication tools.

---

## 2. Production Enhancements & Roadmap

1. **Malware / Virus Scanning:**
   - Document uploads currently validate binary MIME types with Apache Tika and SHA-256 integrity.
   - For enterprise production, an AWS Lambda triggered by S3 `ObjectCreated` events running ClamAV or Amazon GuardDuty is recommended.

2. **External Email / SMS Delivery:**
   - In-app notification infrastructure is fully operational with live unread indicators.
   - Integrating Amazon SES or Twilio for transactional emails/SMS would complement in-app alerts.

3. **Multi-Region Active-Active Database Replication:**
   - Current architecture uses AWS RDS Multi-AZ within a single region. Multi-region deployments would require Aurora Global Database.
