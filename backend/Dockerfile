# Stage 1: Build the backend artifact using Maven and Eclipse Temurin JDK 21
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build application
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add unprivileged user for security
RUN addgroup -S hireflow && adduser -S hireflow -G hireflow
USER hireflow:hireflow

# Copy built jar from builder stage
COPY --from=builder /workspace/target/*.jar app.jar

# Expose backend port
EXPOSE 8080

# Configure production JVM parameters and entrypoint
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
