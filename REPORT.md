# GCP Assignment Report

**Student Name:** [Your Name]
**Student ID:** [Your ID]

## 1. Application Overview
The "Visitor Log" is a cloud-native Node.js application that allows users to sign a digital guestbook. It demonstrates stateful application deployment on Google Cloud Platform.
- **Frontend**: EJS templates rendered by Express.js.
- **Backend**: Node.js Service handling HTTP requests.
- **Database**: PostgreSQL (Cloud SQL) for persistent storage of visitor messages.

## 2. Architecture Diagram
*(Insert your diagram here. Suggested tool: Google Diagrams or Draw.io)*

**Flow:**
1.  User accesses App Engine URL ->
2.  App Engine handling Traffic ->
3.  Server fetches Secrets from Secret Manager ->
4.  Server connects to Cloud SQL via Unix Socket ->
5.  Data returned to User.

## 3. GCP Services Description
### 1. App Engine (Standard Environment)
-   **Why**: Fully managed serverless platform. Handles auto-scaling (F1 instance class) and requires zero infrastructure management.
-   **Integration**: Hosting the Node.js application code defined in `app.yaml`.

### 2. Cloud SQL (PostgreSQL)
-   **Why**: Managed relational database service. Used for persistent storage of guestbook entries ensuring data survives application restarts.
-   **Integration**: Connected via public IP/proxy locally and Unix Sockets in production.

### 3. Secret Manager
-   **Why**: Secure storage for sensitive credentials (`DB_PASSWORD`).
-   **Integration**: The application code (`server.js`) fetches the password at runtime, ensuring no secrets are committed to GitHub.

### 4. Cloud Build
-   **Why**: Automated CI/CD pipeline.
-   **Integration**: Triggered by GitHub push events. Executes `cloudbuild.yaml` to install, test, and deploy the application.

## 4. Deployment Documentation
The deployment pipeline is fully automated using **Google Cloud Build**.

**Pipeline Steps (`cloudbuild.yaml`):**
1.  **Install**: Uses `npm install` to gather Node.js dependencies.
2.  **Verify**: Runs `node --check server.js` to ensure syntax correctness.
3.  **Deploy**: Authenticates using the `cloud-build-deployer` service account and runs `gcloud app deploy`.

**Triggers**:
-   A trigger `deploy-on-push` is configured to watch the `main` branch of the GitHub repository.
-   Any push event initiates the pipeline.

## 5. Cost Calculation (Estimated)
*Based on Google Cloud Pricing Calculator (London/europe-west2)*

| Service | SKU | Estimated Cost |
| :--- | :--- | :--- |
| **Cloud SQL** | db-f1-micro / Storage | ~$9.00 / month |
| **App Engine** | F1 Instance (Free Tier eligible) | ~$0.00 (within limits) |
| **Cloud Build** | Build Minutes (First 120 free) | $0.00 |
| **Secret Manager** | Access Operations | < $0.01 |
| **Total** | | **~$9.00 / month** |
