# Quick Deploy Script for Binance Futures API Proxy (PowerShell)

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🚀 Binance Futures API Proxy - Quick Deploy        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found" -ForegroundColor Red
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
}

# Check if already logged in
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Yellow

try {
    $whoami = vercel whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Already logged in to Vercel as: $whoami" -ForegroundColor Green
    } else {
        Write-Host "🔐 Please login to Vercel..." -ForegroundColor Yellow
        vercel login
    }
} catch {
    Write-Host "🔐 Please login to Vercel..." -ForegroundColor Yellow
    vercel login
}

Write-Host ""
Write-Host "📋 Deployment Options:" -ForegroundColor Cyan
Write-Host "  1. Preview Deployment (test first)" -ForegroundColor White
Write-Host "  2. Production Deployment" -ForegroundColor White
Write-Host ""

$option = Read-Host "Choose option (1 or 2)"

if ($option -eq "1") {
    Write-Host ""
    Write-Host "🚀 Deploying preview version..." -ForegroundColor Yellow
    vercel
    Write-Host ""
    Write-Host "✅ Preview deployment complete!" -ForegroundColor Green
    Write-Host "📝 Test the preview URL before deploying to production" -ForegroundColor Cyan
}
elseif ($option -eq "2") {
    Write-Host ""
    Write-Host "🚀 Deploying to production..." -ForegroundColor Yellow
    vercel --prod
    Write-Host ""
    Write-Host "✅ Production deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Test health check: Invoke-WebRequest https://your-url.vercel.app/api/health" -ForegroundColor White
    Write-Host "  2. Open Swagger: https://your-url.vercel.app/api-docs" -ForegroundColor White
    Write-Host "  3. Update bot URLs (see UPDATE_GUIDE.md)" -ForegroundColor White
}
else {
    Write-Host "❌ Invalid option" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment successful!" -ForegroundColor Green
Write-Host "📚 Documentation: /api-docs" -ForegroundColor Cyan
Write-Host "💡 See DEPLOYMENT_GUIDE.md for next steps" -ForegroundColor Cyan

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
