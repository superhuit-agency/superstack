# Nginx Reverse Proxy Setup

This nginx configuration provides SSL termination and reverse proxy functionality for your Next.js application using separate vhost configurations.

## Architecture

```
Internet → Nginx (SSL Termination) → Next.js (localhost:3000)
```

## Domain Structure

- **Main Domain**: `samantree.local` and `admin.samantree.local`
- **US Domain**: `us.samantree.local` and `admin.us.samantree.local`

## Features

- **SSL Termination**: Handles HTTPS encryption/decryption
- **HTTP to HTTPS Redirect**: Automatically redirects all HTTP traffic to HTTPS
- **Security Headers**: Includes comprehensive security headers
- **Rate Limiting**: Protects against abuse with rate limiting
- **Static File Caching**: Optimizes performance for static assets
- **CORS Support**: Handles CORS for GraphQL endpoints

## Setup Instructions

### 1. SSL Certificates

Setup and install the certificates for development [instructions](./certs/README.md)

### 2. Configure custom domain locally

Edit the `/etc/hosts` file with you favorite editor

> e.g. `nano /etc/hosts`

Add the following domains mapping

```
127.0.0.1    samantree.local
127.0.0.1    us.samantree.local
```

### 3. Start developping

- Start docker containers `npm --prefix ./wordpress run start`
- Start Nextjs `npm run dev`

## Access Points

- **Main Domain HTTPS**: `https://samantree.local`
- **US Domain HTTPS**: `https://us.samantree.local`
- **Backend**: `http://localhost/wp-admin`

## Configuration Details

### Upstream Configuration

The nginx proxy forwards requests to `host.docker.internal:3000`, which allows the Docker container to access your local Next.js development server.

### Security Features

- TLS 1.2 and 1.3 support
- Strong cipher suites
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Rate limiting for API endpoints

### Performance Optimizations

- Gzip compression
- Static file caching
- Connection keep-alive
- HTTP/2 support

## Troubleshooting

### Certificate Issues

If you get SSL certificate errors:

1. Verify certificates are in the correct format (PEM)
2. Check file permissions
3. Ensure certificate matches your domain

### Connection Issues

If nginx can't reach Next.js:

1. Verify Next.js is running on port 3000
2. Check that `host.docker.internal` resolves correctly
3. Ensure no firewall is blocking the connection

### Logs

View nginx logs:

```bash
docker-compose logs nginx
```

## Customization

### Adding New Routes

Edit the appropriate vhost file in `vhosts/` to add specific routing rules:

```nginx
# In vhosts/samantree.conf or vhosts/us.samantree.conf
location /custom-path {
    proxy_pass http://nextjs;
    # ... proxy headers
}
```

### Modifying Rate Limits

Adjust rate limiting in the main `nginx.conf` file:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

### Adding New Domains

To add a new domain, create a new vhost file in the `vhosts/` directory:

```nginx
# vhosts/new-domain.conf
server {
    listen 443 ssl http2;
    server_name new-domain.local admin.new-domain.local;

    ssl_certificate /etc/nginx/certs/new-domain.local.pem;
    ssl_certificate_key /etc/nginx/certs/new-domain.local.key;

    # ... rest of configuration
}
```

### Changing Upstream

To proxy to a different service, modify the upstream block in `nginx.conf`:

```nginx
upstream nextjs {
    server your-service:port;
}
```
