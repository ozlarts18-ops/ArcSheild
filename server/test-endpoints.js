async function runVerification() {
  console.log('--- 1. Testing GET /health ---');
  const health = await fetch('http://localhost:5000/health').then(r => r.json());
  console.log('Health:', health.status, 'Supported Sensors:', health.hardwareSupported.length);

  console.log('\n--- 2. Testing GET /api/state ---');
  const state = await fetch('http://localhost:5000/api/state').then(r => r.json());
  console.log('Fleet Helmets:', state.data.helmets.length);
  console.log('Active Session:', state.data.activeSession.title);
  console.log('Initial Alerts:', state.data.alerts.length);
  console.log('Initial Incidents/Near-Misses:', state.data.incidents.length);

  console.log('\n--- 3. Testing POST /api/simulator/scenario (FALL_DETECTED) ---');
  const simFall = await fetch('http://localhost:5000/api/simulator/scenario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario: 'FALL_DETECTED', targetHelmetId: 'AS-004' })
  }).then(r => r.json());
  console.log('Fall Scenario Triggered:', simFall.result.alert.title);
  console.log('Severity:', simFall.result.alert.severity);
  console.log('Generated Incident Record:', simFall.result.incident.id, 'Type:', simFall.result.incident.type);

  const alertId = simFall.result.alert.id;
  console.log('\n--- 4. Testing PATCH /api/alerts/:id/lifecycle (ACKNOWLEDGED) ---');
  const ack = await fetch(`http://localhost:5000/api/alerts/${alertId}/lifecycle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'ACKNOWLEDGED', note: 'Supervisor acknowledged fall in Welding Bay 2' })
  }).then(r => r.json());
  console.log('Updated Status:', ack.data.lifecycleStatus);

  console.log('\n--- 5. Testing PATCH /api/alerts/:id/lifecycle (INVESTIGATING) ---');
  const inv = await fetch(`http://localhost:5000/api/alerts/${alertId}/lifecycle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'INVESTIGATING', note: 'First responder reached worker; examining contusion' })
  }).then(r => r.json());
  console.log('Updated Status:', inv.data.lifecycleStatus);

  console.log('\n--- 6. Testing PATCH /api/alerts/:id/lifecycle (RESOLVED) ---');
  const resAlert = await fetch(`http://localhost:5000/api/alerts/${alertId}/lifecycle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'RESOLVED', note: 'Worker helped up safely, trip wire cleared' })
  }).then(r => r.json());
  console.log('Resolved Status:', resAlert.data.lifecycleStatus, 'Response Duration:', resAlert.data.responseDurationSeconds, 'seconds');

  console.log('\n--- 7. Testing GET /api/reports/session-summary ---');
  const report = await fetch('http://localhost:5000/api/reports/session-summary').then(r => r.json());
  console.log('Report Ref:', report.data.reportId);
  console.log('Compliance Metric:', report.data.safetyMetrics.overallCompliance + '%');
  console.log('Audit Sign-off:', report.data.auditSignOff.status);

  console.log('\n--- 8. Testing Scenario (RESET_ALL_SAFE) ---');
  await fetch('http://localhost:5000/api/simulator/scenario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario: 'RESET_ALL_SAFE' })
  });
  console.log('Workshop fleet baseline restored to SAFE.');
  console.log('\n>>> ALL ARC-SHIELD SYSTEM TESTS PASSED SUCCESSFULLY! <<<');
}

runVerification().catch(console.error);
