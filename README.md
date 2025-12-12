# Cloud Visitor Log - GCP Assignment

## 1. Application Overview
This is a cloud-native Node.js application built for the Google Cloud Platform (GCP) assignment. It allows users to view and sign a digital guestbook. It demonstrates the orchestration of multiple GCP services including compute, database, and secret management.

**Key Features:**
-   **Frontend**: Responsive, premium "glassmorphism" UI using EJS and CSS.
-   **Backend**: Node.js (Express).
-   **Database**: PostgreSQL on Google Cloud SQL.
-   **Configuration**: Secrets managed via Google Secret Manager.
-   **CI/CD**: Fully automated deployment via Google Cloud Build.

## 2. Architecture & Services (Requirement 1)
The application utilizes the following Google Cloud services:

1.  **Google App Engine (Standard Environment)**
    -   **Role**: Compute / Host.
    -   **Why**: Fully managed serverless platform that scales automatically to zero when not in use. Perfect for simple web apps.
    -   **Config**: `app.yaml` using `nodejs20` runtime.

2.  **Google Cloud SQL (PostgreSQL)**
    -   **Role**: Relational Database.
    -   **Why**: Managed SQL service ensuring high availability and automated backups.
    -   **Config**: Connected via Unix Socket in production (`/cloudsql/...`).

3.  **Google Secret Manager**
    -   **Role**: Security.
    -   **Why**: Stores the database password (`DB_PASSWORD`) securely. The application fetches this at runtime, so no secrets are hardcoded in the repository.

4.  **Google Cloud Build**
    -   **Role**: CI/CD Pipeline.
    -   **Why**: Automates the build and deployment process. Triggers automatically on GitHub commits.

## 3. Infrastructure Configuration (Requirement 3)
*   **`app.yaml`**: Defines the App Engine runtime (`nodejs20`) and instance class.
*   **`cloudbuild.yaml`**: Defines the 3-step pipeline:
    1.  `npm install`: Installs dependencies.
    2.  `node --check server.js`: Verifies syntax (CI step).
    3.  `gcloud app deploy`: Deploys to App Engine.
*   **`package.json`**: Defines dependencies (`pg` for Postgres, `@google-cloud/secret-manager`).

## 4. Deployment Instructions (Requirement 2 & 4)

### Prerequisites
1.  GCP Project with Billing enabled.
2.  APIs Enabled:
    -   App Engine Admin API
    -   Cloud Build API
    -   Secret Manager API
    -   Cloud SQL Admin API

### Step 1: Create Database
1.  Go to **Cloud SQL** console -> Create Instance -> PostgreSQL.
2.  Set ID to `visitor-db`, generate a password.
3.  Create a database named `visitor_log`.
4.  Copy the **Connection Name** (e.g., `project-id:region:visitor-db`).

### Step 2: Configure Secrets
1.  Go to **Secret Manager** console.
2.  Create Secret named `DB_PASSWORD`.
3.  Add the database password as the specific value.
4.  **Crucial**: Grant the App Engine Service Account (usually `PROJECT_ID@appspot.gserviceaccount.com`) the role **Secret Manager Secret Accessor**.

### Step 3: Connect Repository
1.  Push this folder (`GCP_Assignment`) to a **GitHub Repository**.
2.  Go to **Cloud Build** -> Triggers -> Create Trigger.
3.  Connect your GitHub repo.
4.  Path to Cloud Build Config: `GCP_Assignment/cloudbuild.yaml` (Important since it's in a subfolder).

### Step 4: Deploy
1.  Commit changes to GitHub.
2.  Watch Cloud Build trigger automatically.
3.  Visit your App Engine URL (e.g., `https://YOUR-PROJECT.appspot.com`).

## 5. Cost Analysis (Requirement 5)
*Estimated for 1,000 users/day*

| Service | SKU | Estimated Cost |
| :--- | :--- | :--- |
| **App Engine** | Standard F1 Instance (free tier eligible) | ~$0.00 / mo |
| **Cloud SQL** | db-f1-micro (Shared CPU) | ~$8.00 / mo |
| **Secret Manager** | 6 Access operations | < $0.01 / mo |
| **Cloud Build** | 120 Build minutes | Free (within 120 free mins) |
| **Total** | | **~$8.00 / month** |

---
*Created by [Your Name] for [Course Name] Assignment*
