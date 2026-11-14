# GitHub Upload & Deployment Guide — HireFlow

This guide explains how to publish **HireFlow** to GitHub, whether you prefer using a **Web Browser** or the **Git Command Line**.

---

## 1. Important Notes for Browser-Based GitHub Uploads

If you are uploading files directly through the **GitHub Web Interface** (`github.com` in your browser), keep these constraints in mind:

> [!WARNING]
> **GitHub Web Upload Limitations:**
> 1. **Batch Size Limit:** The GitHub web drag-and-drop uploader accepts a maximum of **100 files per upload batch**.
> 2. **File Size Limit:** The GitHub web interface rejects individual files larger than **25 MB**.
> 3. **Never Upload `node_modules` or `target`:** The `frontend/node_modules/` directory contains thousands of dependencies, and `backend/target/` contains compiled `.class` and `.jar` binaries. Attempting to drag-and-drop either into a web browser will freeze the browser tab and exceed GitHub's upload limits.

Because of this, we recommend:
- **Method 1 (Command Line Git Push — Recommended):** Takes 10 seconds, uploads the entire repository with full history in one command, and never hits file count limits.
- **Method 2 (GitHub Web Browser Upload):** Uploading root configurations and subfolder source trees in clean batches.
- **Method 3 (Clean Zip Release Package):** Packaging a clean source archive (excluding `node_modules` and `target`) for upload as a GitHub Release asset or backup.

---

## 2. Method 1: Git Command Line Push (Recommended — 10 Seconds)

Since Git is already initialized in this repository with clean commits and a comprehensive `.gitignore`, pushing to GitHub takes less than a minute.

### Step 1: Create a New Repository on GitHub
1. Open [https://github.com/new](https://github.com/new) in your web browser.
2. Set **Repository name** to: `HireFlow` (or your preferred name).
3. Set visibility to **Public** or **Private**.
4. **DO NOT** check *"Add a README file"*, *"Add .gitignore"*, or *"Choose a license"* (these already exist in the project).
5. Click **Create repository**.

### Step 2: Push Your Local Repository
Open a terminal (PowerShell or Bash) and run:

```powershell
cd C:\Users\Dell\.gemini\antigravity\scratch\HireFlow

# 1. Rename default branch to main
git branch -M main

# 2. Link your GitHub remote repository (replace with your GitHub username)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/HireFlow.git

# 3. Push all commits, branches, and tags
git push -u origin main
```

*When prompted, sign in with your GitHub credentials or Personal Access Token (PAT). All commits, branches, and documentation will upload automatically.*

---

## 3. Method 2: Browser Upload via GitHub Web Interface

If you do not have Git credentials configured locally and want to upload strictly through the browser:

### Step 1: Create a Repository on GitHub
1. Navigate to [https://github.com/new](https://github.com/new).
2. Name the repository `HireFlow` and click **Create repository**.
3. On the repository setup page, click the link: **"uploading an existing file"** (or open `https://github.com/<YOUR_USERNAME>/HireFlow/upload/main`).

### Step 2: Upload Files in Clean Batches
To avoid GitHub's 100-file per upload limit:

#### Batch 1: Root Configuration Files & Documentation
Drag and drop these files and folders into the browser:
- `README.md`
- `docker-compose.yml`
- `.gitignore`
- `.env.example`
- `LICENSE`
- The entire `docs/` folder (14 markdown specification files)
- The `.github/` folder (CI/CD workflow)

Enter a commit message like `docs: initialize documentation and configuration` and click **Commit changes**.

#### Batch 2: Backend Source Code
1. Click **Add file** ➔ **Upload files**.
2. Drag and drop:
   - `backend/pom.xml`
   - The entire `backend/src/` folder (main & test Java sources and Flyway SQL migrations)
   - Do **NOT** drag `backend/target/`

Enter a commit message like `feat(backend): add Spring Boot 3.3 modular monolith backend` and click **Commit changes**.

#### Batch 3: Frontend Source Code
1. Click **Add file** ➔ **Upload files**.
2. Drag and drop:
   - `frontend/package.json`
   - `frontend/vite.config.ts`
   - `frontend/tailwind.config.js`
   - `frontend/postcss.config.js`
   - `frontend/tsconfig.json`
   - `frontend/index.html`
   - The entire `frontend/src/` folder (React components, features, types, hooks)
   - Do **NOT** drag `frontend/node_modules/` or `frontend/dist/`

Enter a commit message like `feat(frontend): add React 18 TypeScript enterprise client` and click **Commit changes**.

#### Batch 4: Secondary Tools & Infrastructure
1. Click **Add file** ➔ **Upload files**.
2. Drag and drop:
   - `tools/candidate-importer/` (Python CLI tool & tests)
   - `infra/` (Dockerfiles & Nginx configs)
   - `data/` (`.gitkeep` and sample templates)

Enter a commit message like `chore: add docker infrastructure and candidate importer utility` and click **Commit changes**.

---

## 4. Method 3: Generating a Clean Source ZIP for Release

If you need a clean archive of the project for a **GitHub Release**, portfolio submission, or sharing with an examiner without the 200MB+ `node_modules` or `target` folders, run this PowerShell script:

```powershell
# Open terminal at repository root
cd C:\Users\Dell\.gemini\antigravity\scratch\HireFlow

# Generate clean zip package excluding build artifacts
$destination = "..\HireFlow-Source-Clean.zip"
Get-ChildItem -Path . -Exclude "target", "node_modules", "dist", ".git", ".pytest_cache", "__pycache__" | 
  Compress-Archive -DestinationPath $destination -Force

Write-Host "Pristine source bundle created at: $destination"
```

This creates a lightweight `HireFlow-Source-Clean.zip` (< 15 MB) that can be dragged into GitHub Releases or sent directly to evaluators.

---

## 5. Post-Upload Verification Checklist

Once uploaded to GitHub, verify that your repository displays:

- [ ] **Interactive README:** Rendered on the homepage with tech stack badges, architecture diagrams, and quickstart instructions.
- [ ] **Flyway Database Migrations:** Located in `backend/src/main/resources/db/migration/`.
- [ ] **GitHub Actions CI/CD:** Visible under the **Actions** tab (`.github/workflows/ci.yml`).
- [ ] **No Bloated Folders:** Verify that neither `node_modules` nor `target` are present in the repository tree.
- [ ] **Documentation Links:** Ensure links in `README.md` pointing to `docs/` open smoothly in GitHub's markdown viewer.
