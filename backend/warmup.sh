#!/bin/sh
set -e
for PAPER_VER in \
  "1.20.1-R0.1-SNAPSHOT:17" \
  "1.20.4-R0.1-SNAPSHOT:17" \
  "1.20.6-R0.1-SNAPSHOT:17" \
  "1.21.1-R0.1-SNAPSHOT:21" \
  "1.21.4-R0.1-SNAPSHOT:21"; do
  MAVEN_VER="${PAPER_VER%%:*}"
  JAVA_VER="${PAPER_VER##*:}"
  DIR="/warmup/warmup-${MAVEN_VER}"
  mkdir -p "${DIR}/src/main/java/com/warmup"
  printf 'package com.warmup;\npublic class Warmup {}\n' \
    > "${DIR}/src/main/java/com/warmup/Warmup.java"
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
  mvn -f "${DIR}/pom.xml" clean package -DskipTests -q
done
rm -rf /warmup
