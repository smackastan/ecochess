#!/bin/bash

# GitHub Repository Setup Script
# 
# Instructions:
# 1. Go to https://github.com/new
# 2. Create a new repository (name it 'ecochess' or your choice)
# 3. DO NOT initialize with README, .gitignore, or license
# 4. After creating, copy your repository URL
# 5. Run this script: bash setup-github.sh YOUR_GITHUB_USERNAME REPO_NAME
#
# Example: bash setup-github.sh yourusername ecochess

if [ "$#" -ne 2 ]; then
    echo "Usage: bash setup-github.sh YOUR_GITHUB_USERNAME REPO_NAME"
    echo "Example: bash setup-github.sh johndoe ecochess"
    exit 1
fi

USERNAME=$1
REPO_NAME=$2

echo "Setting up remote for https://github.com/$USERNAME/$REPO_NAME.git"
git remote add origin https://github.com/$USERNAME/$REPO_NAME.git
git branch -M main
git push -u origin main

echo ""
echo "✅ Done! Your code is now on GitHub at:"
echo "   https://github.com/$USERNAME/$REPO_NAME"
