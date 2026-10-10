export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action } = req.query;

  if (!action || !['calendar', 'emails', 'tasks'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action parameter' });
  }

  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUC4VCru6W93Fs1snxXSg8Wwx-PoYLqMCudE4QBh2levJe_Rku3uc6MEmz96qsbaEp1w/exec';

  try {
    // Fetch from Google Apps Script with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const scriptUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=${action}`;

    const response = await fetch(scriptUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
      redirect: 'follow', // Follow redirects
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Google Apps Script returned ${response.status}: ${response.statusText}`);
      return res.status(response.status).json({
        error: `Google Apps Script error: ${response.statusText}`,
        action: action
      });
    }

    const data = await response.json();

    // Validate response structure based on action
    const validResponse = {
      calendar: data && typeof data === 'object' && (data.success || data.events),
      emails: data && typeof data === 'object' && (data.success || data.emails),
      tasks: data && typeof data === 'object' && (data.success || data.tasks),
    };

    if (!validResponse[action]) {
      console.warn(`Invalid response format for action: ${action}`, data);
      return res.status(200).json({
        success: true,
        [action === 'calendar' ? 'events' : action]: [],
        warning: 'Empty or invalid response from Google Apps Script'
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching ${action} from Google Apps Script:`, error.message);

    // Return empty data instead of error to gracefully degrade
    const emptyResponse = {
      calendar: { success: true, events: [] },
      emails: { success: true, emails: [] },
      tasks: { success: true, tasks: [] },
    };

    return res.status(200).json(emptyResponse[action] || { success: false, error: error.message });
  }
}
