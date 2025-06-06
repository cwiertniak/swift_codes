# SWIFT Codes API

A RESTful API for managing SWIFT codes (Bank Identifier Codes) built with TypeScript, Express, and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- (Optional) PostgreSQL if running outside Docker

## Getting Started

### Running with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/cwiertniak/swift_codes.git
   cd swift_codes
   ```

2. Create an `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

3. Place your SWIFT codes CSV file in the `data` folder:

4. Build and start the Docker containers:
   ```bash
   docker-compose up --build
   ```

5. The API will be available at http://localhost:8080

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/cwiertniak/swift_codes.git
   cd swift_codes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create an `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Make sure PostgreSQL is running and update the database configuration in `.env`

5. Build the TypeScript code:
   ```bash
   npm run build
   ```

6. Start the application:
   ```bash
   npm start
   ```

7. The API will be available at http://localhost:8080

## API Endpoints

### Get SWIFT Code Details

```
GET /v1/swift-codes/{swift-code}
```

### Get SWIFT Codes by Country

```
GET /v1/swift-codes/country/{countryISO2code}
```

### Add New SWIFT Code

```
POST /v1/swift-codes
```

#### Request

```json
{
  "address": string,
  "bankName": string,
  "countryISO2": string,
  "countryName": string,
  "isHeadquarter": bool,
  "swiftCode": string,
}
```

### Delete SWIFT Code

```
DELETE /v1/swift-codes/{swift-code}
```

## Testing

Run all tests:

```bash
npm test
```

Run unit tests:

```bash
npm run test:unit
```

Run integration tests:

```bash
npm run test:integration
```
