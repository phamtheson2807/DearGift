#!/bin/bash

echo "🔥 Deploying Firebase Storage Rules..."

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if needed)
echo "🔑 Logging in to Firebase..."
firebase login --no-localhost

# Deploy storage rules
echo "📤 Deploying storage rules..."
firebase deploy --only storage

echo "✅ Firebase Storage rules deployed successfully!"
echo "🎵 Music uploads should now work!"
