FROM rockylinux:8

# Install Node.js 20
RUN dnf module enable -y nodejs:20 && \
    dnf install -y nodejs npm && \
    dnf clean all

# Create non-root user
RUN useradd -m -s /bin/bash appuser

# Copy ART CMD binary (compressed to bypass GitHub 100MB limit)
COPY art-cmd.gz /usr/local/bin/art-cmd.gz
RUN gunzip /usr/local/bin/art-cmd.gz && chmod +x /usr/local/bin/art-cmd

# Set up app directory
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production

COPY dist/ ./dist/

# Create temp directory
RUN mkdir -p /tmp/lut && chown appuser:appuser /tmp/lut

USER appuser

EXPOSE 8080

CMD ["node", "dist/server.js"]
