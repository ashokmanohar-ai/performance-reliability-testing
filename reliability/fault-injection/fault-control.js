import { check } from 'k6';
import http from 'k6/http';

const mappingId = '11111111-1111-1111-1111-111111111111';

function responseFor(mode) {
  if (mode === 'success') {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: { transactionId: "{{randomValue type='UUID'}}", status: 'authorised' },
      transformers: ['response-template']
    };
  }
  if (mode === 'slow') {
    return {
      status: 200,
      fixedDelayMilliseconds: 5000,
      jsonBody: { transactionId: 'delayed-transaction' }
    };
  }
  return { status: mode === '500' ? 500 : 503, jsonBody: { error: `controlled-${mode}` } };
}

export function setPaymentFault(stubUrl, mode) {
  if (!stubUrl) throw new Error('PAYMENT_STUB_URL is required for reliability tests.');
  const response = http.put(
    `${stubUrl}/__admin/mappings/${mappingId}`,
    JSON.stringify({
      id: mappingId,
      name: `controlled-payment-${mode}`,
      priority: 1,
      request: { method: 'POST', urlPath: '/payments' },
      response: responseFor(mode),
      metadata: { managedBy: 'performance-reliability-testing' }
    }),
    { headers: { 'content-type': 'application/json' }, tags: { endpoint: 'fault-control' } }
  );
  check(response, {
    [`payment stub changed to ${mode}`]: (value) => value.status === 200 || value.status === 201
  });
  return response;
}
