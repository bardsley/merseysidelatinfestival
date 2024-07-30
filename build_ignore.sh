#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

if [[ "$VERCEL_GIT_COMMIT_REF" == "pricing" || "$VERCEL_GIT_COMMIT_REF" == "pricing-dev" ]] ; then
  # Don't build
  echo "🛑 - Build cancelled - dont deploy pricing directly"
  exit 0;
else
  # Proceed with the build
  echo "✅ - Build can proceed"
  exit 1;
fi