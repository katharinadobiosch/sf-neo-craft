import {Form, useActionData, useNavigation} from 'react-router';
import '../styles/withdrawal.scss';

function normalize(value) {
  return String(value ?? '').trim();
}

function escapeHtml(value) {
  return normalize(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendEmail({apiKey, from, to, replyTo, subject, html}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      reply_to: replyTo,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email could not be sent: ${errorText}`);
  }

  return response.json();
}

export async function action({request, context}) {
  const formData = await request.formData();

  // Honeypot gegen einfache Bots
  if (normalize(formData.get('company'))) {
    return Response.json({success: true});
  }

  const name = normalize(formData.get('name'));
  const email = normalize(formData.get('email'));
  const orderNumber = normalize(formData.get('orderNumber'));
  const message = normalize(formData.get('message'));

  const errors = {};

  if (!name) {
    errors.name = 'Please enter your name.';
  }

  if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!orderNumber) {
    errors.orderNumber = 'Please enter your order number.';
  }

  if (Object.keys(errors).length > 0) {
    return Response.json(
      {
        success: false,
        errors,
        values: {name, email, orderNumber, message},
      },
      {status: 400},
    );
  }

  const env = context.env;

  const apiKey = env.RESEND_API_KEY;
  const recipient = env.WITHDRAWAL_RECIPIENT_EMAIL;
  const from =
    env.WITHDRAWAL_FROM_EMAIL || 'NEO/CRAFT <withdrawal@neocraft.com>';

  if (!apiKey || !recipient) {
    console.error('Missing withdrawal email configuration', {
      hasApiKey: Boolean(apiKey),
      hasRecipient: Boolean(recipient),
    });

    return Response.json(
      {
        success: false,
        formError:
          'The withdrawal could not be submitted. Please try again later.',
        values: {name, email, orderNumber, message},
      },
      {status: 500},
    );
  }

  const submittedAt = new Date();
  const submittedAtIso = submittedAt.toISOString();

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeOrderNumber = escapeHtml(orderNumber);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');

  const merchantHtml = `
    <h1>New withdrawal</h1>

    <p>A customer has submitted a withdrawal through the online shop.</p>

    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
      <tr>
        <th align="left">Name</th>
        <td>${safeName}</td>
      </tr>
      <tr>
        <th align="left">Email</th>
        <td>${safeEmail}</td>
      </tr>
      <tr>
        <th align="left">Order number</th>
        <td>${safeOrderNumber}</td>
      </tr>
      <tr>
        <th align="left">Submitted at</th>
        <td>${submittedAtIso}</td>
      </tr>
      ${
        safeMessage
          ? `
            <tr>
              <th align="left">Message</th>
              <td>${safeMessage}</td>
            </tr>
          `
          : ''
      }
    </table>
  `;

  const customerHtml = `
    <h1>Confirmation of your withdrawal</h1>

    <p>Hello ${safeName},</p>

    <p>we confirm that we received your withdrawal.</p>

    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
      <tr>
        <th align="left">Name</th>
        <td>${safeName}</td>
      </tr>
      <tr>
        <th align="left">Order number</th>
        <td>${safeOrderNumber}</td>
      </tr>
      <tr>
        <th align="left">Received at</th>
        <td>${submittedAtIso}</td>
      </tr>
      ${
        safeMessage
          ? `
            <tr>
              <th align="left">Your message</th>
              <td>${safeMessage}</td>
            </tr>
          `
          : ''
      }
    </table>

    <p>This email confirms receipt of your withdrawal request.</p>
  `;

  try {
    await sendEmail({
      apiKey,
      from,
      to: recipient,
      replyTo: email,
      subject: `Withdrawal – order ${orderNumber}`,
      html: merchantHtml,
    });

    await sendEmail({
      apiKey,
      from,
      to: email,
      replyTo: recipient,
      subject: `Confirmation of your withdrawal – order ${orderNumber}`,
      html: customerHtml,
    });

    return Response.json({
      success: true,
      submittedAt: submittedAtIso,
      orderNumber,
    });
  } catch (error) {
    console.error('Withdrawal submission failed', error);

    return Response.json(
      {
        success: false,
        formError:
          'The withdrawal could not be submitted. Please try again later.',
        values: {name, email, orderNumber, message},
      },
      {status: 500},
    );
  }
}

export default function WithdrawalPage() {
  const actionData = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  if (actionData?.success) {
    return (
      <main className="withdrawal-page">
        <section className="withdrawal-card withdrawal-success">
          <h1>Withdrawal received</h1>

          <p>
            Your withdrawal for order <strong>{actionData.orderNumber}</strong>{' '}
            was submitted successfully.
          </p>

          <p>We have sent a confirmation to the email address you provided.</p>
        </section>
      </main>
    );
  }

  const values = actionData?.values ?? {};
  const errors = actionData?.errors ?? {};

  return (
    <main className="withdrawal-page">
      <section className="withdrawal-card">
        <h1>Withdraw from contract</h1>

        <p className="withdrawal-intro">
          Please enter the details of the order you wish to withdraw from.
        </p>

        <Form method="post" className="withdrawal-form">
          <div className="withdrawal-honeypot" aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="withdrawal-field">
            <label htmlFor="name">Name *</label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={values.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              required
            />

            {errors.name && (
              <p id="name-error" className="withdrawal-error">
                {errors.name}
              </p>
            )}
          </div>

          <div className="withdrawal-field">
            <label htmlFor="email">Email address *</label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={values.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              required
            />

            {errors.email && (
              <p id="email-error" className="withdrawal-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="withdrawal-field">
            <label htmlFor="orderNumber">Order number *</label>

            <input
              id="orderNumber"
              name="orderNumber"
              type="text"
              autoComplete="off"
              defaultValue={values.orderNumber}
              aria-invalid={Boolean(errors.orderNumber)}
              aria-describedby={
                errors.orderNumber ? 'order-number-error' : undefined
              }
              required
            />

            {errors.orderNumber && (
              <p id="order-number-error" className="withdrawal-error">
                {errors.orderNumber}
              </p>
            )}
          </div>

          <div className="withdrawal-field">
            <label htmlFor="message">
              Message or affected items (optional)
            </label>

            <textarea
              id="message"
              name="message"
              rows={5}
              defaultValue={values.message}
            />
          </div>

          {actionData?.formError && (
            <p className="withdrawal-form-error" role="alert">
              {actionData.formError}
            </p>
          )}

          <button
            type="submit"
            className="withdrawal-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : 'Confirm withdrawal'}
          </button>

          <p className="withdrawal-note">
            After submitting, you will receive a confirmation by email.
          </p>
        </Form>
      </section>
    </main>
  );
}
