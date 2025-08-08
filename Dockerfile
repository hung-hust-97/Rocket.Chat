# ========== Stage 1: Build Meteor app ==========

FROM node:14.21.3 AS builder

# Cài công cụ cần thiết để cài Meteor & build
RUN sed -i 's|http://deb.debian.org|http://archive.debian.org|g' /etc/apt/sources.list \
 && sed -i '/security.debian.org/d' /etc/apt/sources.list \
 && echo 'Acquire::Check-Valid-Until "false";\nAcquire::AllowInsecureRepositories "true";' > /etc/apt/apt.conf.d/99insecure \
 && apt-get update \
 && apt-get install -y \
    curl \
    g++ \
    build-essential \
    git \
    python2-minimal

# Cài Meteor (Meteor chỉ dùng ở builder stage)
RUN curl https://install.meteor.com/?release=2.16 | sh

# Tạo folder làm việc
WORKDIR /project

# Copy toàn bộ source code
COPY . .

# Cho phép chạy Meteor với quyền root
ENV METEOR_ALLOW_SUPERUSER=true

# Build ứng dụng Meteor
RUN yarn \
    && yarn build \
    && cd apps/meteor \
    && /root/.meteor/meteor build --server-only --directory /build \
    && rm -rf /root/.meteor ~/.cache /tmp/*

# ========== Stage 2: Runtime image ==========

FROM node:14.21.3-slim

# Tạo user riêng biệt
RUN groupadd -g 65533 -r rocketchat \
    && useradd -u 65533 -r -g rocketchat rocketchat \
    && mkdir -p /app/uploads

WORKDIR /app

# Chỉ copy phần bundle đã build (đã đủ để chạy)
COPY --from=builder /build/bundle /app

# Cài npm dependencies (cần cho server)
RUN echo 'Acquire::Check-Valid-Until "false";\nAcquire::AllowInsecureRepositories "true";' > /etc/apt/apt.conf.d/99insecure \
 && sed -i 's|http://deb.debian.org|http://archive.debian.org|g' /etc/apt/sources.list \
 && sed -i '/security.debian.org/d' /etc/apt/sources.list \
 && apt-get update \
 && apt-get install -y ca-certificates \
 && cd /app/programs/server \
 && npm install \
 && apt-get purge -y --auto-remove \
 && npm cache clean --force \
 && rm -rf /var/lib/apt/lists/* /tmp/*

# Chuyển quyền thư mục
RUN chown -R rocketchat:rocketchat /app

USER rocketchat

VOLUME /app/uploads

# Thiết lập biến môi trường
ENV DEPLOY_METHOD=docker \
    NODE_ENV=production \
    MONGO_URL=mongodb://mongo:27017/rocketchat \
    HOME=/tmp \
    PORT=3000 \
    ROOT_URL=http://localhost:3000 \
    Accounts_AvatarStorePath=/app/uploads

EXPOSE 3000

CMD ["node", "main.js"]
