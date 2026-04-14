IN REDACTION

# Superstack

## Wordpress

Custom WordPress theme built on top of the block editor (Gutenberg), running in a Docker-based local development environment.

### Prerequisites

- Docker
- Node.js / npm

### Getting Started

1. *(Optional)* Set up Composer auth for privately hosted packages:
   ```bash
   npm --prefix ./wordpress run setup-composer-auth -- <domain> <username> <password>
   ```
2. Start the local environment:
   ```bash
   npm --prefix ./wordpress start
   ```

### Available Scripts

| Command | Description |
| --- | --- |
| `start` | Start the WordPress development environment |
| `stop` | Stop the WordPress development environment |
| `setup-composer-auth` | Set one Composer auth entry (`domain user password`) |
| `dev` | Start development theme assets build |
| `build` | Build theme assets |
| `clear-cache` | Clear patterns cache |

### Development

```bash
    npm --prefix ./wordpress run dev
```

For more details, see the [WordPress README](wordpress/README.md).

## Next.js

### Installation

```bash
    cd next
    npm install
```

## Development

```bash
    npm run dev
```
