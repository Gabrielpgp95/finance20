// anaf-api-sim.js
// Simulates the ANAF eFactura upload/approval process for local testing.
// Usage: simulateSubmitToANAF(xmlString, options)
// Options: { simulateError: boolean, simulateReceipt: boolean }

export function simulateSubmitToANAF(xmlString, options = {}) {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      if (options.simulateError) {
        resolve({
          status: 'error',
          message: 'Simulated ANAF error: Invalid XML structure.',
          receipt: null
        });
        return;
      }
      let receipt = null;
      if (options.simulateReceipt) {
        receipt = generateSimulatedReceipt(xmlString);
      }
      resolve({
        status: 'approved',
        message: 'Simulated ANAF approval: Invoice accepted.',
        receipt
      });
    }, 1200);
  });
}

function generateSimulatedReceipt(xmlString) {
  // For demo: return a base64-encoded string as a fake PDF receipt
  // In real use, this could generate a PDF or return a receipt object
  const fakeReceipt = 'JVBERi0xLjQKJcfs...fakebase64...ZW5kc3RyZWFtCmVuZG9iago=';
  return fakeReceipt;
}
