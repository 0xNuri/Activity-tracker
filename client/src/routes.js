const API_URL = 'http://localhost:3001';

export async function listLogEntries() {
    const response = await fetch(`${API_URL}/api/logs`);
    if (!response.ok) throw new Error('Could not load log entries');
    return response.json();
}

export async function createLogEntry(entry) {
    const response = await fetch(`${API_URL}/api/logs`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(entry),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || 'Could not save entry');
    return body;
}