// Configuration - public (safe to keep in repo)
const CONFIG = {
  SHEET_NAME: 'Photos',
  EVENT_NAME: 'SpaceFest 2025',
  TAGLINE: 'Planet PlayZone',
  BRAND_PRIMARY: '#1800ad',
  BRAND_ACCENT: '#fbb03b',
  BRAND_BG: '#0b1020'
};

// Sensitive IDs (kept in Script Properties, not in GitHub)
function getSecretConfig() {
  const props = PropertiesService.getScriptProperties();
  const logoId = props.getProperty('LOGO_ID');
  const folderId = props.getProperty('PHOTOS_FOLDER_ID');

  if (!logoId) {
    throw new Error('LOGO_ID is not set in Script Properties.');
  }
  if (!folderId) {
    throw new Error('PHOTOS_FOLDER_ID is not set in Script Properties.');
  }

  return {
    logoId,
    folderId,
    logoThumbnailUrl: 'https://drive.google.com/thumbnail?id=' + logoId + '&sz=w200',
    logoDirectUrl: 'https://drive.google.com/uc?id=' + logoId
  };
}

// Test if logo is accessible
function testLogo() {
  const secrets = getSecretConfig();
  return 'Test this URL in your browser: ' + secrets.logoDirectUrl;
}

function fixLogoPermissions() {
  try {
    const secrets = getSecretConfig();
    const logoId = secrets.logoId;
    const file = DriveApp.getFileById(logoId);
    
    // Set proper sharing permissions
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Get the correct URL
    const directUrl = secrets.logoDirectUrl;

    return {
      success: true,
      message: 'Logo permissions fixed!',
      directUrl: directUrl,
      testUrl: directUrl + '&t=' + new Date().getTime() // Avoid cache
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Main function to handle web requests
function doGet(e) {
  // Handle case when doGet is called without parameters (from editor)
  if (!e || !e.parameter) {
    return serveUI('');
  }
  
  const action = (e.parameter.action || '').toLowerCase();
  const code = (e.parameter.code || '').trim();
  
  // Serve the main UI
  return serveUI(code);
}

// Serve the main user interface
function serveUI(code) {
  const htmlTemplate = HtmlService.createTemplateFromFile('Page');
  htmlTemplate.prefillCode = code || '';
  const secrets = getSecretConfig();
  htmlTemplate.config = Object.assign({}, CONFIG, {
    LOGO_URL: secrets.logoThumbnailUrl
  });
  
  return htmlTemplate.evaluate()
    .setTitle(`${CONFIG.EVENT_NAME} • ${CONFIG.TAGLINE}`)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Find a row by code in the sheet
function findRowByCode(code) {
  if (!code) return null;
  
  const sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const codeIndex = headers.indexOf('code');
  const fileIdIndex = headers.indexOf('fileId');
  const fileNameIndex = headers.indexOf('fileName');
  const downloadedIndex = headers.indexOf('downloaded');
  const expiresIndex = headers.indexOf('expiresOn');
  
  if (codeIndex === -1) return null;
  
  for (let i = 1; i < data.length; i++) {
    const rowCode = data[i][codeIndex];
    
    if (!rowCode && rowCode !== 0) continue;
    
    const searchCode = code.toString().toUpperCase().trim();
    const rowCodeStr = rowCode.toString().toUpperCase().trim();
    
    if (rowCodeStr === searchCode) {
      return {
        rowIndex: i + 1,
        values: {
          code: rowCode,
          fileId: fileIdIndex >= 0 ? data[i][fileIdIndex] : '',
          fileName: fileNameIndex >= 0 ? data[i][fileNameIndex] : '',
          downloaded: downloadedIndex >= 0 ? data[i][downloadedIndex] : false,
          expiresOn: expiresIndex >= 0 ? data[i][expiresIndex] : ''
        }
      };
    }
  }
  return null;
}

// Check if a code is expired
function isExpired(expiresOn) {
  if (!expiresOn) return false;
  
  try {
    const today = new Date();
    const expiryDate = new Date(expiresOn);
    return today > expiryDate;
  } catch (e) {
    return false;
  }
}

// Mark a code as downloaded
function markAsDownloaded(code) {
  const row = findRowByCode(code);
  if (!row) return false;
  
  const sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const downloadedIndex = headers.indexOf('downloaded');
  
  if (downloadedIndex >= 0) {
    sheet.getRange(row.rowIndex, downloadedIndex + 1).setValue(true);
    return true;
  }
  return false;
}

// API function to check if a code is valid and get download URL
function apiLookup(code) {
  if (!code) {
    return { ok: false, error: 'No code provided.' };
  }
  
  const row = findRowByCode(code);
  if (!row) {
    return { ok: false, error: 'Code not found.' };
  }
  
  if (row.values.downloaded === true) {
    return { ok: false, error: 'This code has already been used.' };
  }
  
  if (isExpired(row.values.expiresOn)) {
    return { ok: false, error: 'This code has expired.' };
  }
  
  if (!row.values.fileId) {
    return { ok: false, error: 'Photo not available yet.' };
  }
  
  // Verify the file exists and get direct download URL
  try {
    const file = DriveApp.getFileById(row.values.fileId);
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${file.getId()}`;
    
    // Mark as downloaded
    markAsDownloaded(code);
    
    return {
      ok: true,
      fileName: row.values.fileName || file.getName(),
      downloadUrl: directDownloadUrl,
      message: 'Photo found! Click the download link.'
    };
  } catch (e) {
    Logger.log('API Lookup error: ' + e.toString());
    return { ok: false, error: 'Photo not available. Please check the file ID.' };
  }
}

// Generate sample codes (run this once to populate your sheet)
function generateSampleCodes() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET_NAME);
  
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 5).setValues([['code', 'fileId', 'fileName', 'downloaded', 'expiresOn']]);
  }
  
  const codes = [];
  for (let i = 1; i <= 10; i++) {
    const code = 'SF' + String(i).padStart(4, '0');
    codes.push([code, '', '', false, '']);
  }
  
  if (sheet.getLastRow() > 0) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).clearContent();
  }
  sheet.getRange(2, 1, codes.length, codes[0].length).setValues(codes);
  
  return `${codes.length} sample codes generated!`;
}

// Function to fix file permissions in your folder
function fixFolderPermissions() {
  try {
    const secrets = getSecretConfig();
    const folderId = secrets.folderId;
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    let fixedCount = 0;
    let results = [];
    
    while (files.hasNext()) {
      const file = files.next();
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      results.push({
        file: file.getName(),
        id: file.getId(),
        permission: 'Fixed'
      });
      
      fixedCount++;
    }
    
    return {
      success: true,
      fixedCount: fixedCount,
      results: results
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}