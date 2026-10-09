/**
 * Semáforo Dashboard - Gmail Label Management Script
 * This script manages Gmail labels and creates the dashboard structure
 */

// Initialize Gmail labels structure for semáforo system
function initializeGmailLabels() {
  const gmail = GmailApp;

  // Create main label structure
  const labels = {
    'Incidencias': {
      'Urgentes': null,
      'Normales': null,
      'Resueltas': null
    },
    'Seguimiento': {
      'Pendientes': null,
      'En curso': null,
      'Completadas': null
    }
  };

  createLabelHierarchy('Incidencias', labels['Incidencias']);
  createLabelHierarchy('Seguimiento', labels['Seguimiento']);

  Logger.log('Gmail labels initialized successfully');
}

// Helper function to create label hierarchy
function createLabelHierarchy(parentName, children) {
  const gmail = GmailApp;

  try {
    // Create parent label if it doesn't exist
    const parentLabel = gmail.createLabel(parentName);

    // Create child labels
    for (const childName in children) {
      const fullLabelName = parentName + '/' + childName;
      try {
        gmail.createLabel(fullLabelName);
      } catch (e) {
        // Label might already exist, that's fine
      }
    }
  } catch (e) {
    Logger.log('Label creation error: ' + e.message);
  }
}

// Function to process email threads and apply appropriate labels
function processEmailThreads() {
  const gmail = GmailApp;
  const firestore = getFirestoreService();

  // Get recent incident data from Firestore
  const incidents = firestore.getDocument('incidencias/ultimas');
  const incidentData = incidents.fields.datos.arrayValue.values || [];

  // Get unprocessed threads
  const threads = gmail.getInboxThreads(0, 10);

  for (const thread of threads) {
    const messages = thread.getMessages();
    const firstMessage = messages[0];
    const subject = firstMessage.getSubject().toLowerCase();

    // Check if thread is about incidents
    if (subject.includes('incidencia') || subject.includes('incident')) {
      // Apply appropriate label based on urgency or status
      const urgencyLabel = determineUrgency(subject, firstMessage.getPlainBody());
      thread.addLabel(gmail.getUserLabelByName('Incidencias/' + urgencyLabel));
    }
  }

  Logger.log('Email threads processed');
}

// Determine urgency level from email content
function determineUrgency(subject, body) {
  const lowerSubject = subject.toLowerCase();
  const lowerBody = body.toLowerCase();

  // Check for urgency keywords
  if (lowerSubject.includes('urgente') || lowerBody.includes('urgente') ||
      lowerSubject.includes('crítico') || lowerBody.includes('crítico')) {
    return 'Urgentes';
  } else if (lowerSubject.includes('resuelto') || lowerBody.includes('resuelto')) {
    return 'Resueltas';
  } else {
    return 'Normales';
  }
}

// Get Firestore service
function getFirestoreService() {
  // This requires Firebase Admin SDK integration
  // For now, we'll return a mock object
  return {
    getDocument: function(path) {
      // This would be replaced with actual Firestore API call
      return {
        fields: {
          datos: {
            arrayValue: {
              values: []
            }
          }
        }
      };
    }
  };
}

// Create the semáforo dashboard in Google Sheets
function createSemaforoDashboard() {
  const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const sheet = SpreadsheetApp.getActiveSheet();

  // Set up header row
  sheet.getRange('A1').setValue('Semáforo de Incidencias');
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');

  // Set up column headers
  const headers = ['Fecha Alta', 'Comunidad', 'Propiedad', 'Oficio', 'Proveedor', 'Tipo', 'Asunto', 'Estado'];
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);

  // Format header row
  sheet.getRange(2, 1, 1, headers.length).setBackground('#4285F4').setFontColor('white').setFontWeight('bold');

  // Set column widths
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 100);
  sheet.setColumnWidth(7, 200);
  sheet.setColumnWidth(8, 120);

  // Create data validation for Estado column (status)
  const statusRange = sheet.getRange('H3:H1000');
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'])
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(rule);

  Logger.log('Dashboard created in Google Sheets');
}

// Sync incidents from Firestore to Google Sheets
function syncIncidentsToSheet() {
  // This would be called periodically to update the sheet with latest incidents
  const sheet = SpreadsheetApp.getActiveSheet();

  // TODO: Fetch incidents from Firestore and populate sheet
  // This requires proper Firestore authentication setup
}

// Set up onEdit trigger to update Firestore when sheet changes
function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();

  if (sheet.getName() === 'Sheet1') {
    const row = range.getRow();
    if (row > 2) {
      // Get the entire row data
      const rowData = sheet.getRange(row, 1, 1, 8).getValues()[0];

      // Update Firestore document with the changed data
      // This would require proper Firestore API integration
      Logger.log('Row ' + row + ' updated: ' + JSON.stringify(rowData));
    }
  }
}

// Main function to run the complete setup
function setupSemaforo() {
  initializeGmailLabels();
  createSemaforoDashboard();
  Logger.log('Semáforo system setup complete');
}
