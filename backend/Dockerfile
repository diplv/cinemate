FROM rockylinux:8

# Install Node.js 20
RUN dnf module enable -y nodejs:20 && \
    dnf install -y nodejs npm && \
    dnf clean all

# Create non-root user
RUN useradd -m -s /bin/bash appuser

# Copy ART CMD binaries and shared libraries
COPY art-cmd.gz /usr/local/bin/art-cmd.gz
COPY look-builder.gz /usr/local/bin/look-builder.gz
COPY lib.tar.gz /tmp/lib.tar.gz

RUN gunzip /usr/local/bin/art-cmd.gz && chmod +x /usr/local/bin/art-cmd && \
    gunzip /usr/local/bin/look-builder.gz && chmod +x /usr/local/bin/look-builder && \
    tar -xzvf /tmp/lib.tar.gz -C /usr/local/lib/ && \
    mv /usr/local/lib/lib/* /usr/local/lib/ && \
    rm -r /usr/local/lib/lib /tmp/lib.tar.gz && \
    ldconfig

ENV LD_LIBRARY_PATH="/usr/local/lib:${LD_LIBRARY_PATH}"

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
