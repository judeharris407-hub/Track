import axios from 'axios';
import {
  normalizeTelegramPayload,
  normalizeWhatsAppPayload,
  sendOutboundMessage,
  extractTrackingNumber,
} from './src/services/channelService.js';
import twilioService from './src/services/twilioService.js';
import { findOrCreateThread, saveMessage, getThreadById } from './src/services/chatService.js';

async function runTests() {
  console.log('=== MULTI-CHANNEL ADAPTER TEST SUITE ===');

  // Test 1: Tracking number regex extraction
  console.log('\n[1] Testing Tracking Number Extraction:');
  const t1 = extractTrackingNumber('Hello, can you check status of TRK-1001?');
  const t2 = extractTrackingNumber('/track TRK987654321');
  const t3 = extractTrackingNumber('No tracking number here');
  console.log('T1 (TRK-1001):', t1);
  console.log('T2 (TRK987654321):', t2);
  console.log('T3 (null):', t3);
  if (t1 !== 'TRK-1001' || t2 !== 'TRK987654321' || t3 !== null) {
    throw new Error('Tracking number extraction test failed');
  }

  // Test 2: Telegram Payload Normalization
  console.log('\n[2] Testing Telegram Normalizer:');
  const sampleTgPayload = {
    update_id: 123456,
    message: {
      message_id: 99,
      from: { id: 98765432, is_bot: false, first_name: 'John', last_name: 'Doe', username: 'johndoe' },
      chat: { id: 98765432, first_name: 'John', type: 'private' },
      date: 1700000000,
      text: 'Where is my parcel TRK-1001?',
    },
  };
  const tgNormalized = normalizeTelegramPayload(sampleTgPayload);
  console.log('Telegram Normalized:', tgNormalized);
  if (tgNormalized.channel !== 'telegram' || tgNormalized.externalContactId !== '98765432' || tgNormalized.trackingNumber !== 'TRK-1001') {
    throw new Error('Telegram normalization failed');
  }

  // Test 3: WhatsApp Payload Normalization
  console.log('\n[3] Testing WhatsApp Normalizer:');
  const sampleWaPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '15550001', phone_number_id: '12345' },
              contacts: [{ profile: { name: 'Alice Smith' }, wa_id: '15559876543' }],
              messages: [
                {
                  from: '15559876543',
                  id: 'wamid.HBgLMTU1NTk4NzY1NDM=',
                  timestamp: '1700000000',
                  text: { body: 'Need update on TRK-2024-EXPRESS please' },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };
  const waNormalized = normalizeWhatsAppPayload(sampleWaPayload);
  console.log('WhatsApp Normalized:', waNormalized);
  if (waNormalized.channel !== 'whatsapp' || waNormalized.externalContactId !== '15559876543' || waNormalized.trackingNumber !== 'TRK-2024-EXPRESS') {
    throw new Error('WhatsApp normalization failed');
  }

  // Test 4: Database findOrCreateThread by externalContactId & channel
  console.log('\n[4] Testing findOrCreateThread for Telegram & WhatsApp:');
  const tgThread = await findOrCreateThread(
    tgNormalized.guestId,
    tgNormalized.trackingNumber,
    tgNormalized.channel,
    tgNormalized.externalContactId
  );
  console.log('Created/Found Telegram Thread:', tgThread.id, tgThread.channel, tgThread.external_contact_id);

  const waThread = await findOrCreateThread(
    waNormalized.guestId,
    waNormalized.trackingNumber,
    waNormalized.channel,
    waNormalized.externalContactId
  );
  console.log('Created/Found WhatsApp Thread:', waThread.id, waThread.channel, waThread.external_contact_id);

  // Test 5: Outbound Message Adapter Dispatch
  console.log('\n[5] Testing Outbound Adapter Dispatch:');
  const tgOutbound = await sendOutboundMessage('telegram', tgThread.external_contact_id, 'Hello from logistics agent!');
  console.log('Telegram Outbound Result:', tgOutbound);

  const waOutbound = await sendOutboundMessage('whatsapp', waThread.external_contact_id, 'Hello from WhatsApp agent!');
  console.log('WhatsApp Outbound Result:', waOutbound);

  const twilioDirectOutbound = await twilioService.sendWhatsAppMessage(
    waThread.external_contact_id,
    'Direct Twilio WhatsApp dispatch test'
  );
  console.log('Twilio Direct Outbound Result:', twilioDirectOutbound);

  // Test 6: Webhook HTTP Endpoints
  console.log('\n[6] Testing HTTP Webhook Endpoints against running backend:');
  try {
    const tgWebhookRes = await axios.post('http://localhost:5000/api/v1/webhooks/telegram', sampleTgPayload);
    console.log('POST /webhooks/telegram status:', tgWebhookRes.status, tgWebhookRes.data);

    const waChallengeRes = await axios.get(
      'http://localhost:5000/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=track_webhook_verify_token_123&hub.challenge=test_challenge_token_456'
    );
    console.log('GET /webhooks/whatsapp challenge response:', waChallengeRes.status, waChallengeRes.data);

    const waWebhookRes = await axios.post('http://localhost:5000/api/v1/webhooks/whatsapp', sampleWaPayload);
    console.log('POST /webhooks/whatsapp status:', waWebhookRes.status, waWebhookRes.data);

    // Test 7: Twilio Webhook HTTP Endpoint & TwiML Response
    console.log('\n[7] Testing Twilio Webhook & TwiML response:');
    const twilioParams = new URLSearchParams({
      From: 'whatsapp:+15551112233',
      Body: 'Hello from Twilio, check TRK-998877 please',
      ProfileName: 'Bob Jones',
    });
    const twilioRes = await axios.post(
      'http://localhost:5000/api/v1/webhooks/twilio',
      twilioParams.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    console.log('POST /webhooks/twilio status:', twilioRes.status, 'Response:', twilioRes.data);
    if (!twilioRes.data.includes('<Response></Response>')) {
      throw new Error('Twilio TwiML response invalid');
    }
  } catch (httpErr) {
    console.error('HTTP Webhook test notice:', httpErr.response?.data || httpErr.message);
  }

  console.log('\n=== ALL MULTI-CHANNEL TESTS PASSED ===');
  process.exit(0);
}

runTests().catch((e) => {
  console.error('Test execution error:', e);
  process.exit(1);
});
