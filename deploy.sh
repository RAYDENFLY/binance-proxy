#!/bin/bash
# Quick Deploy Script for Binance Futures API Proxy

echo "╔════════════════════════════════════════════════════════╗"
echo "║   🚀 Binance Futures API Proxy - Quick Deploy        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
fi

# Check if already logged in
echo "🔐 Checking Vercel authentication..."
if vercel whoami &> /dev/null
then
    echo "✅ Already logged in to Vercel"
else
    echo "🔐 Please login to Vercel..."
    vercel login
fi

echo ""
echo "📋 Deployment Options:"
echo "  1. Preview Deployment (test first)"
echo "  2. Production Deployment"
echo ""
read -p "Choose option (1 or 2): " option

if [ "$option" = "1" ]; then
    echo ""
    echo "🚀 Deploying preview version..."
    vercel
    echo ""
    echo "✅ Preview deployment complete!"
    echo "📝 Test the preview URL before deploying to production"
elif [ "$option" = "2" ]; then
    echo ""
    echo "🚀 Deploying to production..."
    vercel --prod
    echo ""
    echo "✅ Production deployment complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Test health check: curl https://your-url.vercel.app/api/health"
    echo "  2. Open Swagger: https://your-url.vercel.app/api-docs"
    echo "  3. Update bot URLs (see UPDATE_GUIDE.md)"
else
    echo "❌ Invalid option"
    exit 1
fi

echo ""
echo "🎉 Deployment successful!"
echo "📚 Documentation: /api-docs"
echo "💡 See DEPLOYMENT_GUIDE.md for next steps"
