# MARA Claim System Deployment Guide

This document provides instructions for deploying the MARA Claim System to Render.com.

## Prerequisites

- A Render.com account
- Access to the GitHub repository containing the project code

## Deployment Steps

### Option 1: Deploy via render.yaml (Recommended)

1. Fork or clone the repository to your own GitHub account.
2. Log into your Render.com account.
3. Navigate to the "Blueprints" section.
4. Click "New Blueprint Instance".
5. Connect your GitHub repository.
6. Render will automatically detect the `render.yaml` file and set up the deployment configuration.
7. Click "Apply" to start the deployment process.

### Option 2: Manual Deployment

#### Deploy the Web Service

1. Log into your Render.com account.
2. Navigate to the "Web Services" section.
3. Click "New Web Service".
4. Connect your GitHub repository.
5. Configure the service as follows:
   - **Name**: mara-claim-system
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Starter (for persistent disk)
   - **Health Check Path**: `/api/health`
   - **Add the following environment variables**:
     - `NODE_ENV`: production
     - `PORT`: 10000
     - `SESSION_SECRET`: (generate a secure random string)
     - `UPLOAD_DIR`: /var/uploads
   - **Add a disk**:
     - Name: uploads
     - Mount Path: /var/uploads
     - Size: 1 GB

#### Deploy the Database

1. Navigate to the "Databases" section.
2. Click "New PostgreSQL Database".
3. Configure the database:
   - **Name**: mara-claim-db
   - **Plan**: Free (or select a paid plan for production)
4. After the database is created, copy the Internal Database URL.
5. Go back to your web service settings.
6. Add the `DATABASE_URL` environment variable with the value of the Internal Database URL.

## After Deployment

1. Once the service is deployed, navigate to your web service URL.
2. The first run will automatically create the database tables and seed the initial admin user.
3. Log in with the default admin credentials:
   - Username: admin
   - Password: admin123
4. **Important**: Change the admin password immediately after the first login for security.

## Troubleshooting

- **File Uploads Not Working**: Check the disk mount configuration and ensure the `UPLOAD_DIR` environment variable is set correctly.
- **Database Connection Error**: Verify that the `DATABASE_URL` environment variable is set correctly.
- **Application Not Starting**: Check the service logs for error messages.

## Updating the Application

When you need to update the application:

1. Push changes to your GitHub repository.
2. Render will automatically detect changes and redeploy the application.
3. Monitor the deployment logs to ensure successful updates.

## Security Notes

- Change the default admin password immediately after deployment.
- In a production environment, set strong passwords and use a secure, randomly generated `SESSION_SECRET`.
- Consider enabling HTTPS for the application by using Render's automatic SSL/TLS provisioning.