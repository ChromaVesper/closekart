import os

base_dir = "/Users/akshaykumar/.gemini/antigravity/scratch/closekart"

target_files = [
    "frontend/index.html",
    "frontend/src/components/Navbar.jsx",
    "frontend/src/components/Header.jsx",
    "frontend/src/components/Footer.jsx",
    "frontend/src/components/FounderBadge.jsx",
    "frontend/src/pages/About.jsx",
    "frontend/src/pages/Account.jsx",
    "frontend/src/pages/BuyerDashboard.jsx",
    "frontend/src/pages/Login.jsx",
    "frontend/src/pages/Profile.jsx",
    "frontend/src/pages/RegisterShop.jsx",
    "frontend/src/pages/SelectRole.jsx",
    "frontend/src/pages/SellerLogin.jsx",
    "frontend/src/pages/ShopkeeperDashboard.jsx",
    "frontend/src/pages/admin/AdminDashboard.jsx",
    "backend/server.js",
    "backend/routes/auth.js",
    "backend/seed.js",
    "backend/utils/sendEmail.js",
    "backend/utils/sendOTP.js"
]

replacements = {
    "Nearzo's": "CloseKart's",
    "Nearzo": "CloseKart",
    "NEARZO": "CLOSEKART",
    "nearzo@gmail.com": "closekarts@gmail.com",
    "noreply@nearzo.com": "noreply@closekart.com",
    "admin@nearzo.com": "admin@closekart.com"
}

for filepath in target_files:
    full_path = os.path.join(base_dir, filepath)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        original_content = content
        for old, new in replacements.items():
            content = content.replace(old, new)
            
        if content != original_content:
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {filepath}")
    else:
        print(f"File not found: {filepath}")
