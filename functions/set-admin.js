/**
 * One-Time Firebase Admin Custom Claim Assignment Script
 * Forma Living Project: forma-living
 *
 * Usage:
 *   cd functions
 *   node set-admin.js <TARGET_FIREBASE_AUTH_UID>
 */

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// 1. Require target Firebase Auth UID as a command-line argument
const targetUid = process.argv[2]?.trim();

if (!targetUid) {
  console.error('\n❌ Error: Missing target Firebase Auth UID.\n');
  console.log('Usage:');
  console.log('  node set-admin.js <TARGET_FIREBASE_AUTH_UID>\n');
  console.log('Example:');
  console.log('  node set-admin.js 4N7x9Pq2LkLmNoPqRsTuVwXyZ123\n');
  process.exit(1);
}

// 2. Initialize Firebase Admin explicitly with project ID 'forma-living' and Application Default Credentials
const projectId = 'forma-living';

try {
  initializeApp({
    credential: applicationDefault(),
    projectId: projectId,
  });
} catch (initErr) {
  console.error('\n❌ Firebase Admin Initialization Failed:', initErr.message);
  console.error('\nPlease authenticate using Google Cloud Application Default Credentials:');
  console.error('  gcloud auth application-default login\n');
  process.exit(1);
}

const auth = getAuth();

async function setAdminClaim() {
  console.log(`\n🔍 Looking up Firebase user with UID: "${targetUid}" in project "${projectId}"...`);

  try {
    // 3. Look up user and retrieve existing claims
    const user = await auth.getUser(targetUid);
    const existingClaims = user.customClaims || {};

    console.log(`👤 User Found: ${user.email || 'No email'} (UID: ${user.uid})`);
    console.log('📋 Existing Custom Claims:', JSON.stringify(existingClaims, null, 2));

    // 4. Preserve existing claims and add/update admin: true
    const updatedClaims = {
      ...existingClaims,
      admin: true,
    };

    await auth.setCustomUserClaims(targetUid, updatedClaims);

    // 5. Verify the updated claims
    const updatedUser = await auth.getUser(targetUid);

    console.log('\n✅ Success! Admin custom claim assigned successfully.');
    console.log('Updated Custom Claims:', JSON.stringify(updatedUser.customClaims, null, 2));
    console.log('\n💡 Next Steps for the User:');
    console.log('  1. In the web app, sign out and sign back in (or refresh the token) for the new claim to take effect.');
    console.log('  2. Visit /admin to verify access.\n');
  } catch (error) {
    console.error('\n❌ Failed to set admin claim:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.error(`\nNo user exists in Firebase Auth with UID "${targetUid}". Please verify the UID in your Firebase Console.`);
    } else if (error.code === 'app/invalid-credential') {
      console.error('\nYour Application Default Credentials are not valid. Run: gcloud auth application-default login');
    }
    process.exit(1);
  }
}

setAdminClaim();

