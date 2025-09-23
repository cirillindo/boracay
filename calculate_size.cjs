const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/DiniwidBeachPage.tsx',
  'src/pages/BulabogBeachPage.tsx',
  'src/pages/GuestHelpPage.tsx',
  'src/pages/IliganBeachPage.tsx',
  'src/pages/BeachesDashboardPage.tsx',
  'src/pages/PropertyServicesPage.tsx',
  'src/pages/TablasIslandPage.tsx',
  'src/pages/TambisaanBeachPage.tsx',
  'src/pages/WhiteBeachPage.tsx',
  'src/pages/WeDoBetterPage.tsx',
  'src/pages/PukaBeachPage.tsx',
  'package-lock.json',
  'src/components/admin/PropertyForm.tsx',
  'src/pages/ActivitiesPage.tsx',
  'src/pages/AboutPage.tsx',
  'src/pages/BoracayDreamMoveCalculator.tsx',
  'src/pages/BoracayHomesForSalePage.tsx',
  'src/pages/CheapHousesBoracayPage.tsx',
  'src/pages/ContactPage.tsx',
  'src/pages/HomePage.tsx',
  'src/pages/PrivacyPolicy.tsx',
  'src/pages/ForSalePage.tsx',
  'src/pages/VacationRentalManagementPage.tsx'
];

let totalSize = 0;
let allFilesFound = true;

console.log('Calculating total size of specified files...');

for (const file of files) {
  const filePath = path.join(process.cwd(), file); // Ensure correct path from current working directory
  try {
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
    console.log(`  ${file}: ${stats.size} bytes`);
  } catch (error) {
    console.error(`  Error reading file ${file}: ${error.message}`);
    allFilesFound = false;
  }
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

console.log('\n--- Result ---');
if (allFilesFound) {
  console.log(`Total size of all specified files: ${formatBytes(totalSize)}`);
} else {
  console.log('Could not calculate total size because some files were not found or accessible.');
  console.log(`Partial total size (for found files): ${formatBytes(totalSize)}`);
}
