# Currency Converter

## Project Overview
This is a currency conversion web application that allows users to input an amount in Australian dollars (AUD) and instantly convert it into five target currencies: USD, EUR, JPY, GBP, and CNY. The interface also provides a 14-day time series chart that visualizes historical exchange rates for the selected currency pair.

**Tech Stack:** ui:next.js 16 + react 19 + tailwindcss 4 + lucide / data:open exchange rates API / charts:recharts / testing:vitest + testing-library + happy-dom / tooling:pnpm + TypeScript + eslint


## Quick Start (Local Development)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd currency_converter
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   Create a file named `.env.development` in the project root and specify required credentials. Example:
   ```dotenv
   OXR_BASE_URL=https://openexchangerates.org/api
   OXR_APP_ID=your-openexchangerates-app-id
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Access the app**
   Navigate to [http://localhost:3000](http://localhost:3000). Hot module replacement is enabled, so the UI updates automatically when you edit files.

## Running via Docker (Development)

1. Ensure Docker is running on your machine.
2. Copy `.env.development` (with the required `OXR_BASE_URL` and `OXR_APP_ID`) into the project root.
3. Build and start the dev container using the provided compose file:
   ```bash
   docker compose -f compose.dev.yml up --build
   ```
4. Your app will be available at [http://localhost:3000](http://localhost:3000), and code changes on the host filesystem will be hot-reloaded inside the container.
5. To stop the container, press `Ctrl+C` or run `docker compose -f compose.dev.yml down`.

## Deploying with Docker Compose (Production)

1. Prepare a production env file (e.g. `.env.production`) with the required secrets:
   ```dotenv
   OXR_BASE_URL=https://openexchangerates.org/api
   OXR_APP_ID=your-openexchangerates-app-id
   ```
2. Build and start the runtime container using the production compose file:
   ```bash
   docker compose -f compose.production.yml up --build -d
   ```
   This will build the multi-stage Dockerfile and run the `runner` stage, exposing port 3000.
3. Verify the app at [http://localhost:3000](http://localhost:3000) or on your chosen host.
4. To inspect logs:
   ```bash
   docker compose -f compose.production.yml logs -f
   ```
5. To stop the service:
   ```bash
   docker compose -f compose.production.yml down
   ```

## Testing

Before running integration tests locally, create a `.env.test` file in the project root with your Open Exchange Rates credentials:
```dotenv
OXR_BASE_URL=https://openexchangerates.org/api
OXR_APP_ID=your-openexchangerates-app-id
```

1. **Run all tests (unit + integration)**  
   ```bash
   pnpm test
   ```

2. **Unit tests only** (fast feedback, no external calls)  
   ```bash
   pnpm test:unit
   ```

3. **Integration tests only** (hits real OXR API)  
   ```bash
   pnpm test:integration
   ```
   Requires the `.env.test` file (or equivalent environment variables) described above.

4. **Continuous integration run with coverage**  
   ```bash
   pnpm test:ci
   ```
   Generates coverage reports under `coverage/`.
