# =============================================================================
# Stage 1: Install Python dependencies
# =============================================================================
FROM python:3.11-slim AS python-deps

WORKDIR /build

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt


# =============================================================================
# Stage 2: Pre-warm Maven dependency cache for all Paper API versions
# =============================================================================
FROM eclipse-temurin:21-jdk AS maven-warmup

ARG MAVEN_VERSION=3.9.9

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    curl -fsSL https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
      | tar xz -C /opt && \
    ln -s /opt/apache-maven-${MAVEN_VERSION} /opt/maven && \
    rm -rf /var/lib/apt/lists/*

ENV MAVEN_HOME=/opt/maven
ENV PATH="${MAVEN_HOME}/bin:${PATH}"

WORKDIR /warmup

# Download and cache Paper API dependencies for all 5 supported versions.
# Versions from version_config.py:
#   1.20.1-R0.1-SNAPSHOT (Java 17)
#   1.20.4-R0.1-SNAPSHOT (Java 17)
#   1.20.6-R0.1-SNAPSHOT (Java 17)
#   1.21.1-R0.1-SNAPSHOT (Java 21)
#   1.21.4-R0.1-SNAPSHOT (Java 21)
RUN for PAPER_VER in \
      "1.20.1-R0.1-SNAPSHOT:17" \
      "1.20.4-R0.1-SNAPSHOT:17" \
      "1.20.6-R0.1-SNAPSHOT:17" \
      "1.21.1-R0.1-SNAPSHOT:21" \
      "1.21.4-R0.1-SNAPSHOT:21"; \
    do \
      MAVEN_VER="${PAPER_VER%%:*}"; \
      JAVA_VER="${PAPER_VER##*:}"; \
      DIR="/warmup/warmup-${MAVEN_VER}"; \
      mkdir -p "${DIR}/src/main/java/com/warmup"; \
      printf 'package com.warmup;\npublic class Warmup {}\n' \
        > "${DIR}/src/main/java/com/warmup/Warmup.java"; \
      cat > "${DIR}/pom.xml" <<POMEOF
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.warmup</groupId>
    <artifactId>warmup</artifactId>
    <version>1.0</version>
    <packaging>jar</packaging>
    <properties>
        <maven.compiler.source>${JAVA_VER}</maven.compiler.source>
        <maven.compiler.target>${JAVA_VER}</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <repositories>
        <repository>
            <id>papermc</id>
            <url>https://repo.papermc.io/repository/maven-public/</url>
        </repository>
    </repositories>
    <dependencies>
        <dependency>
            <groupId>io.papermc.paper</groupId>
            <artifactId>paper-api</artifactId>
            <version>${MAVEN_VER}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
            </plugin>
        </plugins>
    </build>
</project>
POMEOF
      mvn -f "${DIR}/pom.xml" clean package -DskipTests -q; \
    done && \
    rm -rf /warmup


# =============================================================================
# Stage 3: Final runtime image
# =============================================================================
FROM python:3.11-slim AS runtime

LABEL maintainer="mcpluginbuilder" \
      description="Minecraft Plugin Builder API backend"

# Install Java 21 JDK (javac needed by Maven compiler plugin), gosu, and runtime deps
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      openjdk-21-jdk-headless \
      libpq5 \
      curl \
      gosu \
    && rm -rf /var/lib/apt/lists/*

# Install Maven
ARG MAVEN_VERSION=3.9.9
RUN curl -fsSL https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
      | tar xz -C /opt && \
    ln -s /opt/apache-maven-${MAVEN_VERSION} /opt/maven

ENV MAVEN_HOME=/opt/maven
# Use TARGETARCH (auto-set by BuildKit) for cross-platform JAVA_HOME
ARG TARGETARCH=amd64
ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-${TARGETARCH}
ENV PATH="${MAVEN_HOME}/bin:${JAVA_HOME}/bin:${PATH}"

# Create non-root user
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid 1000 --create-home --shell /bin/bash appuser

WORKDIR /app

# Copy Python venv from stage 1
COPY --from=python-deps /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy pre-warmed Maven cache from stage 2
COPY --from=maven-warmup /root/.m2 /home/appuser/.m2

# Copy application code
COPY . .

# Create required directories and set ownership for image-time paths
RUN mkdir -p /tmp/builds ./downloads && \
    chown -R appuser:appuser /app /home/appuser/.m2 /tmp/builds

# Entrypoint: fix ownership of volume mount points, then drop to appuser
COPY <<'ENTRY' /usr/local/bin/entrypoint.sh
#!/bin/sh
set -e
chown appuser:appuser /app/downloads /tmp/builds
exec gosu appuser "$@"
ENTRY
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

# Production defaults
ENV HOST=0.0.0.0 \
    PORT=8000 \
    DEBUG=false \
    ENVIRONMENT=production \
    MAVEN_PATH=mvn \
    MAX_BUILD_TIME=120 \
    MAX_CONCURRENT_BUILDS=3 \
    TEMP_DIR=/tmp \
    DOWNLOADS_DIR=/app/downloads

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

ENTRYPOINT ["entrypoint.sh"]
CMD ["python", "run.py"]
