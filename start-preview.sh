#!/bin/bash

Test login credentials:
  - Email: jgramcoin@gmail.com
  - Password: TestPassword123!

# Strive SaaS - Local Development Preview Script

# CLI Command to start preview: ./start-preview.sh

echo "🚀 Starting Strive SaaS Local Preview..."
echo "════════════════════════════════════════"

# Navigate to app directory
cd app

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client if needed
echo "🔄 Generating Prisma client..."
npm run prisma:generate

# Start development server
echo "🌟 Starting Next.js development server..."
echo "💡 Your app will be available at: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

npm run dev