# SSL Certificates

This directory should contain your SSL certificates for the nginx reverse proxy.
We recommend using [mkcert](https://github.com/FiloSottile/mkcert) for local development certificates.

## Required Files

Place the following files in this directory:

### Main Domain (samantree.local)

- `samantree.local.pem` - Your SSL certificate file for samantree.local
- `samantree.local.key` - Your private key file for samantree.local

### US Domain (us.samantree.local)

- `us.samantree.local.pem` - Your SSL certificate file for us.samantree.local
- `us.samantree.local.key` - Your private key file for us.samantree.local

## Certificate Formats

The certificates should be in PEM format:

### Certificate file (cert.pem)

```
-----BEGIN CERTIFICATE-----
[Your certificate content here]
-----END CERTIFICATE-----
```

### Private key file (key.pem)

```
-----BEGIN PRIVATE KEY-----
[Your private key content here]
-----END PRIVATE KEY-----
```

## For Development

We recommend using [mkcert](https://github.com/FiloSottile/mkcert) for local development certificates.
mkcert creates locally-trusted development certificates with zero configuration.

### Install mkcert

```bash
# macOS
brew install mkcert
brew install nss # If you use FireFox
```

### Generate Certificates

```bash
# Install the local CA (one-time setup)
mkcert -install

# Generate certificates for all domains
cd wordpress/nginx/certs
mkcert samantree.local
mkcert us.samantree.local

# This creates a single certificate file that covers all domains
# Rename to the required filenames:
mv samantree.local.pem samantree.local.pem
mv samantree.local-key.pem samantree.local.key
mv us.samantree.local.pem us.samantree.local.pem
mv us.samantree.local-key.pem us.samantree.local.key
```

## Security Note

Never commit actual private keys to version control. Add `*.pem` to your `.gitignore` file.
