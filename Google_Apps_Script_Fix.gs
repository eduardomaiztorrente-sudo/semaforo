// ============================================================================
// SEMÁFORO - Google Apps Script v8 (CORRECTED)
// Fix: Removed invalid .setHeader() method
// Google Apps Script automatically handles CORS for web app deployments
// ============================================================================

// ============================================================================
// MAIN HANDLERS
// ============================================================================

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'test';
    return handleRequest(action);
  } catch (error) {
    return sendJsonResponse({
      success: false,
      error: 'Error in doGet: ' + error.message
    });
  }
}

function doPost(e) {
  try {
    let action = 'calendar';

    if (e && e.postData && e.postData.contents) {
      const payload = JSON.parse(e.postData.contents);
      action = payload.action || 'calendar';
    } else if (e && e.parameter && e.parameter.action) {
      action = e.parameter.action;
    }

    return handleRequest(action);
  } catch (error) {
    return sendJsonResponse({
      success: false,
      error: 'Error in doPost: ' + error.message
    });
  }
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

function handleRequest(action) {
  switch (action) {
    case 'test':
      return sendJsonResponse({
        success: true,
        message: 'Google Apps Script v8 - Semáforo Backend',
        version: '4.0',
        timestamp: new Date().toISOString()
      });

    case 'calendar':
      return syncCalendar();

    case 'emails':
      return syncEmails();

    case 'tasks':
      return syncTasks();

    default:
      return sendJsonResponse({
        success: false,
        error: 'Acción no reconocida: ' + action
      });
  }
}

// ============================================================================
// SYNC FUNCTIONS - GOOGLE CALENDAR
// ============================================================================

function syncCalendar() {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = calendar.getEvents(now, nextWeek);

    const eventData = events.map(event => ({
      id: event.getId(),
      title: event.getTitle(),
      description: event.getDescription(),
      startTime: event.getStartTime().toISOString(),
      endTime: event.getEndTime().toISOString(),
      isAllDay: event.isAllDayEvent(),
      location: event.getLocation(),
      guests: event.getGuestList().map(guest => ({
        email: guest.getEmail(),
        status: guest.getGuestStatus().toString()
      }))
    }));

    return sendJsonResponse({
      success: true,
      action: 'calendar',
      message: 'Calendario sincronizado correctamente',
      count: eventData.length,
      events: eventData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return sendJsonResponse({
      success: false,
      error: 'Error sincronizando calendario: ' + error.message
    });
  }
}

// ============================================================================
// SYNC FUNCTIONS - GMAIL
// ============================================================================

function syncEmails() {
  try {
    const gmailLabel = 'INBOX';
    const threads = GmailApp.search('label:' + gmailLabel + ' is:unread', 0, 10);

    const emailData = threads.map(thread => {
      const messages = thread.getMessages();
      const lastMessage = messages[messages.length - 1];

      return {
        id: thread.getId(),
        subject: thread.getFirstMessageSubject(),
        from: lastMessage.getFrom(),
        date: lastMessage.getDate().toISOString(),
        snippet: lastMessage.getPlainBody().substring(0, 100),
        messageCount: messages.length,
        isUnread: thread.isUnread()
      };
    });

    return sendJsonResponse({
      success: true,
      action: 'emails',
      message: 'Correos sincronizados correctamente',
      count: emailData.length,
      emails: emailData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return sendJsonResponse({
      success: false,
      error: 'Error sincronizando correos: ' + error.message
    });
  }
}

// ============================================================================
// SYNC FUNCTIONS - GOOGLE TASKS
// ============================================================================

function syncTasks() {
  try {
    const taskLists = Tasks.Tasklists.list().items || [];

    const taskData = [];

    taskLists.forEach(taskList => {
      const tasks = Tasks.Tasks.list(taskList.id).items || [];

      tasks.forEach(task => {
        taskData.push({
          id: task.id,
          taskListId: taskList.id,
          taskListTitle: taskList.title,
          title: task.title,
          notes: task.notes,
          status: task.status,
          dueDate: task.due,
          completed: task.completed,
          updated: task.updated
        });
      });
    });

    return sendJsonResponse({
      success: true,
      action: 'tasks',
      message: 'Tareas sincronizadas correctamente',
      count: taskData.length,
      tasks: taskData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return sendJsonResponse({
      success: false,
      error: 'Error sincronizando tareas: ' + error.message
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sendJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ============================================================================
// DEBUG & LOGGING (Remove in production if needed)
// ============================================================================

function testAllEndpoints() {
  Logger.log('=== TESTING ALL ENDPOINTS ===');

  Logger.log('\n1. Test endpoint:');
  Logger.log(handleRequest('test'));

  Logger.log('\n2. Calendar endpoint:');
  Logger.log(handleRequest('calendar'));

  Logger.log('\n3. Email endpoint:');
  Logger.log(handleRequest('emails'));

  Logger.log('\n4. Tasks endpoint:');
  Logger.log(handleRequest('tasks'));

  Logger.log('\n=== TESTING COMPLETE ===');
}
