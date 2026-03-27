FROM nginx:1.25-alpine

COPY nginx.conf /etc/nginx/nginx.conf

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed certificate for LAN use
RUN apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 3650 \
    -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/kiosk.key \
    -out /etc/nginx/ssl/kiosk.crt \
    -subj "/C=IN/ST=Local/L=Shop/O=KioskVision/CN=kiosk.local" \
    -addext "subjectAltName=DNS:kiosk.local,IP:192.168.1.10" && \
    apk del openssl

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
